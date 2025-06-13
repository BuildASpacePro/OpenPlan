// Test writing a single mission_event to InfluxDB
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const influxClient = new InfluxDB({
  url: 'http://influxdb:8086',
  token: 'mission-token-12345'
});

async function testWrite() {
  const writeApi = influxClient.getWriteApi('missionplanning', 'accesswindows');
  
  try {
    console.log('Testing InfluxDB write...');
    
    // Create a test mission_event point
    const point = new Point("mission_event")
      .tag("event_id", "test123")
      .tag("satellite_id", "1")
      .tag("satellite_name", "Test Satellite")
      .tag("satellite_mission", "Test Mission")
      .tag("event_type", "health")
      .tag("activity_type", "Test Activity")
      .floatField("duration_minutes", 30)
      .stringField("satellite_colour", "red")
      .stringField("event_status", "planned")
      .stringField("created_at", new Date().toISOString())
      .stringField("updated_at", new Date().toISOString())
      .timestamp(new Date());
    
    console.log('Writing test point...');
    writeApi.writePoint(point);
    
    console.log('Flushing to InfluxDB...');
    await writeApi.flush();
    
    console.log('Closing write API...');
    await writeApi.close();
    
    console.log('✅ Test write completed successfully');
    
    // Wait a moment for the write to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now query to see if it was written
    const queryApi = influxClient.getQueryApi('missionplanning');
    const testQuery = `
      from(bucket: "accesswindows")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "mission_event")
        |> filter(fn: (r) => r.event_id == "test123")
    `;
    
    let found = false;
    await new Promise((resolve, reject) => {
      queryApi.queryRows(testQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          console.log('Found test event:', result);
          found = true;
        },
        error(error) {
          console.error('Query error:', error.message);
          reject(error);
        },
        complete() {
          console.log('Query complete. Found test event:', found);
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('Test write failed:', error);
  }
}

testWrite();