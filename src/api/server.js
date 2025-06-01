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

// Get all satellites
app.get('/api/satellites', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT satellite_id, name, mission, colour 
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

// Get all events
app.get('/api/events', async (req, res) => {
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      SELECT event_id, satellite_id, activity_type, duration, planned_time 
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

// Get timeline data (events with satellite info)
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
        s.colour,
        e.activity_type,
        e.duration,
        e.planned_time
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

// Create new satellite
app.post('/api/satellites', async (req, res) => {
  const { name, mission, colour } = req.body;
  
  if (!name || !mission || !colour) {
    return res.status(400).json({ error: 'Name, mission, and colour are required' });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO satellite (name, mission, colour) 
      VALUES ($1, $2, $3) 
      RETURNING satellite_id, name, mission, colour
    `, [name, mission, colour]);
    
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

// Create new event
app.post('/api/events', async (req, res) => {
  const { satellite_id, activity_type, duration, planned_time } = req.body;
  
  if (!satellite_id || !activity_type || !duration || !planned_time) {
    return res.status(400).json({ error: 'Satellite ID, activity type, duration, and planned_time are required' });
  }
  
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO event (satellite_id, activity_type, duration, planned_time) 
      VALUES ($1, $2, $3, $4) 
      RETURNING event_id, satellite_id, activity_type, duration, planned_time
    `, [satellite_id, activity_type, duration, planned_time]);
    
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