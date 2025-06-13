// Debug actual events in InfluxDB
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function debugEvents() {
  const queryApi = influxClient.getQueryApi('missionplanning');
  
  try {
    console.log('🔍 Debugging events in InfluxDB...');
    
    // Query for all mission_event records
    const listQuery = `
      from(bucket: "accesswindows")
        |> range(start: -1d)
        |> filter(fn: (r) => r._measurement == "mission_event")
    `;
    
    const events = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(listQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          events.push(result);
        },
        error(error) {
          console.error('Query error:', error.message);
          reject(error);
        },
        complete() {
          console.log(`Found ${events.length} total field records`);
          
          // Group by event_id to see unique events
          const uniqueEvents = {};
          events.forEach(event => {
            if (!uniqueEvents[event.event_id]) {
              uniqueEvents[event.event_id] = [];
            }
            uniqueEvents[event.event_id].push(event);
          });
          
          console.log(`Found ${Object.keys(uniqueEvents).length} unique events by event_id`);
          
          // Show first few events
          Object.keys(uniqueEvents).slice(0, 3).forEach(eventId => {
            console.log(`\nEvent ID ${eventId}:`, uniqueEvents[eventId].length, 'fields');
            uniqueEvents[eventId].forEach(field => {
              console.log(`  ${field._field}: ${field._value}`);
            });
          });
          
          resolve();
        }
      });
    });
    
    // Try counting with a different approach
    const countQuery = `
      from(bucket: "accesswindows")
        |> range(start: -1d)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r._field == "duration_minutes")
        |> count()
    `;
    
    await new Promise((resolve, reject) => {
      queryApi.queryRows(countQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('\nDuration count result:', result._value);
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
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugEvents();