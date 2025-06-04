#!/usr/bin/env python3
"""
Access Window Initialization Script

This script runs on container startup to:
1. Fetch all ground stations and satellites from PostgreSQL
2. Calculate access windows for the next 3 days for all combinations
3. Store results in InfluxDB with proper tagging for sorting by Ground Station or Satellite
"""

import os
import sys
import time
import psycopg2
from datetime import datetime, timedelta
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Import the access window calculation function
sys.path.append('/app/satellite')
from accesswindow import compute_access_windows


def get_database_connection():
    """Connect to PostgreSQL database"""
    max_retries = 30
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST', 'backend'),
                database=os.getenv('POSTGRES_DB', 'missionplanning'),
                user=os.getenv('POSTGRES_USER', 'missionuser'),
                password=os.getenv('POSTGRES_PASSWORD', 'missionpass'),
                port=os.getenv('POSTGRES_PORT', 5432)
            )
            print(f"Successfully connected to PostgreSQL on attempt {attempt + 1}")
            return conn
        except psycopg2.OperationalError as e:
            print(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise


def get_influxdb_client():
    """Connect to InfluxDB"""
    max_retries = 30
    retry_delay = 2
    
    url = os.getenv('INFLUXDB_URL', 'http://influxdb:8086')
    token = os.getenv('INFLUXDB_TOKEN', 'mission-token-12345')
    org = os.getenv('INFLUXDB_ORG', 'missionplanning')
    
    for attempt in range(max_retries):
        try:
            client = InfluxDBClient(url=url, token=token, org=org)
            # Test the connection
            client.ping()
            print(f"Successfully connected to InfluxDB on attempt {attempt + 1}")
            return client
        except Exception as e:
            print(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise


def fetch_ground_stations(conn):
    """Fetch all ground stations from database"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT gs_id, name, latitude, longitude, altitude 
        FROM ground_station 
        ORDER BY name
    """)
    return cursor.fetchall()


def fetch_satellites(conn):
    """Fetch all satellites from database"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT satellite_id, name, mission, tle_1, tle_2 
        FROM satellite 
        ORDER BY name
    """)
    return cursor.fetchall()


def calculate_and_store_access_windows():
    """Main function to calculate and store all access windows"""
    print("Starting access window calculation...")
    
    # Connect to databases
    pg_conn = get_database_connection()
    influx_client = get_influxdb_client()
    
    try:
        # Get write API
        write_api = influx_client.write_api(write_options=SYNCHRONOUS)
        bucket = os.getenv('INFLUXDB_BUCKET', 'accesswindows')
        org = os.getenv('INFLUXDB_ORG', 'missionplanning')
        
        # Fetch ground stations and satellites
        ground_stations = fetch_ground_stations(pg_conn)
        satellites = fetch_satellites(pg_conn)
        
        print(f"Found {len(ground_stations)} ground stations and {len(satellites)} satellites")
        
        # Calculate 3 days in advance
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(days=3)
        
        print(f"Calculating access windows from {start_time} to {end_time}")
        
        total_combinations = len(ground_stations) * len(satellites)
        processed = 0
        
        # Process each ground station - satellite combination
        for gs_id, gs_name, gs_lat, gs_lon, gs_alt in ground_stations:
            for sat_id, sat_name, sat_mission, tle_1, tle_2 in satellites:
                try:
                    print(f"Processing {gs_name} -> {sat_name} ({processed + 1}/{total_combinations})")
                    
                    # Calculate access windows
                    tle_lines = [tle_1, tle_2]
                    access_windows = compute_access_windows(
                        lat=float(gs_lat),
                        lon=float(gs_lon),
                        tle_lines=tle_lines,
                        start_utc=start_time,
                        end_utc=end_time,
                        elevation_deg=10.0,
                        step_seconds=30
                    )
                    
                    # Store each access window in InfluxDB
                    for window_start, window_end in access_windows:
                        duration_minutes = (window_end - window_start).total_seconds() / 60
                        
                        # Create point with tags for easy sorting
                        point = Point("access_window") \
                            .tag("ground_station_id", str(gs_id)) \
                            .tag("ground_station_name", gs_name) \
                            .tag("satellite_id", str(sat_id)) \
                            .tag("satellite_name", sat_name) \
                            .tag("satellite_mission", sat_mission) \
                            .field("duration_minutes", duration_minutes) \
                            .field("start_time", window_start.isoformat()) \
                            .field("end_time", window_end.isoformat()) \
                            .field("ground_station_lat", float(gs_lat)) \
                            .field("ground_station_lon", float(gs_lon)) \
                            .field("ground_station_alt", float(gs_alt)) \
                            .time(window_start)
                        
                        write_api.write(bucket=bucket, org=org, record=point)
                    
                    print(f"  Found {len(access_windows)} access windows")
                    processed += 1
                    
                except Exception as e:
                    print(f"Error processing {gs_name} -> {sat_name}: {e}")
                    processed += 1
                    continue
        
        print(f"Completed processing {processed}/{total_combinations} combinations")
        print("Access window calculation completed successfully!")
        
    except Exception as e:
        print(f"Error in main processing: {e}")
        sys.exit(1)
    finally:
        pg_conn.close()
        influx_client.close()


if __name__ == "__main__":
    calculate_and_store_access_windows()