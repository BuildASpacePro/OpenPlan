#!/usr/bin/env python3
"""
Satellite position calculation using Skyfield library.
Calculates satellite positions for specified time periods and stores in Redis.
"""

import json
import redis
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from skyfield.api import load, EarthSatellite, utc
from skyfield.timelib import Time
import sys
import os

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SatellitePositionCalculator:
    def __init__(self, redis_host='redis', redis_port=6379, redis_db=0):
        """Initialize the satellite position calculator with Redis connection."""
        try:
            self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=redis_db, decode_responses=True)
            # Test Redis connection
            self.redis_client.ping()
            logger.info(f"Connected to Redis at {redis_host}:{redis_port}")
        except redis.ConnectionError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
            
        # Load timescale data for accurate time calculations
        self.ts = load.timescale()
        logger.info("Skyfield timescale loaded successfully")
    
    def create_earth_satellite(self, tle_line1: str, tle_line2: str, name: str) -> EarthSatellite:
        """Create an EarthSatellite object from TLE data."""
        try:
            satellite = EarthSatellite(tle_line1, tle_line2, name, self.ts)
            logger.info(f"Created EarthSatellite for {name}")
            return satellite
        except Exception as e:
            logger.error(f"Failed to create satellite {name}: {e}")
            raise
    
    def calculate_positions(self, satellite: EarthSatellite, start_time: datetime, 
                          duration_minutes: int = 270, interval_seconds: int = 60) -> List[Dict[str, Any]]:
        """
        Calculate satellite positions over a specified time period.
        
        Args:
            satellite: EarthSatellite object
            start_time: Start time for calculations
            duration_minutes: Duration in minutes (default 270 = 4.5 hours)
            interval_seconds: Time interval between calculations (default 60 seconds)
            
        Returns:
            List of position dictionaries with timestamp, lat, lon, altitude
        """
        positions = []
        end_time = start_time + timedelta(minutes=duration_minutes)
        current_time = start_time
        
        logger.info(f"Calculating positions for {satellite.name} from {start_time} to {end_time}")
        
        while current_time <= end_time:
            try:
                # Convert datetime to UTC timezone-aware datetime for Skyfield
                utc_time = current_time.replace(tzinfo=utc)
                t = self.ts.from_datetime(utc_time)
                
                # Calculate geocentric position
                geocentric = satellite.at(t)
                
                # Get latitude, longitude, and altitude
                subpoint = geocentric.subpoint()
                
                position = {
                    'timestamp': current_time.isoformat(),
                    'latitude': subpoint.latitude.degrees,
                    'longitude': subpoint.longitude.degrees,
                    'altitude_km': subpoint.elevation.km,
                    'unix_timestamp': int(current_time.timestamp())
                }
                
                positions.append(position)
                
            except Exception as e:
                logger.warning(f"Failed to calculate position for {satellite.name} at {current_time}: {e}")
                # Add null position to maintain time consistency
                positions.append({
                    'timestamp': current_time.isoformat(),
                    'latitude': None,
                    'longitude': None,
                    'altitude_km': None,
                    'unix_timestamp': int(current_time.timestamp()),
                    'error': str(e)
                })
            
            current_time += timedelta(seconds=interval_seconds)
        
        logger.info(f"Calculated {len(positions)} positions for {satellite.name}")
        return positions
    
    def store_positions_in_redis(self, satellite_id: int, satellite_name: str, 
                               positions: List[Dict[str, Any]], ttl_seconds: int = 10800) -> None:
        """
        Store satellite positions in Redis with expiration.
        
        Args:
            satellite_id: Database ID of the satellite
            satellite_name: Name of the satellite
            positions: List of position dictionaries
            ttl_seconds: Time to live in seconds (default 10800 = 3 hours)
        """
        try:
            redis_key = f"satellite_positions:{satellite_id}"
            
            # Store positions data
            positions_data = {
                'satellite_id': satellite_id,
                'satellite_name': satellite_name,
                'positions': positions,
                'calculated_at': datetime.utcnow().isoformat(),
                'total_positions': len(positions)
            }
            
            # Convert to JSON and store in Redis
            self.redis_client.setex(
                redis_key, 
                ttl_seconds, 
                json.dumps(positions_data, default=str)
            )
            
            # Also store current position for quick access
            current_position = self.get_current_position(positions)
            if current_position:
                current_key = f"satellite_current:{satellite_id}"
                self.redis_client.setex(
                    current_key,
                    ttl_seconds,
                    json.dumps({
                        'satellite_id': satellite_id,
                        'satellite_name': satellite_name,
                        'position': current_position,
                        'updated_at': datetime.utcnow().isoformat()
                    }, default=str)
                )
            
            logger.info(f"Stored {len(positions)} positions for satellite {satellite_name} (ID: {satellite_id}) in Redis")
            
        except Exception as e:
            logger.error(f"Failed to store positions in Redis for satellite {satellite_name}: {e}")
            raise
    
    def get_current_position(self, positions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Get the position closest to current time."""
        if not positions:
            return None
            
        current_time = datetime.utcnow()
        closest_position = None
        min_time_diff = float('inf')
        
        for pos in positions:
            try:
                pos_time = datetime.fromisoformat(pos['timestamp'].replace('Z', ''))
                time_diff = abs((current_time - pos_time).total_seconds())
                
                if time_diff < min_time_diff and pos.get('latitude') is not None:
                    min_time_diff = time_diff
                    closest_position = pos
            except Exception as e:
                logger.warning(f"Error processing position timestamp: {e}")
                continue
        
        return closest_position
    
    def get_positions_from_redis(self, satellite_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve satellite positions from Redis."""
        try:
            redis_key = f"satellite_positions:{satellite_id}"
            data = self.redis_client.get(redis_key)
            
            if data:
                return json.loads(data)
            else:
                logger.info(f"No cached positions found for satellite {satellite_id}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to retrieve positions from Redis for satellite {satellite_id}: {e}")
            return None
    
    def get_current_position_from_redis(self, satellite_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve current satellite position from Redis."""
        try:
            current_key = f"satellite_current:{satellite_id}"
            data = self.redis_client.get(current_key)
            
            if data:
                return json.loads(data)
            else:
                logger.info(f"No cached current position found for satellite {satellite_id}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to retrieve current position from Redis for satellite {satellite_id}: {e}")
            return None
    
    def calculate_and_store_satellite_positions(self, satellite_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate and store positions for multiple satellites.
        
        Args:
            satellite_data: List of satellite dictionaries with id, name, tle_1, tle_2
            
        Returns:
            Summary of the operation
        """
        start_time = datetime.utcnow()
        results = {
            'started_at': start_time.isoformat(),
            'satellites_processed': 0,
            'satellites_failed': 0,
            'total_positions_calculated': 0,
            'errors': []
        }
        
        logger.info(f"Starting position calculations for {len(satellite_data)} satellites")
        
        for sat_data in satellite_data:
            try:
                satellite_id = sat_data['satellite_id']
                satellite_name = sat_data['name']
                tle_line1 = sat_data['tle_1']
                tle_line2 = sat_data['tle_2']
                
                logger.info(f"Processing satellite: {satellite_name} (ID: {satellite_id})")
                
                # Create EarthSatellite object
                satellite = self.create_earth_satellite(tle_line1, tle_line2, satellite_name)
                
                # Calculate positions
                positions = self.calculate_positions(satellite, start_time)
                
                # Store in Redis
                self.store_positions_in_redis(satellite_id, satellite_name, positions)
                
                results['satellites_processed'] += 1
                results['total_positions_calculated'] += len(positions)
                
            except Exception as e:
                error_msg = f"Failed to process satellite {sat_data.get('name', 'Unknown')}: {str(e)}"
                logger.error(error_msg)
                results['errors'].append(error_msg)
                results['satellites_failed'] += 1
        
        results['completed_at'] = datetime.utcnow().isoformat()
        results['duration_seconds'] = (datetime.utcnow() - start_time).total_seconds()
        
        logger.info(f"Position calculation completed. Processed: {results['satellites_processed']}, "
                   f"Failed: {results['satellites_failed']}, "
                   f"Total positions: {results['total_positions_calculated']}")
        
        return results

def main():
    """Main function for calculating satellite positions from database data."""
    try:
        # Check for command line argument (satellite data file)
        if len(sys.argv) != 2:
            # Test mode - use test satellite data
            logger.info("Running in test mode with Hubble Space Telescope data")
            test_satellite = {
                'satellite_id': 1,
                'name': 'Hubble Space Telescope',
                'tle_1': '1 20580U 90037B   21001.00000000  .00000000  00000-0  00000-0 0  9990',
                'tle_2': '2 20580  28.4684 339.3906 0002650 321.7771  38.2505 15.09227413123456'
            }
            satellite_data = [test_satellite]
        else:
            # Production mode - read satellite data from file
            data_file = sys.argv[1]
            logger.info(f"Reading satellite data from {data_file}")
            
            with open(data_file, 'r') as f:
                satellite_data = json.load(f)
            
            logger.info(f"Loaded {len(satellite_data)} satellites from file")
        
        calculator = SatellitePositionCalculator()
        
        # Calculate and store positions
        results = calculator.calculate_and_store_satellite_positions(satellite_data)
        
        # Output results as JSON for Node.js to parse
        print(json.dumps(results, default=str))
            
    except Exception as e:
        logger.error(f"Main function failed: {e}")
        error_result = {
            'status': 'failed',
            'error': str(e),
            'satellites_processed': 0,
            'satellites_failed': 1
        }
        print(json.dumps(error_result, default=str))
        sys.exit(1)

if __name__ == "__main__":
    main()