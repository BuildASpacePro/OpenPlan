// Simple InfluxDB test script
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

const queryApi = influxClient.getQueryApi('missionplanning');

async function testInflux() {
  try {
    console.log('Testing InfluxDB connection...');
    
    // Test 1: Check if any data exists in bucket
    console.log('\n1. Checking if any data exists in accesswindows bucket:');
    const anyDataQuery = `
      from(bucket: "accesswindows")
        |> range(start: -30d)
        |> limit(n: 1)
    `;
    
    let hasData = false;
    await new Promise((resolve, reject) => {
      queryApi.queryRows(anyDataQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Found data:', result);
          hasData = true;
        },
        error(error) {
          console.error('Data check query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('Has data in bucket:', hasData);
          resolve();
        }
      });
    });
    
    // Test 2: Count mission_event records
    console.log('\n2. Counting mission_event records:');
    const countQuery = `
      from(bucket: "accesswindows")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> count()
    `;
    
    let eventCount = 0;
    await new Promise((resolve, reject) => {
      queryApi.queryRows(countQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          eventCount = result._value || 0;
        },
        error(error) {
          console.error('Count query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('mission_event count:', eventCount);
          resolve();
        }
      });
    });
    
    // Test 3: Check recent mission_event records
    console.log('\n3. Checking recent mission_event records:');
    const recentQuery = `
      from(bucket: "accesswindows")
        |> range(start: -1d)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> limit(n: 5)
    `;
    
    const recentEvents = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(recentQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          recentEvents.push(result);
        },
        error(error) {
          console.error('Recent events query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('Recent events:', recentEvents.length);
          if (recentEvents.length > 0) {
            console.log('Sample event:', recentEvents[0]);
          }
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testInflux();