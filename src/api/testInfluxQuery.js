// Test InfluxDB query to understand data structure
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function testQuery() {
  const queryApi = influxClient.getQueryApi('missionplanning');
  
  try {
    console.log('Testing InfluxDB data structure...');
    
    // Simple query to see raw data
    const simpleQuery = `from(bucket: "accesswindows")
  |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
  |> filter(fn: (r) => r._measurement == "mission_event")
  |> limit(n: 3)`;
    
    console.log('Raw data query:');
    let count = 0;
    
    await new Promise((resolve, reject) => {
      queryApi.queryRows(simpleQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Row', ++count, ':', JSON.stringify(result, null, 2));
        },
        error(error) {
          console.error('Raw query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('\\nRaw query completed. Total rows:', count);
          resolve();
        }
      });
    });
    
    // Now try pivoted query
    console.log('\\n\\nTesting pivoted query:');
    const pivotQuery = `from(bucket: "accesswindows")
  |> range(start: 2025-01-01T00:00:00Z, stop: 2026-01-01T00:00:00Z)
  |> filter(fn: (r) => r._measurement == "mission_event")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> limit(n: 2)`;
    
    count = 0;
    await new Promise((resolve, reject) => {
      queryApi.queryRows(pivotQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Pivoted Row', ++count, ':', JSON.stringify(result, null, 2));
        },
        error(error) {
          console.error('Pivot query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('\\nPivot query completed. Total rows:', count);
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testQuery();