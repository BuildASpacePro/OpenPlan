// src/frontend/src/pages/api/timeline.js
// Now proxies to InfluxDB-backed API instead of direct PostgreSQL connection

export async function get(context) {
  try {
    // Use the API service URL (from compose.yaml environment)
    const apiUrl = process.env.BACKEND_URL || 'http://api:3000';
    
    console.log('Fetching timeline from InfluxDB-backed API...');
    
    // Forward query parameters to the API
    const url = new URL(context.request.url);
    const queryParams = url.searchParams;
    
    const apiEndpoint = `${apiUrl}/api/timeline${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('API endpoint:', apiEndpoint);
    
    const response = await fetch(apiEndpoint);
    
    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    const timelineData = await response.json();
    console.log(`Retrieved ${timelineData.length} timeline events from InfluxDB API`);
    
    return new Response(JSON.stringify(timelineData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Timeline API proxy error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Timeline API proxy failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}