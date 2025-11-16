export { renderers } from '../../../renderers.mjs';

// src/frontend/src/pages/api/debug/accesswindows.js
// Debug proxy endpoint for access windows data

async function GET(context) {
  try {
    // Use the API service URL (from compose.yaml environment)
    const apiUrl = process.env.BACKEND_URL || 'http://api:3000';
    
    console.log('Debug: Fetching access windows debug data from API...');
    
    const response = await fetch(`${apiUrl}/api/debug/accesswindows`);
    
    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    const debugData = await response.json();
    console.log('Debug: Retrieved access windows debug data:', debugData);
    
    return new Response(JSON.stringify(debugData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Debug access windows API proxy error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Debug access windows API proxy failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
