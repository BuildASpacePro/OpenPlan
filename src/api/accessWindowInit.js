// src/api/accessWindowInit.js
const { Client } = require('pg');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { spawn } = require('child_process');
const path = require('path');

// Database configuration
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

async function getDatabaseConnection() {
  const maxRetries = 30;
  const retryDelay = 2000;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const client = new Client(dbConfig);
      await client.connect();
      console.log(`Successfully connected to PostgreSQL on attempt ${attempt + 1}`);
      return client;
    } catch (error) {
      console.log(`Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }
}

async function getInfluxDBClient() {
  try {
    const client = new InfluxDB({
      url: influxConfig.url,
      token: influxConfig.token
    });
    
    console.log('InfluxDB client created successfully');
    return client;
  } catch (error) {
    console.error('Failed to create InfluxDB client:', error.message);
    throw error;
  }
}

async function fetchGroundStations(client) {
  const result = await client.query(`
    SELECT gs_id, name, latitude, longitude, altitude 
    FROM ground_station 
    ORDER BY name
  `);
  return result.rows;
}

async function fetchSatellites(client) {
  const result = await client.query(`
    SELECT satellite_id, name, mission, tle_1, tle_2 
    FROM satellite 
    ORDER BY name
  `);
  return result.rows;
}

function computeAccessWindows(lat, lon, tleLines, startUtc, endUtc, elevationDeg = 10.0, stepSeconds = 30) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'satellite', 'accesswindow.py');
    const args = [
      '--lat', lat.toString(),
      '--lon', lon.toString(),
      '--tle1', tleLines[0],
      '--tle2', tleLines[1],
      '--start_utc', startUtc.toISOString(),
      '--end_utc', endUtc.toISOString(),
      '--elevation_deg', elevationDeg.toString(),
      '--step_seconds', stepSeconds.toString()
    ];

    const py = spawn('python3', [scriptPath, ...args]);

    let output = '';
    let errorOutput = '';

    py.stdout.on('data', (data) => {
      output += data.toString();
    });

    py.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script error: ${errorOutput}`));
        return;
      }
      
      // Parse output: each line is "start -> end"
      const windows = output
        .split('\n')
        .filter(line => line.includes('->'))
        .map(line => {
          const [start, end] = line.split('->').map(s => s.trim());
          return { 
            start: new Date(start), 
            end: new Date(end) 
          };
        });
      
      resolve(windows);
    });
  });
}

async function calculateAndStoreAccessWindows() {
  console.log('Starting access window calculation...');
  
  let pgClient;
  let influxClient;
  
  try {
    // Connect to databases
    pgClient = await getDatabaseConnection();
    influxClient = await getInfluxDBClient();
    
    const writeApi = influxClient.getWriteApi(influxConfig.org, influxConfig.bucket);
    
    // Fetch ground stations and satellites
    const groundStations = await fetchGroundStations(pgClient);
    const satellites = await fetchSatellites(pgClient);
    
    console.log(`Found ${groundStations.length} ground stations and ${satellites.length} satellites`);
    
    // Calculate 3 days in advance
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    console.log(`Calculating access windows from ${startTime} to ${endTime}`);
    
    const totalCombinations = groundStations.length * satellites.length;
    let processed = 0;
    
    // Process each ground station - satellite combination
    for (const gs of groundStations) {
      for (const sat of satellites) {
        try {
          console.log(`Processing ${gs.name} -> ${sat.name} (${processed + 1}/${totalCombinations})`);
          
          // Calculate access windows
          const tleLines = [sat.tle_1, sat.tle_2];
          const accessWindows = await computeAccessWindows(
            parseFloat(gs.latitude),
            parseFloat(gs.longitude),
            tleLines,
            startTime,
            endTime,
            10.0,
            30
          );
          
          // Store each access window in InfluxDB
          for (const window of accessWindows) {
            const durationMinutes = (window.end - window.start) / (1000 * 60);
            
            // Create point with tags for easy sorting
            const point = new Point("access_window")
              .tag("ground_station_id", gs.gs_id.toString())
              .tag("ground_station_name", gs.name)
              .tag("satellite_id", sat.satellite_id.toString())
              .tag("satellite_name", sat.name)
              .tag("satellite_mission", sat.mission)
              .floatField("duration_minutes", durationMinutes)
              .stringField("start_time", window.start.toISOString())
              .stringField("end_time", window.end.toISOString())
              .floatField("ground_station_lat", parseFloat(gs.latitude))
              .floatField("ground_station_lon", parseFloat(gs.longitude))
              .floatField("ground_station_alt", parseFloat(gs.altitude))
              .timestamp(window.start);
            
            writeApi.writePoint(point);
          }
          
          console.log(`  Found ${accessWindows.length} access windows`);
          processed++;
          
        } catch (error) {
          console.error(`Error processing ${gs.name} -> ${sat.name}: ${error.message}`);
          processed++;
          continue;
        }
      }
    }
    
    // Flush all writes
    await writeApi.close();
    
    console.log(`Completed processing ${processed}/${totalCombinations} combinations`);
    console.log('Access window calculation completed successfully!');
    
    return {
      status: 'completed',
      combinations_processed: processed,
      total_combinations: totalCombinations
    };
    
  } catch (error) {
    console.error(`Error in main processing: ${error.message}`);
    throw error;
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
    // InfluxDB client doesn't need explicit cleanup
  }
}

module.exports = {
  calculateAndStoreAccessWindows
};