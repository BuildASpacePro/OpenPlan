// Events Migration Script - Migrate events from PostgreSQL to InfluxDB
// This script transfers all events data from the PostgreSQL 'event' table to InfluxDB 'mission_event' measurement

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

// Create InfluxDB client
const influxClient = new InfluxDB({
  url: influxConfig.url,
  token: influxConfig.token
});

/**
 * Migrate events from PostgreSQL to InfluxDB
 */
async function migrateEvents() {
  let pgClient;
  const writeApi = influxClient.getWriteApi(influxConfig.org, influxConfig.bucket);
  
  try {
    console.log('🚀 Starting events migration from PostgreSQL to InfluxDB...');
    
    // Connect to PostgreSQL
    pgClient = new Client(dbConfig);
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Query events with satellite information
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
    `;
    
    console.log('📊 Querying events from PostgreSQL...');
    const result = await pgClient.query(eventsQuery);
    const events = result.rows;
    
    console.log(`📈 Found ${events.length} events to migrate`);
    
    if (events.length === 0) {
      console.log('ℹ️  No events found to migrate');
      return { migrated: 0, errors: 0 };
    }
    
    let migrated = 0;
    let errors = 0;
    
    // Process events in batches to avoid overwhelming InfluxDB
    const batchSize = 50;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(events.length/batchSize)} (${batch.length} events)`);
      
      for (const event of batch) {
        try {
          // Create InfluxDB Point for mission_event measurement
          // Use unique event ID to avoid collisions
          const uniqueEventId = `${event.event_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const point = new Point("mission_event")
            .tag("event_id", event.event_id.toString()) // Keep original ID as tag
            .tag("unique_id", uniqueEventId) // Add unique ID to prevent collisions
            .tag("satellite_id", event.satellite_id.toString())
            .tag("satellite_name", event.satellite_name)
            .tag("satellite_mission", event.satellite_mission)
            .tag("event_type", event.event_type)
            .tag("activity_type", event.activity_type)
            .floatField("duration_minutes", event.duration)
            .stringField("satellite_colour", event.satellite_colour)
            .stringField("event_status", "planned") // Default status for migrated events
            .stringField("created_at", event.created_at.toISOString())
            .stringField("updated_at", event.updated_at.toISOString())
            .timestamp(new Date(event.planned_time));
          
          writeApi.writePoint(point);
          migrated++;
          
        } catch (pointError) {
          console.error(`❌ Error creating point for event ${event.event_id}:`, pointError);
          errors++;
        }
      }
      
      // Flush batch to InfluxDB - wait for completion
      try {
        await writeApi.flush();
        // Additional wait to ensure the write is processed
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} written to InfluxDB`);
      } catch (flushError) {
        console.error(`❌ Error flushing batch to InfluxDB:`, flushError);
        errors += batch.length;
        migrated -= batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final flush and wait
    await writeApi.flush();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for final processing
    await writeApi.close();
    
    console.log('🎉 Events migration completed!');
    console.log(`✅ Successfully migrated: ${migrated} events`);
    console.log(`❌ Errors encountered: ${errors} events`);
    
    return { migrated, errors };
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    if (pgClient) {
      await pgClient.end();
      console.log('🔌 PostgreSQL connection closed');
    }
  }
}

/**
 * Verify migration by counting events in both databases
 */
async function verifyMigration() {
  let pgClient;
  const queryApi = influxClient.getQueryApi(influxConfig.org);
  
  try {
    console.log('🔍 Verifying migration...');
    
    // Wait a moment for InfluxDB to process all writes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Count events in PostgreSQL
    pgClient = new Client(dbConfig);
    await pgClient.connect();
    const pgResult = await pgClient.query('SELECT COUNT(*) as count FROM event');
    const pgCount = parseInt(pgResult.rows[0].count);
    
    // Count events in InfluxDB (count distinct event_ids)
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> keep(columns: ["event_id"])
    `;
    
    const eventIds = new Set();
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          if (result.event_id && result.event_id !== 'test123') { // Exclude test event
            eventIds.add(result.event_id);
          }
        },
        error(error) {
          console.error('❌ InfluxDB count query error:', error);
          reject(error);
        },
        complete() {
          const influxCount = eventIds.size;
          console.log(`📊 PostgreSQL events: ${pgCount}`);
          console.log(`📊 InfluxDB events: ${influxCount}`);
          
          if (pgCount === influxCount) {
            console.log('✅ Migration verification successful! Counts match.');
            resolve({ success: true, pgCount, influxCount });
          } else {
            console.log('⚠️  Migration verification warning: Counts do not match.');
            resolve({ success: false, pgCount, influxCount });
          }
        }
      });
    });
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
    throw error;
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
  }
}

/**
 * Main migration function
 */
async function main() {
  try {
    const migrationResult = await migrateEvents();
    const verificationResult = await verifyMigration();
    
    console.log('\n📋 Migration Summary:');
    console.log(`   Migrated: ${migrationResult.migrated} events`);
    console.log(`   Errors: ${migrationResult.errors} events`);
    console.log(`   Verification: ${verificationResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`   PostgreSQL: ${verificationResult.pgCount} events`);
    console.log(`   InfluxDB: ${verificationResult.influxCount} events`);
    
    if (migrationResult.errors > 0 || !verificationResult.success) {
      console.log('\n⚠️  Migration completed with issues. Please review the logs above.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  migrateEvents,
  verifyMigration,
  main
};

// Run migration if called directly
if (require.main === module) {
  main();
}