// Access Window Compatibility Layer
// Converts new event-based InfluxDB data to legacy window format for frontend compatibility

const { InfluxDB } = require('@influxdata/influxdb-client');
const redis = require('redis');

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

// Redis configuration for caching
const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0
};

// Create Redis client for caching
const cacheClient = redis.createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port
  },
  database: redisConfig.db
});

// Connect to Redis
cacheClient.connect().catch(console.error);

// Cache configuration
const CACHE_TTL = 30 * 60; // 30 minutes
const CACHE_PREFIX = 'access_windows';

/**
 * Generate cache key for access windows
 * @param {Object} filters - Query filters
 * @returns {string} Cache key
 */
function generateCacheKey(filters) {
  const { satellite_id, ground_station_id, target_id, location_type, start_time, end_time } = filters;
  
  // Round start_time to the nearest hour for better cache hits
  let timeKey = '';
  if (start_time) {
    const startDate = new Date(start_time);
    startDate.setMinutes(0, 0, 0); // Round to hour
    timeKey = startDate.toISOString();
  }
  
  const keyParts = [
    CACHE_PREFIX,
    satellite_id || 'all',
    ground_station_id || 'all',
    target_id || 'all', 
    location_type || 'all',
    timeKey || 'anytime'
  ];
  
  return keyParts.join(':');
}

/**
 * Get cached access windows
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Array|null>} Cached windows or null
 */
async function getCachedWindows(cacheKey) {
  try {
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      console.log('Cache hit for key:', cacheKey);
      return JSON.parse(cached);
    }
    console.log('Cache miss for key:', cacheKey);
    return null;
  } catch (error) {
    console.warn('Cache get error:', error.message);
    return null;
  }
}

/**
 * Set cached access windows
 * @param {string} cacheKey - Cache key
 * @param {Array} windows - Access windows to cache
 * @returns {Promise<void>}
 */
async function setCachedWindows(cacheKey, windows) {
  try {
    await cacheClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(windows));
    console.log('Cached windows for key:', cacheKey, 'count:', windows.length);
  } catch (error) {
    console.warn('Cache set error:', error.message);
  }
}

/**
 * Invalidate cache entries related to a specific satellite and location
 * @param {string} satelliteId - Satellite ID
 * @param {string} locationId - Location ID
 * @returns {Promise<void>}
 */
async function invalidateAccessWindowCache(satelliteId, locationId) {
  try {
    // Get all cache keys matching the pattern
    const patterns = [
      `${CACHE_PREFIX}:${satelliteId}:*`,
      `${CACHE_PREFIX}:all:${locationId}:*`,
      `${CACHE_PREFIX}:all:all:*`, // Invalidate general queries too
    ];
    
    for (const pattern of patterns) {
      const keys = await cacheClient.keys(pattern);
      if (keys.length > 0) {
        await cacheClient.del(keys);
        console.log('Invalidated cache keys:', keys.length, 'for pattern:', pattern);
      }
    }
  } catch (error) {
    console.warn('Cache invalidation error:', error.message);
  }
}

/**
 * Convert access events to legacy window format
 * @param {Array} events - Array of access events from InfluxDB
 * @returns {Array} Array of access windows in legacy format
 */
