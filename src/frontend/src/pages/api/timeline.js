import { Client } from 'pg';

export async function get(context) {
  const client = new Client({
    host: process.env.DB_HOST || 'mission-db',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'missionuser',
    password: process.env.DB_PASSWORD || 'missionpass',
    database: process.env.DB_NAME || 'missionplanning',
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
