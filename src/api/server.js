// src/api/server.js
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'backend',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'missionuser',
  password: process.env.POSTGRES_PASSWORD || 'missionpass',
  database: process.env.POSTGRES_DB || 'missionplanning',
  connectionTimeoutMillis: 10000,
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Access window endpoint
app.post('/api/accesswindow', async (req, res) => {
  const {
    lat,
    lon,
    tle_lines,
    start_utc,
    end_utc,
    elevation_deg = 10.0,
    step_seconds = 30
  } = req.body;

  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    !Array.isArray(tle_lines) ||
    tle_lines.length !== 2 ||
    typeof start_utc !== 'string' ||
    typeof end_utc !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  const scriptPath = path.join(__dirname, 'satellite', 'accesswindow.py');
  const args = [
    '--lat', lat,
    '--lon', lon,
    '--tle1', tle_lines[0],
    '--tle2', tle_lines[1],
    '--start_utc', start_utc,
    '--end_utc', end_utc,
    '--elevation_deg', elevation_deg,
    '--step_seconds', step_seconds
  ].map(String);

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
      return res.status(500).json({ error: 'Python script error', details: errorOutput });
    }
    // Parse output: each line is "start -> end"
    const windows = output
      .split('\n')
      .filter(line => line.includes('->'))
      .map(line => {
        const [start, end] = line.split('->').map(s => s.trim());
        return { start, end };
      });
    res.json({ access_windows: windows });
  });
});

