// Frontend API proxy for targets
export async function GET(context) {
  try {
    const backendUrl = 'http://api:3000'; // Direct reference to avoid client-side bundling issues
    const response = await fetch(`${backendUrl}/api/targets`);
    
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
    console.error('Error proxying targets request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch targets',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}