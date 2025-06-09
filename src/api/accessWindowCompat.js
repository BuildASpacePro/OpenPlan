// Access Window Compatibility Layer
// Converts new event-based InfluxDB data to legacy window format for frontend compatibility

const { InfluxDB } = require('@influxdata/influxdb-client');

// InfluxDB configuration
const influxConfig = {
  url: process.env.INFLUXDB_URL || 'http://influxdb:8086',
  token: process.env.INFLUXDB_TOKEN || 'mission-token-12345',
  org: process.env.INFLUXDB_ORG || 'missionplanning',
  bucket: process.env.INFLUXDB_BUCKET || 'accesswindows'
};

const influxClient = new InfluxDB({
  url: influxConfig.url,
  token: influxConfig.token
});

const queryApi = influxClient.getQueryApi(influxConfig.org);

/**
 * Convert access events to legacy window format
 * @param {Array} events - Array of access events from InfluxDB
 * @returns {Array} Array of access windows in legacy format
 */
function convertEventsToWindows(events) {
  const windows = [];
  const eventsByWindow = {};
  
  // Group events by window (using satellite_id + location_id + access_start time)
  events.forEach(event => {
    if (event.event_type === 'access_start') {
      const windowKey = `${event.satellite_id}_${event.location_id}_${event._time}`;
      eventsByWindow[windowKey] = {
        start_time: event._time,
        end_time: null,
        duration_minutes: event.window_duration_minutes,
        max_elevation: event.max_elevation,
        satellite_id: event.satellite_id,
        satellite_name: event.satellite_name,
        satellite_mission: event.satellite_mission,
        location_id: event.location_id,
        location_name: event.location_name,
        location_type: event.location_type,
        // Include location-specific fields
        ...(event.location_type === 'ground_station' ? {
          ground_station_id: event.location_id,
          ground_station_name: event.location_name,
          ground_station_lat: event.ground_station_lat,
          ground_station_lon: event.ground_station_lon,
          ground_station_alt: event.ground_station_alt
        } : {
          target_id: event.location_id,
          target_name: event.location_name,
          target_type: event.target_type,
          target_priority: event.target_priority,
          target_status: event.target_status,
          target_lat: event.target_lat,
          target_lon: event.target_lon
        })
      };
    }
  });
  
  // Find corresponding access_end events
  events.forEach(event => {
    if (event.event_type === 'access_end') {
      // Find the matching window by looking for access_start events with same satellite/location
      // and finding the closest one in time
      const matchingWindows = Object.keys(eventsByWindow).filter(key => {
        const window = eventsByWindow[key];
        return window.satellite_id === event.satellite_id && 
               window.location_id === event.location_id &&
               new Date(event._time) > new Date(window.start_time);
      });
      
      if (matchingWindows.length > 0) {
        // Find the closest access_start event
        const closestWindow = matchingWindows.reduce((closest, current) => {
          const currentWindow = eventsByWindow[current];
          const closestWindow = eventsByWindow[closest];
          const currentDiff = new Date(event._time) - new Date(currentWindow.start_time);
          const closestDiff = new Date(event._time) - new Date(closestWindow.start_time);
          return currentDiff < closestDiff ? current : closest;
        });
        
        eventsByWindow[closestWindow].end_time = event._time;
      }
    }
  });
  
  // Convert to array and filter out incomplete windows
  Object.values(eventsByWindow).forEach(window => {
    if (window.end_time) {
      windows.push(window);
    }
  });
  
  return windows.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
}

/**
 * Query access events from InfluxDB and convert to legacy window format
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Promise resolving to array of access windows
 */
