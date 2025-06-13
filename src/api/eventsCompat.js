// Events Compatibility Layer
// Provides InfluxDB-backed event queries with PostgreSQL-compatible API responses

const { InfluxDB, Point } = require('@influxdata/influxdb-client');
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
const CACHE_TTL = 15 * 60; // 15 minutes
const CACHE_PREFIX = 'events';

/**
 * Generate cache key for events
 * @param {Object} filters - Query filters
 * @returns {string} Cache key
 */
function generateCacheKey(filters) {
  const { satellite_id, event_type, start_time, end_time } = filters;
  
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
    event_type || 'all',
    timeKey || 'anytime'
  ];
  
  return keyParts.join(':');
}

/**
 * Get cached events
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Array|null>} Cached events or null
 */
async function getCachedEvents(cacheKey) {
  try {
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      console.log('Cache hit for events key:', cacheKey);
      return JSON.parse(cached);
    }
    console.log('Cache miss for events key:', cacheKey);
    return null;
  } catch (error) {
    console.warn('Events cache get error:', error.message);
    return null;
  }
}

/**
 * Set cached events
 * @param {string} cacheKey - Cache key
 * @param {Array} events - Events to cache
 * @returns {Promise<void>}
 */
async function setCachedEvents(cacheKey, events) {
  try {
    await cacheClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(events));
    console.log('Cached events for key:', cacheKey, 'count:', events.length);
  } catch (error) {
    console.warn('Events cache set error:', error.message);
  }
}

/**
 * Convert InfluxDB event records to PostgreSQL-compatible format
 * @param {Array} influxEvents - Array of events from InfluxDB
 * @returns {Array} Array of events in PostgreSQL format
 */
function convertInfluxToPostgresFormat(influxEvents) {
  return influxEvents.map(event => ({
    event_id: parseInt(event.event_id),
    satellite_id: parseInt(event.satellite_id),
    satellite_name: event.satellite_name,
    mission: event.satellite_mission,
    colour: event.satellite_colour,
    event_type: event.event_type,
    activity_type: event.activity_type,
    duration: event.duration_minutes,
    planned_time: event._time,
    end_time: new Date(new Date(event._time).getTime() + (event.duration_minutes * 60 * 1000)).toISOString(),
    created_at: event.created_at,
    updated_at: event.updated_at,
    event_status: event.event_status || 'planned'
  }));
}

/**
 * Query events from InfluxDB
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Promise resolving to array of events
 */
async function queryEvents(filters = {}) {
  const { satellite_id, event_type, start_time, end_time } = filters;
  
  try {
    console.log('queryEvents called with filters:', filters);
    
    // Check cache first
    const cacheKey = generateCacheKey(filters);
    const cachedEvents = await getCachedEvents(cacheKey);
    if (cachedEvents) {
      return cachedEvents;
    }
    
    let filterConditions = [];
    
    if (satellite_id) {
      filterConditions.push(`|> filter(fn: (r) => r.satellite_id == "${satellite_id}")`);
    }
    
    if (event_type) {
      filterConditions.push(`|> filter(fn: (r) => r.event_type == "${event_type}")`);
    }
    
    const timeRange = start_time && end_time ? 
      `range(start: ${start_time}, stop: ${end_time})` : 
      'range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)'; // Default to 2025 range for demo data
    
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> ${timeRange}
        |> filter(fn: (r) => r._measurement == "mission_event")
        ${filterConditions.join('\\n        ')}
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> group(columns: ["event_id", "satellite_id", "_time"])
        |> first()
        |> group()
        |> sort(columns: ["_time"])
    `;
    
    console.log('InfluxDB events query:', fluxQuery);
    
    const events = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const event = tableMeta.toObject(row);
          events.push(event);
        },
        error(error) {
          console.error('InfluxDB events query error:', error);
          reject(error);
        },
        async complete() {
          console.log('Raw InfluxDB events found:', events.length);
          
          const formattedEvents = convertInfluxToPostgresFormat(events);
          console.log('Formatted events:', formattedEvents.length);
          
          // Cache the results
          await setCachedEvents(cacheKey, formattedEvents);
          
          resolve(formattedEvents);
        }
      });
    });
  } catch (error) {
    console.error('Error querying events from InfluxDB:', error);
    throw error;
  }
}

/**
 * Get all events (equivalent to /api/events)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Promise resolving to array of events
 */
async function getAllEvents(filters = {}) {
  return await queryEvents(filters);
}

/**
 * Get timeline data (events with satellite info) - equivalent to /api/timeline
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Promise resolving to array of timeline events
 */
async function getTimelineEvents(filters = {}) {
  const events = await queryEvents(filters);
  
  // The events already include satellite information from the InfluxDB query
  // so we just need to format them properly for the timeline
  return events.map(event => ({
    event_id: event.event_id,
    satellite_id: event.satellite_id,
    satellite_name: event.satellite_name,
    mission: event.mission,
    colour: event.colour,
    event_type: event.event_type,
    activity_type: event.activity_type,
    duration: event.duration,
    planned_time: event.planned_time,
    end_time: event.end_time
  }));
}

/**
 * Create a new event in InfluxDB
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event data
 */
async function createEvent(eventData) {
  const writeApi = influxClient.getWriteApi(influxConfig.org, influxConfig.bucket);
  
  try {
    const { satellite_id, satellite_name, satellite_mission, satellite_colour, event_type, activity_type, duration, planned_time } = eventData;
    
    // Generate a unique event ID (timestamp-based)
    const event_id = Date.now().toString();
    
    const point = new Point("mission_event")
      .tag("event_id", event_id)
      .tag("satellite_id", satellite_id.toString())
      .tag("satellite_name", satellite_name)
      .tag("satellite_mission", satellite_mission)
      .tag("event_type", event_type)
      .tag("activity_type", activity_type)
      .floatField("duration_minutes", duration)
      .stringField("satellite_colour", satellite_colour)
      .stringField("event_status", "planned")
      .stringField("created_at", new Date().toISOString())
      .stringField("updated_at", new Date().toISOString())
      .timestamp(new Date(planned_time));
    
    writeApi.writePoint(point);
    await writeApi.close();
    
    // Clear related caches
    await clearEventsCaches();
    
    // Return the created event in PostgreSQL format
    return {
      event_id: parseInt(event_id),
      satellite_id: parseInt(satellite_id),
      event_type,
      activity_type,
      duration,
      planned_time,
      created_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error creating event in InfluxDB:', error);
    throw error;
  }
}

/**
 * Clear events caches
 * @returns {Promise<void>}
 */
async function clearEventsCaches() {
  try {
    const pattern = `${CACHE_PREFIX}:*`;
    const keys = await cacheClient.keys(pattern);
    if (keys.length > 0) {
      await cacheClient.del(keys);
      console.log('Cleared events cache keys:', keys.length);
    }
  } catch (error) {
    console.warn('Events cache clear error:', error.message);
  }
}

module.exports = {
  queryEvents,
  getAllEvents,
  getTimelineEvents,
  createEvent,
  convertInfluxToPostgresFormat,
  clearEventsCaches
};