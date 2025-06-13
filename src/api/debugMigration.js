// Debug migration - write just one event at a time
const { Client } = require('pg');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
require('dotenv').config();

// PostgreSQL configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'backend',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'missionuser',
  password: process.env.POSTGRES_PASSWORD || 'missionpass',
  database: process.env.POSTGRES_DB || 'missionplanning',
  connectionTimeoutMillis: 10000,
};

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

async function debugMigration() {
  let pgClient;
  
  try {
    console.log('🔍 Debug migration - writing one event at a time...');
    
    // Connect to PostgreSQL
    pgClient = new Client(dbConfig);
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Get first event
    const eventsQuery = `
      SELECT 
        e.event_id,
        e.satellite_id,
        e.event_type,
        e.activity_type,
        e.duration,
        e.planned_time,
        e.created_at,
        e.updated_at,
        s.name AS satellite_name,
        s.mission AS satellite_mission,
        s.colour AS satellite_colour
      FROM event e
      JOIN satellite s ON e.satellite_id = s.satellite_id
      ORDER BY e.planned_time ASC
      LIMIT 3
    `;
    
    const result = await pgClient.query(eventsQuery);
    const events = result.rows;
    
    console.log(`Found ${events.length} events to test`);
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`\n--- Processing event ${i + 1} ---`);
      console.log('Event data:', {
        event_id: event.event_id,
        satellite_id: event.satellite_id,
        satellite_name: event.satellite_name,
        event_type: event.event_type,
        activity_type: event.activity_type,
        duration: event.duration,
        planned_time: event.planned_time
      });
      
      const writeApi = influxClient.getWriteApi(influxConfig.org, influxConfig.bucket);
      
      try {
        // Create unique ID for this test
        const uniqueId = `debug_${event.event_id}_${Date.now()}_${i}`;
        
        const point = new Point("mission_event")
          .tag("event_id", event.event_id.toString())
          .tag("unique_id", uniqueId)
          .tag("satellite_id", event.satellite_id.toString())
          .tag("satellite_name", event.satellite_name)
          .tag("satellite_mission", event.satellite_mission)
          .tag("event_type", event.event_type)
          .tag("activity_type", event.activity_type)
          .floatField("duration_minutes", event.duration)
          .stringField("satellite_colour", event.satellite_colour)
          .stringField("event_status", "planned")
          .stringField("created_at", event.created_at.toISOString())
          .stringField("updated_at", event.updated_at.toISOString())
          .timestamp(new Date(event.planned_time));
        
        console.log('Writing point to InfluxDB...');
        writeApi.writePoint(point);
        
        console.log('Flushing...');
        await writeApi.flush();
        
        console.log('Closing...');
        await writeApi.close();
        
        console.log('✅ Event written successfully');
        
        // Wait and verify
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const queryApi = influxClient.getQueryApi(influxConfig.org);
        const verifyQuery = `
          from(bucket: "${influxConfig.bucket}")
            |> range(start: -1h)
            |> filter(fn: (r) => r._measurement == "mission_event")
            |> filter(fn: (r) => r.unique_id == "${uniqueId}")
            |> filter(fn: (r) => r._field == "duration_minutes")
        `;
        
        let found = false;
        await new Promise((resolve, reject) => {
          queryApi.queryRows(verifyQuery, {
            next(row, tableMeta) {
              const result = tableMeta.toObject(row);
              console.log('✅ Verified event in InfluxDB:', result._value, 'minutes duration');
              found = true;
            },
            error(error) {
              console.error('❌ Verify query error:', error.message);
              reject(error);
            },
            complete() {
              if (!found) {
                console.log('⚠️  Event not found in verification');
              }
              resolve();
            }
          });
        });
        
      } catch (writeError) {
        console.error(`❌ Error writing event ${event.event_id}:`, writeError);
      }
    }
    
  } catch (error) {
    console.error('💥 Debug migration failed:', error);
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
  }
}

debugMigration();