async function queryAccessWindows(filters = {}) {
  const { satellite_id, ground_station_id, target_id, location_type, start_time, end_time } = filters;
  
  try {
    let filterConditions = [];
    
    if (satellite_id) {
      filterConditions.push(`|> filter(fn: (r) => r.satellite_id == "${satellite_id}")`);
    }
    
    if (ground_station_id || (location_type === 'ground_station' && !target_id)) {
      filterConditions.push(`|> filter(fn: (r) => r.location_type == "ground_station")`);
      if (ground_station_id) {
        filterConditions.push(`|> filter(fn: (r) => r.location_id == "${ground_station_id}")`);
      }
    }
    
    if (target_id || (location_type === 'target' && !ground_station_id)) {
      filterConditions.push(`|> filter(fn: (r) => r.location_type == "target")`);
      if (target_id) {
        filterConditions.push(`|> filter(fn: (r) => r.location_id == "${target_id}")`);
      }
    }
    
    const timeRange = start_time && end_time ? 
      `range(start: ${start_time}, stop: ${end_time})` : 
      'range(start: -3d)';
    
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> ${timeRange}
        |> filter(fn: (r) => r._measurement == "access_event")
        |> filter(fn: (r) => r.event_type == "access_start" or r.event_type == "access_end")
        ${filterConditions.join('\n        ')}
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"])
    `;
    
    const events = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const event = tableMeta.toObject(row);
          events.push(event);
        },
        error(error) {
          console.error('InfluxDB query error:', error);
          reject(error);
        },
        complete() {
          const windows = convertEventsToWindows(events);
          resolve(windows);
        }
      });
    });
  } catch (error) {
    console.error('Error querying access windows:', error);
    throw error;
  }
}

/**
 * Get access windows for a specific satellite (legacy format)
 */
async function getAccessWindowsForSatellite(satelliteId, filters = {}) {
  const windows = await queryAccessWindows({
    satellite_id: satelliteId,
    ...filters
  });
  
  return {
    satellite_id: parseInt(satelliteId),
    access_windows: windows,
    total_windows: windows.length
  };
}

/**
 * Get access windows for a specific ground station (legacy format)
 */
async function getAccessWindowsForGroundStation(groundStationId, filters = {}) {
  const windows = await queryAccessWindows({
    ground_station_id: groundStationId,
    location_type: 'ground_station',
    ...filters
  });
  
  return {
    ground_station_id: parseInt(groundStationId),
    access_windows: windows,
    total_windows: windows.length
  };
}

/**
 * Get access windows for a specific target (legacy format)
 */
async function getAccessWindowsForTarget(targetId, filters = {}) {
  const windows = await queryAccessWindows({
    target_id: targetId,
    location_type: 'target',
    ...filters
  });
  
  return {
    target_id: parseInt(targetId),
    access_windows: windows,
    total_windows: windows.length
  };
}

/**
 * Get all access windows with optional filtering (legacy format)
 */
async function getAllAccessWindows(filters = {}) {
  const windows = await queryAccessWindows(filters);
  
  return {
    access_windows: windows,
    total_windows: windows.length,
    filters_applied: filters
  };
}

/**
 * Get access window statistics (legacy format)
 */
async function getAccessWindowStats() {
  try {
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: -3d)
        |> filter(fn: (r) => r._measurement == "access_event")
        |> filter(fn: (r) => r.event_type == "access_start")
        |> group(columns: ["satellite_id", "satellite_name"])
        |> count()
    `;
    
    const stats = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const stat = tableMeta.toObject(row);
          stats.push({
            satellite_id: stat.satellite_id,
            satellite_name: stat.satellite_name,
            total_access_windows: stat._value
          });
        },
        error(error) {
          console.error('InfluxDB query error:', error);
          reject(error);
        },
        complete() {
          resolve({
            statistics: stats,
            generated_at: new Date().toISOString()
          });
        }
      });
    });
  } catch (error) {
    console.error('Error querying access window statistics:', error);
    throw error;
  }
}

module.exports = {
  convertEventsToWindows,
  queryAccessWindows,
  getAccessWindowsForSatellite,
  getAccessWindowsForGroundStation,
  getAccessWindowsForTarget,
  getAllAccessWindows,
  getAccessWindowStats
};