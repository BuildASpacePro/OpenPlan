// Frontend API proxy for access window planned status updates
export async function PUT(context) {
  try {
    const body = await context.request.json();
    
    // Get authorization header from the request
    const authHeader = context.request.headers.get('authorization');
    
    const backendUrl = 'http://api:3000'; // Direct reference to avoid client-side bundling issues
    const backendRequestUrl = `${backendUrl}/api/accesswindows/planned`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendRequestUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error proxying planned status update:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to update planned status',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(context) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}