function convertEventsToWindows(events) {
  const windows = [];
  const eventsByWindow = {};
  
  console.log('convertEventsToWindows: Processing', events.length, 'events');
  
  // Group events by window (using satellite_id + location_id + access_start time)
  events.forEach(event => {
    if (event.event_type === 'access_start') {
      const windowKey = `${event.satellite_id}_${event.location_id}_${event._time}`;
      console.log('Creating window for key:', windowKey);
      console.log('Event planned value:', event.planned, 'type:', typeof event.planned);
      
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
        planned: event.planned !== undefined ? event.planned : true, // Include planned field, default to true for backward compatibility
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
  
  console.log('convertEventsToWindows: Final windows count:', windows.length);
  console.log('Sample final window:', windows[0]);
  
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
    console.log('queryAccessWindows called with filters:', filters);
    
    // Check cache first
    const cacheKey = generateCacheKey(filters);
    const cachedWindows = await getCachedWindows(cacheKey);
    if (cachedWindows) {
      return cachedWindows;
    }
    
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
    
    console.log('InfluxDB query:', fluxQuery);
    
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
        async complete() {
          console.log('Raw events found:', events.length);
          console.log('Sample event:', events[0]);
          
          const windows = convertEventsToWindows(events);
          console.log('Converted windows:', windows.length);
          console.log('Sample window:', windows[0]);
          
          // Cache the results
          await setCachedWindows(cacheKey, windows);
          
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

/**
 * Update the planned status of an access window
 * @param {string} satelliteId - Satellite ID
 * @param {string} locationId - Location (ground station or target) ID
 * @param {string} startTime - Start time of the access window
 * @param {boolean} planned - New planned status
 * @returns {Promise<Object>} Update result
 */
async function updateAccessWindowPlannedStatus(satelliteId, locationId, startTime, planned) {
  const writeApi = influxClient.getWriteApi(influxConfig.org, influxConfig.bucket);
  
  try {
    console.log('updateAccessWindowPlannedStatus called with:', {
      satelliteId, locationId, startTime, planned
    });

    // Query for the specific access window events
    // Use a small time range around the start time to handle precision issues
    const startTimeMs = new Date(startTime).getTime();
    const startTimeMinusMinute = new Date(startTimeMs - 60000).toISOString();
    const startTimePlusMinute = new Date(startTimeMs + 60000).toISOString();
    
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: ${startTimeMinusMinute}, stop: ${startTimePlusMinute})
        |> filter(fn: (r) => r._measurement == "access_event")
        |> filter(fn: (r) => r.satellite_id == "${satelliteId}")
        |> filter(fn: (r) => r.location_id == "${locationId}")
        |> filter(fn: (r) => r.event_type == "access_start")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> limit(n: 1)
    `;
    
    console.log('InfluxDB query:', fluxQuery);
    
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
        async complete() {
          try {
            console.log('Found events:', events.length);
            
            if (events.length === 0) {
              console.error('No events found for the specified access window');
              reject(new Error('Access window not found'));
              return;
            }
            
            // For now, let's find all events in the same access window
            // Query for all related events (access_start, culmination, access_end)
            const accessStartEvent = events[0];
            const accessStartTime = new Date(accessStartEvent._time);
            
            // Query for all events in this access window (within ~15 minutes of start)
            const windowStartTime = new Date(accessStartTime.getTime() - 5*60*1000).toISOString(); // 5 minutes before
            const windowEndTime = new Date(accessStartTime.getTime() + 20*60*1000).toISOString(); // 20 minutes after
            
            console.log('Querying for all events in window:', {windowStartTime, windowEndTime});
            
            const allEventsQuery = `
              from(bucket: "${influxConfig.bucket}")
                |> range(start: ${windowStartTime}, stop: ${windowEndTime})
                |> filter(fn: (r) => r._measurement == "access_event")
                |> filter(fn: (r) => r.satellite_id == "${satelliteId}")
                |> filter(fn: (r) => r.location_id == "${locationId}")
                |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            `;
            
            const allEvents = [];
            
            // Query for all events in this access window
            queryApi.queryRows(allEventsQuery, {
              next(row, tableMeta) {
                const event = tableMeta.toObject(row);
                allEvents.push(event);
              },
              error(error) {
                console.error('Error querying all events:', error);
                reject(error);
              },
              async complete() {
                console.log('Found all events in window:', allEvents.length);
                
                // Update planned status for all events in this access window
                for (const event of allEvents) {
                  const point = new Point("access_event")
                    .tag("satellite_id", event.satellite_id)
                    .tag("satellite_name", event.satellite_name || "Unknown")
                    .tag("satellite_mission", event.satellite_mission || "Unknown")
                    .tag("location_id", event.location_id)
                    .tag("location_name", event.location_name || "Unknown")
                    .tag("location_type", event.location_type)
                    .tag("event_type", event.event_type)
                    .floatField("elevation", event.elevation || 0)
                    .floatField("azimuth", event.azimuth || 0)
                    .booleanField("planned", planned) // Update planned status
                    .timestamp(new Date(event._time));
                  
                  // Add location-specific fields
                  if (event.location_type === 'ground_station') {
                    point.floatField("ground_station_lat", event.ground_station_lat || 0);
                    point.floatField("ground_station_lon", event.ground_station_lon || 0);
                    point.floatField("ground_station_alt", event.ground_station_alt || 0);
                  } else if (event.location_type === 'target') {
                    point.tag("target_type", event.target_type || "unknown");
                    point.tag("target_priority", event.target_priority || "medium");
                    point.tag("target_status", event.target_status || "active");
                    point.floatField("target_lat", event.target_lat || 0);
                    point.floatField("target_lon", event.target_lon || 0);
                  }
                  
                  // Add window-level fields for access_start events
                  if (event.event_type === 'access_start') {
                    point.floatField("window_duration_minutes", event.window_duration_minutes || 0);
                    point.floatField("max_elevation", event.max_elevation || 0);
                  }
                  
                  writeApi.writePoint(point);
                }
                
                console.log('Writing', allEvents.length, 'updated events to InfluxDB');
                await writeApi.close();
                
                // Invalidate cache for this satellite and location
                await invalidateAccessWindowCache(satelliteId, locationId);
                
                // Broadcast update to WebSocket clients if available
                try {
                  const { broadcastAccessWindowsRefresh } = require('./websocketManager');
                  broadcastAccessWindowsRefresh([locationId], {
                    satellite_id: satelliteId,
                    planned_status_changed: true,
                    events_updated: allEvents.length
                  });
                } catch (wsError) {
                  console.warn('WebSocket broadcast failed:', wsError.message);
                }
                
                resolve({
                  status: 'success',
                  message: `Access window planned status updated to ${planned}`,
                  events_updated: allEvents.length
                });
              }
            });
            
          } catch (writeError) {
            console.error('Write error:', writeError);
            reject(writeError);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error updating access window planned status:', error);
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
  getAccessWindowStats,
  updateAccessWindowPlannedStatus,
  invalidateAccessWindowCache
};