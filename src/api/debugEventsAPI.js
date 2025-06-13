// Debug the events API issue
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function debugAPI() {
  const queryApi = influxClient.getQueryApi('missionplanning');
  
  try {
    console.log('🔍 Debugging events API query...');
    
    // Test the exact query from eventsCompat.js
    const fluxQuery = `
from(bucket: "accesswindows")
  |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
  |> filter(fn: (r) => r._measurement == "mission_event")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> group(columns: ["event_id", "_time"])
  |> first()
  |> group()
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
    console.error('Debug failed:', error);
  }
}

debugAPI();