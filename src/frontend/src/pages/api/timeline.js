// src/frontend/src/pages/api/timeline.js
import { Client } from 'pg';

export async function get(context) {
  // Use DB2 if specified, otherwise default to original
  const useDb2 = process.env.USE_DB2 === 'true';
  const client = new Client({
    host: useDb2 ? (process.env.DB2_HOST || 'mission-db2') : (process.env.DB_HOST || 'mission-db'),
    port: useDb2 ? (process.env.DB2_PORT || 5432) : (process.env.DB_PORT || 5432),
    user: useDb2 ? (process.env.DB2_USER || 'missionuser2') : (process.env.DB_USER || 'missionuser'),
    password: useDb2 ? (process.env.DB2_PASSWORD || 'missionpass2') : (process.env.DB_PASSWORD || 'missionpass'),
    database: useDb2 ? (process.env.DB2_NAME || 'missionplanning2') : (process.env.DB_NAME || 'missionplanning'),
  });

  await client.connect();

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

  await client.end();

  return new Response(JSON.stringify(result.rows), {
    headers: { 'Content-Type': 'application/json' }
  });
}
