#!/usr/bin/env python3
"""
This script computes access windows for a satellite over a given ground location using Skyfield and a TLE.
Can be used as a command-line tool or imported as a module.
"""
import argparse
import sys
import json
from skyfield.api import EarthSatellite, load, wgs84
from datetime import datetime, timedelta


def compute_access_windows(lat, lon, tle_lines, start_utc, end_utc, elevation_deg=10.0, step_seconds=30):
    """
    Compute detailed access windows for a satellite over a ground location.
    
    Args:
        lat, lon: Latitude and longitude of the ground location (degrees)
        tle_lines: List of two TLE lines (strings)
        start_utc, end_utc: Start and end datetime (UTC, as datetime.datetime)
        elevation_deg: Minimum elevation angle in degrees (default: 10.0)
        step_seconds: Time step in seconds (default: 30)
    
    Returns:
        List of dictionaries with access window events:
        [{
            'access_start': datetime,
            'access_end': datetime,
            'culmination': datetime,
            'max_elevation': float,
            'events': [
                {'time': datetime, 'event_type': 'access_start', 'elevation': float, 'azimuth': float},
                {'time': datetime, 'event_type': 'culmination', 'elevation': float, 'azimuth': float},
                {'time': datetime, 'event_type': 'access_end', 'elevation': float, 'azimuth': float}
            ]
        }]
    """
    try:
        ts = load.timescale()
        satellite = EarthSatellite(tle_lines[0], tle_lines[1], 'SAT', ts)
        location = wgs84.latlon(lat, lon)
        
        # Generate time steps
        time_list = []
        t = start_utc
        while t <= end_utc:
            time_list.append(ts.utc(t.year, t.month, t.day, t.hour, t.minute, t.second))
            t += timedelta(seconds=step_seconds)

        if not time_list:
            return []

        # Compute positions and elevations for each time step
        positions = []
        for time_point in time_list:
            # Calculate topocentric coordinates (satellite position as seen from ground station)
            difference = satellite - location
            topocentric = difference.at(time_point)
            alt, az, distance = topocentric.altaz()
            positions.append({
                'time': time_point.utc_datetime().replace(tzinfo=None),
                'elevation': alt.degrees,
                'azimuth': az.degrees,
                'distance': distance.km
            })

        # Find detailed access windows with events
        access_windows = []
        in_access = False
        access_start_idx = None
        
        for i, pos in enumerate(positions):
            if pos['elevation'] >= elevation_deg:
                if not in_access:
                    # Start of access window
                    in_access = True
                    access_start_idx = i
            else:
                if in_access:
                    # End of access window
                    in_access = False
                    access_end_idx = i - 1
                    
                    if access_start_idx is not None and access_end_idx >= access_start_idx:
                        # Find culmination point (maximum elevation) within this window
                        window_positions = positions[access_start_idx:access_end_idx+1]
                        max_elevation_pos = max(window_positions, key=lambda p: p['elevation'])
                        culmination_idx = access_start_idx + window_positions.index(max_elevation_pos)
                        
                        # Create detailed access window with events
                        access_window = {
                            'access_start': positions[access_start_idx]['time'],
                            'access_end': positions[access_end_idx]['time'],
                            'culmination': positions[culmination_idx]['time'],
                            'max_elevation': max_elevation_pos['elevation'],
                            'events': [
                                {
                                    'time': positions[access_start_idx]['time'],
                                    'event_type': 'access_start',
                                    'elevation': positions[access_start_idx]['elevation'],
                                    'azimuth': positions[access_start_idx]['azimuth']
                                },
                                {
                                    'time': positions[culmination_idx]['time'],
                                    'event_type': 'culmination',
                                    'elevation': positions[culmination_idx]['elevation'],
                                    'azimuth': positions[culmination_idx]['azimuth']
                                },
                                {
                                    'time': positions[access_end_idx]['time'],
                                    'event_type': 'access_end',
                                    'elevation': positions[access_end_idx]['elevation'],
                                    'azimuth': positions[access_end_idx]['azimuth']
                                }
                            ]
                        }
                        access_windows.append(access_window)
                    access_start_idx = None
                    
        # If still in access at the end of time period
        if in_access and access_start_idx is not None:
            access_end_idx = len(positions) - 1
            
            # Find culmination point within this window
            window_positions = positions[access_start_idx:access_end_idx+1]
            max_elevation_pos = max(window_positions, key=lambda p: p['elevation'])
            culmination_idx = access_start_idx + window_positions.index(max_elevation_pos)
            
            access_window = {
                'access_start': positions[access_start_idx]['time'],
                'access_end': positions[access_end_idx]['time'],
                'culmination': positions[culmination_idx]['time'],
                'max_elevation': max_elevation_pos['elevation'],
                'events': [
                    {
                        'time': positions[access_start_idx]['time'],
                        'event_type': 'access_start',
                        'elevation': positions[access_start_idx]['elevation'],
                        'azimuth': positions[access_start_idx]['azimuth']
                    },
                    {
                        'time': positions[culmination_idx]['time'],
                        'event_type': 'culmination',
                        'elevation': positions[culmination_idx]['elevation'],
                        'azimuth': positions[culmination_idx]['azimuth']
                    },
                    {
                        'time': positions[access_end_idx]['time'],
                        'event_type': 'access_end',
                        'elevation': positions[access_end_idx]['elevation'],
                        'azimuth': positions[access_end_idx]['azimuth']
                    }
                ]
            }
            access_windows.append(access_window)
                
        return access_windows
        
    except Exception as e:
        print(f"Error in access window calculation: {e}", file=sys.stderr)
        return []


