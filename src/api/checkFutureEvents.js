// Check for events in future date range
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function checkFutureEvents() {
  const queryApi = influxClient.getQueryApi('missionplanning');
  
  try {
    console.log('Current date:', new Date().toISOString());
    console.log('Events planned for July 2025');
    
    // Query for events in 2025 range
    const wideQuery = `
      from(bucket: "accesswindows")
        |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> count()
    `;
    
    await new Promise((resolve, reject) => {
      queryApi.queryRows(wideQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Events in 2025 range:', result._value);
        },
        error(error) {
          console.error('Count query error:', error.message);
          reject(error);
        },
        complete() {
          resolve();
        }
      });
    });
    
    // List first few events in the future
    const listQuery = `
      from(bucket: "accesswindows")
        |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> limit(n: 5)
    `;
    
    console.log('\nFirst 5 events found:');
    await new Promise((resolve, reject) => {
      queryApi.queryRows(listQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log(`Event ${result.event_id}: ${result.satellite_name} - ${result.activity_type} at ${result._time} (${result._value} min)`);
        },
        error(error) {
          console.error('List query error:', error.message);
          reject(error);
        },
        complete() {
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkFutureEvents();