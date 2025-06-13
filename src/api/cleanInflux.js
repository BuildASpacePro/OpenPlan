// Clean mission_event records from InfluxDB
const { InfluxDB } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function cleanMissionEvents() {
  try {
    console.log('Cleaning mission_event records from InfluxDB...');
    
    const deleteApi = influxClient.getDeleteAPI('missionplanning', 'accesswindows');
    
    const start = new Date('2020-01-01T00:00:00Z');
    const stop = new Date('2030-01-01T00:00:00Z');
    
    await deleteApi.postDelete({
      start: start.toISOString(),
      stop: stop.toISOString(),
      predicate: '_measurement="mission_event"'
    });
    
    console.log('✅ Cleaned mission_event records');
    
    // Verify deletion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const queryApi = influxClient.getQueryApi('missionplanning');
    const countQuery = `from(bucket: "accesswindows") |> range(start: -100y) |> filter(fn: (r) => r._measurement == "mission_event") |> count()`;
    
    let remainingCount = 0;
    await new Promise((resolve, reject) => {
      queryApi.queryRows(countQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          remainingCount = result._value || 0;
        },
        error(error) {
          console.error('Count query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('Remaining mission_event count:', remainingCount);
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Clean failed:', error);
  }
}

cleanMissionEvents();