def compute_access_windows_legacy(lat, lon, tle_lines, start_utc, end_utc, elevation_deg=10.0, step_seconds=30):
    """
    Legacy function that returns simple (start, end) tuples for backward compatibility.
    """
    detailed_windows = compute_access_windows(lat, lon, tle_lines, start_utc, end_utc, elevation_deg, step_seconds)
    return [(window['access_start'], window['access_end']) for window in detailed_windows]


def compute_access_events(lat, lon, tle_lines, start_utc, end_utc, satellite_id=None, location_id=None, location_type='ground_station', elevation_deg=10.0, step_seconds=30):
    """
    Compute access window events for storage in InfluxDB with satellite and location metadata.
    
    Args:
        lat, lon: Latitude and longitude of the ground location (degrees)
        tle_lines: List of two TLE lines (strings)
        start_utc, end_utc: Start and end datetime (UTC, as datetime.datetime)
        satellite_id: Satellite identifier (for InfluxDB tagging)
        location_id: Ground station or target identifier (for InfluxDB tagging)
        location_type: 'ground_station' or 'target' (for InfluxDB tagging)
        elevation_deg: Minimum elevation angle in degrees (default: 10.0)
        step_seconds: Time step in seconds (default: 30)
    
    Returns:
        List of event dictionaries suitable for InfluxDB storage:
        [{
            'time': datetime,
            'event_type': 'access_start'|'culmination'|'access_end',
            'satellite_id': str,
            'location_id': str,
            'location_type': str,
            'elevation': float,
            'azimuth': float,
            'window_duration_minutes': float (only for access_start events),
            'max_elevation': float (only for access_start events)
        }]
    """
    try:
        detailed_windows = compute_access_windows(lat, lon, tle_lines, start_utc, end_utc, elevation_deg, step_seconds)
        events = []
        
        for window in detailed_windows:
            window_duration = (window['access_end'] - window['access_start']).total_seconds() / 60.0
            
            for event in window['events']:
                event_data = {
                    'time': event['time'],
                    'event_type': event['event_type'],
                    'satellite_id': str(satellite_id) if satellite_id is not None else None,
                    'location_id': str(location_id) if location_id is not None else None,
                    'location_type': location_type,
                    'elevation': event['elevation'],
                    'azimuth': event['azimuth']
                }
                
                # Add window-level metadata to access_start events
                if event['event_type'] == 'access_start':
                    event_data['window_duration_minutes'] = window_duration
                    event_data['max_elevation'] = window['max_elevation']
                
                events.append(event_data)
        
        return events
        
    except Exception as e:
        print(f"Error in access event calculation: {e}", file=sys.stderr)
        return []


def main():
    """Command-line interface for access window calculation."""
    parser = argparse.ArgumentParser(description='Calculate satellite access windows')
    parser.add_argument('--lat', type=float, required=True, help='Latitude in degrees')
    parser.add_argument('--lon', type=float, required=True, help='Longitude in degrees')
    parser.add_argument('--tle1', type=str, required=True, help='First TLE line')
    parser.add_argument('--tle2', type=str, required=True, help='Second TLE line')
    parser.add_argument('--start_utc', type=str, required=True, help='Start time in ISO format')
    parser.add_argument('--end_utc', type=str, required=True, help='End time in ISO format')
    parser.add_argument('--elevation_deg', type=float, default=10.0, help='Minimum elevation in degrees')
    parser.add_argument('--step_seconds', type=int, default=30, help='Time step in seconds')
    parser.add_argument('--output_format', type=str, choices=['legacy', 'detailed', 'events'], default='legacy', 
                       help='Output format: legacy (start->end), detailed (JSON), or events (for InfluxDB)')
    parser.add_argument('--satellite_id', type=str, help='Satellite ID (for events output)')
    parser.add_argument('--location_id', type=str, help='Location ID (for events output)')
    parser.add_argument('--location_type', type=str, choices=['ground_station', 'target'], default='ground_station',
                       help='Location type (for events output)')
    
    args = parser.parse_args()
    
    try:
        # Parse datetime strings
        start_utc = datetime.fromisoformat(args.start_utc.replace('Z', '+00:00')).replace(tzinfo=None)
        end_utc = datetime.fromisoformat(args.end_utc.replace('Z', '+00:00')).replace(tzinfo=None)
        
        tle_lines = [args.tle1, args.tle2]
        
        if args.output_format == 'legacy':
            # Legacy output format for backward compatibility
            windows = compute_access_windows_legacy(
                args.lat, args.lon, tle_lines, start_utc, end_utc, 
                args.elevation_deg, args.step_seconds
            )
            for start, end in windows:
                print(f"{start.isoformat()} -> {end.isoformat()}")
                
        elif args.output_format == 'detailed':
            # Detailed JSON output with all event information
            windows = compute_access_windows(
                args.lat, args.lon, tle_lines, start_utc, end_utc, 
                args.elevation_deg, args.step_seconds
            )
            # Convert datetime objects to ISO strings for JSON serialization
            for window in windows:
                window['access_start'] = window['access_start'].isoformat()
                window['access_end'] = window['access_end'].isoformat()
                window['culmination'] = window['culmination'].isoformat()
                for event in window['events']:
                    event['time'] = event['time'].isoformat()
            print(json.dumps(windows, indent=2))
            
        elif args.output_format == 'events':
            # Events format for InfluxDB storage
            events = compute_access_events(
                args.lat, args.lon, tle_lines, start_utc, end_utc,
                args.satellite_id, args.location_id, args.location_type,
                args.elevation_deg, args.step_seconds
            )
            # Convert datetime objects to ISO strings for JSON serialization
            for event in events:
                event['time'] = event['time'].isoformat()
            print(json.dumps(events, indent=2))
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()