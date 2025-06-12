// Frontend API proxy for bulk access windows
export async function POST(context) {
  try {
    const body = await context.request.json();
    
    const backendUrl = 'http://api:3000'; // Direct reference to avoid client-side bundling issues
    const backendRequestUrl = `${backendUrl}/api/accesswindows/bulk`;
    
    const response = await fetch(backendRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
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
    console.error('Error proxying bulk access windows request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch bulk access windows',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}