"""
This script provides a function to compute access windows for a satellite over a given ground location using Skyfield and a TLE.
Inputs:
    - lat, lon: Latitude and longitude of the ground location (degrees)
    - tle_lines: List of two TLE lines (strings)
    - start_utc, end_utc: Start and end datetime (UTC, as datetime.datetime)
Returns:
    - List of (access_start, access_end) tuples (UTC datetimes) when the satellite is above the horizon.
"""
from skyfield.api import EarthSatellite, load, wgs84
from datetime import datetime, timedelta


def compute_access_windows(lat, lon, tle_lines, start_utc, end_utc, elevation_deg=10.0, step_seconds=30):
    ts = load.timescale()
    satellite = EarthSatellite(tle_lines[0], tle_lines[1], 'SAT', ts)
    location = wgs84.latlon(lat, lon)
    
    # Generate time steps
    times = []
    t = start_utc
    while t <= end_utc:
        times.append(ts.utc(t.year, t.month, t.day, t.hour, t.minute, t.second))
        t += timedelta(seconds=step_seconds)

    # Compute altitudes
    altitudes = satellite.at(times).observe(location).apparent().altaz()[0].degrees

    # Find access windows
    access_windows = []
    in_access = False
    access_start = None
    for i, alt in enumerate(altitudes):
        if alt >= elevation_deg:
            if not in_access:
                in_access = True
                access_start = times[i].utc_datetime().replace(tzinfo=None)
        else:
            if in_access:
                in_access = False
                access_end = times[i-1].utc_datetime().replace(tzinfo=None)
                access_windows.append((access_start, access_end))
    # If still in access at the end
    if in_access:
        access_end = times[-1].utc_datetime().replace(tzinfo=None)
        access_windows.append((access_start, access_end))
    return access_windows

# Example usage (remove or adapt for API integration):
# lat, lon = 51.5, -0.1
# tle_lines = [
#     "1 25544U 98067A   24151.51041667  .00002182  00000-0  46413-4 0  9992",
#     "2 25544  51.6412  21.2345 0004062  80.1234  45.6789 15.50000000 12345"
# ]
# start_utc = datetime(2024, 6, 1, 0, 0, 0)
# end_utc = datetime(2024, 6, 1, 6, 0, 0)
# windows = compute_access_windows(lat, lon, tle_lines, start_utc, end_utc)
# print(windows)