// Database connection test endpoint
app.get('/db-test', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    const result = await client.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'database connected', 
      current_time: result.rows[0].current_time 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// SATELLITE ENDPOINTS

// Get all satellites (with full data including TLE and mission start time)
app.get('/api/satellites', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        satellite_id, 
        name, 
        mission, 
        colour,
        mission_start_time,
        tle_1,
        tle_2,
        created_at,
        updated_at
      FROM satellite 
      ORDER BY satellite_id ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching satellites:', error);
    res.status(500).json({ 
      error: 'Failed to fetch satellites', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Get specific satellite by ID
app.get('/api/satellites/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid satellite ID' });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        satellite_id, 
        name, 
        mission, 
        colour,
        mission_start_time,
        tle_1,
        tle_2,
        created_at,
        updated_at
      FROM satellite 
      WHERE satellite_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Satellite not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching satellite:', error);
    res.status(500).json({ 
      error: 'Failed to fetch satellite', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Get TLE data for a specific satellite
app.get('/api/satellites/:id/tle', async (req, res) => {
  const { id } = req.params;
  
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid satellite ID' });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        satellite_id,
        name,
        tle_1,
        tle_2
      FROM satellite 
      WHERE satellite_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Satellite not found' });
    }
    
    const satellite = result.rows[0];
    res.json({
      satellite_id: satellite.satellite_id,
      satellite_name: satellite.name,
      tle_lines: [satellite.tle_1, satellite.tle_2]
    });
  } catch (error) {
    console.error('Error fetching TLE data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TLE data', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Create new satellite (updated with new fields)
app.post('/api/satellites', async (req, res) => {
  const { name, mission, colour, mission_start_time, tle_1, tle_2 } = req.body;
  
  if (!name || !mission || !colour || !mission_start_time || !tle_1 || !tle_2) {
    return res.status(400).json({ 
      error: 'Name, mission, colour, mission_start_time, tle_1, and tle_2 are required' 
    });
  }

  // Validate TLE length
  if (tle_1.length > 70 || tle_2.length > 70) {
    return res.status(400).json({ 
      error: 'TLE lines must not exceed 70 characters each' 
    });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO satellite (name, mission, colour, mission_start_time, tle_1, tle_2) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING satellite_id, name, mission, colour, mission_start_time, tle_1, tle_2, created_at
    `, [name, mission, colour, mission_start_time, tle_1, tle_2]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating satellite:', error);
    res.status(500).json({ 
      error: 'Failed to create satellite', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Update satellite
app.put('/api/satellites/:id', async (req, res) => {
  const { id } = req.params;
  const { name, mission, colour, mission_start_time, tle_1, tle_2 } = req.body;
  
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid satellite ID' });
  }

  // Validate TLE length if provided
  if ((tle_1 && tle_1.length > 70) || (tle_2 && tle_2.length > 70)) {
    return res.status(400).json({ 
      error: 'TLE lines must not exceed 70 characters each' 
    });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (name) {
      updateFields.push(`name = $${valueIndex++}`);
      values.push(name);
    }
    if (mission) {
      updateFields.push(`mission = $${valueIndex++}`);
      values.push(mission);
    }
    if (colour) {
      updateFields.push(`colour = $${valueIndex++}`);
      values.push(colour);
    }
    if (mission_start_time) {
      updateFields.push(`mission_start_time = $${valueIndex++}`);
      values.push(mission_start_time);
    }
    if (tle_1) {
      updateFields.push(`tle_1 = $${valueIndex++}`);
      values.push(tle_1);
    }
    if (tle_2) {
      updateFields.push(`tle_2 = $${valueIndex++}`);
      values.push(tle_2);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const result = await client.query(`
      UPDATE satellite 
      SET ${updateFields.join(', ')}
      WHERE satellite_id = $${valueIndex}
      RETURNING satellite_id, name, mission, colour, mission_start_time, tle_1, tle_2, updated_at
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Satellite not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating satellite:', error);
    res.status(500).json({ 
      error: 'Failed to update satellite', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// GROUND STATION ENDPOINTS

// Get all ground stations
app.get('/api/groundstations', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        gs_id, 
        name, 
        latitude, 
        longitude, 
        altitude,
        created_at,
        updated_at
      FROM ground_station 
      ORDER BY name ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ground stations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ground stations', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Get specific ground station by ID
app.get('/api/groundstations/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ground station ID' });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        gs_id, 
        name, 
        latitude, 
        longitude, 
        altitude,
        created_at,
        updated_at
      FROM ground_station 
      WHERE gs_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ground station not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ground station:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ground station', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Create new ground station
app.post('/api/groundstations', async (req, res) => {
  const { name, latitude, longitude, altitude } = req.body;
  
  if (!name || latitude === undefined || longitude === undefined || altitude === undefined) {
    return res.status(400).json({ 
      error: 'Name, latitude, longitude, and altitude are required' 
    });
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({ 
      error: 'Latitude must be between -90 and +90 degrees' 
    });
  }
  
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({ 
      error: 'Longitude must be between -180 and +180 degrees' 
    });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO ground_station (name, latitude, longitude, altitude) 
      VALUES ($1, $2, $3, $4) 
      RETURNING gs_id, name, latitude, longitude, altitude, created_at
    `, [name, latitude, longitude, altitude]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ground station:', error);
    res.status(500).json({ 
      error: 'Failed to create ground station', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Update ground station
app.put('/api/groundstations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, altitude } = req.body;
  
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ground station ID' });
  }

  // Validate coordinate ranges if provided
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    return res.status(400).json({ 
      error: 'Latitude must be between -90 and +90 degrees' 
    });
  }
  
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    return res.status(400).json({ 
      error: 'Longitude must be between -180 and +180 degrees' 
    });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (name) {
      updateFields.push(`name = $${valueIndex++}`);
      values.push(name);
    }
    if (latitude !== undefined) {
      updateFields.push(`latitude = $${valueIndex++}`);
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updateFields.push(`longitude = $${valueIndex++}`);
      values.push(longitude);
    }
    if (altitude !== undefined) {
      updateFields.push(`altitude = $${valueIndex++}`);
      values.push(altitude);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const result = await client.query(`
      UPDATE ground_station 
      SET ${updateFields.join(', ')}
      WHERE gs_id = $${valueIndex}
      RETURNING gs_id, name, latitude, longitude, altitude, updated_at
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ground station not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ground station:', error);
    res.status(500).json({ 
      error: 'Failed to update ground station', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// EVENT ENDPOINTS

// Get all events
app.get('/api/events', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT event_id, satellite_id, event_type, activity_type, duration, planned_time, created_at, updated_at
      FROM event 
      ORDER BY planned_time ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Get timeline data (events with satellite info) - Enhanced with new satellite fields
app.get('/api/timeline', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT
        e.event_id,
        s.satellite_id,
        s.name AS satellite_name,
        s.mission,
        s.colour,
        s.mission_start_time,
        e.event_type,
        e.activity_type,
        e.duration,
        e.planned_time,
        (e.planned_time + INTERVAL '1 minute' * e.duration) AS end_time
      FROM event e
      JOIN satellite s ON e.satellite_id = s.satellite_id
      ORDER BY e.planned_time ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ 
      error: 'Failed to fetch timeline', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Create new event
app.post('/api/events', async (req, res) => {
  const { satellite_id, event_type, activity_type, duration, planned_time } = req.body;
  
  if (!satellite_id || !event_type || !activity_type || !duration || !planned_time) {
    return res.status(400).json({ error: 'Satellite ID, event type, activity type, duration, and planned_time are required' });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO event (satellite_id, event_type, activity_type, duration, planned_time) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING event_id, satellite_id, event_type, activity_type, duration, planned_time, created_at
    `, [satellite_id, event_type, activity_type, duration, planned_time]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// UTILITY ENDPOINTS

// Get access window using satellite ID and ground station ID
app.post('/api/accesswindow/satellite/:satelliteId/groundstation/:gsId', async (req, res) => {
  const { satelliteId, gsId } = req.params;
  const { start_utc, end_utc, elevation_deg = 10.0, step_seconds = 30 } = req.body;

  if (!/^\d+$/.test(satelliteId) || !/^\d+$/.test(gsId)) {
    return res.status(400).json({ error: 'Invalid satellite ID or ground station ID' });
  }

  if (!start_utc || !end_utc) {
    return res.status(400).json({ error: 'start_utc and end_utc are required' });
  }

  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    // Get satellite TLE data
    const satelliteResult = await client.query(`
      SELECT name, tle_1, tle_2 FROM satellite WHERE satellite_id = $1
    `, [satelliteId]);
    
    if (satelliteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Satellite not found' });
    }
    
    // Get ground station coordinates
    const gsResult = await client.query(`
      SELECT name, latitude, longitude FROM ground_station WHERE gs_id = $1
    `, [gsId]);
    
    if (gsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ground station not found' });
    }
    
    const satellite = satelliteResult.rows[0];
    const groundStation = gsResult.rows[0];
    
    // Call the existing access window endpoint logic
    const scriptPath = path.join(__dirname, 'satellite', 'accesswindow.py');
    const args = [
      '--lat', groundStation.latitude,
      '--lon', groundStation.longitude,
      '--tle1', satellite.tle_1,
      '--tle2', satellite.tle_2,
      '--start_utc', start_utc,
      '--end_utc', end_utc,
      '--elevation_deg', elevation_deg,
      '--step_seconds', step_seconds
    ].map(String);

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
        return res.status(500).json({ error: 'Python script error', details: errorOutput });
      }
      
      const windows = output
        .split('\n')
        .filter(line => line.includes('->'))
        .map(line => {
          const [start, end] = line.split('->').map(s => s.trim());
          return { start, end };
        });
        
      res.json({ 
        satellite_name: satellite.name,
        ground_station_name: groundStation.name,
        access_windows: windows 
      });
    });
    
  } catch (error) {
    console.error('Error calculating access window:', error);
    res.status(500).json({ 
      error: 'Failed to calculate access window', 
      details: error.message 
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Mission Planner API server running on port ${port}`);
  console.log(`Database config: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});