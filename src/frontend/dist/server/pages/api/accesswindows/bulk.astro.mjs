export { renderers } from '../../../renderers.mjs';

// Frontend API proxy for bulk access windows
async function POST(context) {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
