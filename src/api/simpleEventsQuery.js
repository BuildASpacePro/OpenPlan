// Test simple events query without pivot
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function simpleQuery() {
  const queryApi = influxClient.getQueryApi('missionplanning');
  
  try {
    console.log('🔍 Testing simple events query...');
    
    // Get unique events by filtering on duration_minutes field only
    const fluxQuery = `
from(bucket: "accesswindows")
  |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
  |> filter(fn: (r) => r._measurement == "mission_event")
  |> filter(fn: (r) => r._field == "duration_minutes")
  |> unique(column: "event_id")
  |> sort(columns: ["_time"])
  |> limit(n: 5)
    `;
    
    console.log('Query:', fluxQuery);
    let count = 0;
    
    await new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Event Row', ++count, ':', JSON.stringify(result, null, 2));
        },
        error(error) {
          console.error('Query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('\\nQuery completed. Total rows:', count);
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Simple query failed:', error);
  }
}

simpleQuery();