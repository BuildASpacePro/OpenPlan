// Frontend API proxy for ground station access windows
export async function GET(context) {
  try {
    const { id } = context.params;
    const url = new URL(context.request.url);
    const queryParams = url.searchParams;
    
    const backendUrl = 'http://api:3000'; // Direct reference to avoid client-side bundling issues
    const backendRequestUrl = `${backendUrl}/api/accesswindows/groundstation/${id}?${queryParams.toString()}`;
    
    const response = await fetch(backendRequestUrl);
    
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
    console.error('Error proxying access windows request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch access windows',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}