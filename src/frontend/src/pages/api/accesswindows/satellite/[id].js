// src/frontend/src/pages/api/accesswindows/satellite/[id].js
// Proxy endpoint for satellite access windows

export async function GET(context) {
  try {
    const { id } = context.params;
    
    if (!/^\d+$/.test(id)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid satellite ID' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the API service URL (from compose.yaml environment)
    const apiUrl = process.env.BACKEND_URL || 'http://api:3000';
    
    // Forward query parameters to the API
    const url = new URL(context.request.url);
    const queryParams = url.searchParams;
    
    const apiEndpoint = `${apiUrl}/api/accesswindows/satellite/${id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log(`Fetching access windows for satellite ${id} from ${apiEndpoint}`);
    
    const response = await fetch(apiEndpoint);
    
    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    const accessData = await response.json();
    console.log(`Retrieved ${accessData.access_windows?.length || 0} access windows for satellite ${id}`);
    
    return new Response(JSON.stringify(accessData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Satellite access windows API proxy error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Satellite access windows API proxy failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}