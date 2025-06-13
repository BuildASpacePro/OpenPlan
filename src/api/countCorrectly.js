// Count events correctly in InfluxDB
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function countCorrectly() {
  const queryApi = influxClient.getQueryApi('missionplanning');
  
  try {
    console.log('🔍 Counting events correctly in InfluxDB...');
    
    // Method 1: Count unique event_ids
    const uniqueEventsQuery = `
      from(bucket: "accesswindows")
        |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> group(columns: ["event_id"])
        |> count()
        |> group()
        |> sum()
    `;
    
    console.log('\nMethod 1: Count by unique event_ids');
    await new Promise((resolve, reject) => {
      queryApi.queryRows(uniqueEventsQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Unique events by event_id:', result._value);
        },
        error(error) {
          console.error('Method 1 error:', error.message);
          reject(error);
        },
        complete() {
          resolve();
        }
      });
    });
    
    // Method 2: Count duration_minutes field occurrences
    const durationCountQuery = `
      from(bucket: "accesswindows")
        |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> count()
    `;
    
    console.log('\nMethod 2: Count duration_minutes fields');
    await new Promise((resolve, reject) => {
      queryApi.queryRows(durationCountQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Duration field count:', result._value);
        },
        error(error) {
          console.error('Method 2 error:', error.message);
          reject(error);
        },
        complete() {
          resolve();
        }
      });
    });
    
    // Method 3: List all distinct event_ids
    const distinctEventsQuery = `
      from(bucket: "accesswindows")
        |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> keep(columns: ["_time", "event_id", "_value"])
    `;
    
    console.log('\nMethod 3: List all events with event_ids');
    const eventIds = new Set();
    await new Promise((resolve, reject) => {
      queryApi.queryRows(distinctEventsQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          eventIds.add(result.event_id);
        },
        error(error) {
          console.error('Method 3 error:', error.message);
          reject(error);
        },
        complete() {
          console.log('Distinct event_ids found:', eventIds.size);
          console.log('Event IDs:', Array.from(eventIds).sort((a, b) => parseInt(a) - parseInt(b)));
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Count failed:', error);
  }
}

countCorrectly();