// src/frontend/src/pages/api/timeline.js
import { Client } from 'pg';

export async function get(context) {
  let client;
  try {
    // Connect to the PostgreSQL database service (called 'backend')
    client = new Client({
      host: 'backend',  // PostgreSQL service name
      port: 5432,
      user: 'missionuser',
      password: 'missionpass',
      database: 'missionplanning',
      // Add connection timeout and retry options
      connectionTimeoutMillis: 10000,
    });

    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Successfully connected to database');

    // Test the connection first
    await client.query('SELECT 1');
    console.log('Database connection test successful');

    // Join event and satellite tables for timeline
    const result = await client.query(`
      SELECT
        e.event_id,
        s.name AS satellite_name,
        s.colour,
        e.activity_type,
        e.duration
      FROM event e
      JOIN satellite s ON e.satellite_id = s.satellite_id
      ORDER BY e.event_id ASC
    `);

    console.log(`Retrieved ${result.rows.length} timeline events`);
    
    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Database connection failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
}