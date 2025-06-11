// Frontend API proxy for ground stations
export async function GET(context) {
  try {
    const backendUrl = 'http://api:3000'; // Direct reference to avoid client-side bundling issues
    const response = await fetch(`${backendUrl}/api/groundstations`);
    
    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error proxying ground stations request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch ground stations',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}