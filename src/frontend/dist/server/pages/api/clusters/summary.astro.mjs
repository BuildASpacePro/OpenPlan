export { renderers } from '../../../renderers.mjs';

// src/frontend/src/pages/api/clusters/summary.js
// Proxy endpoint for cluster summary data

async function GET(context) {
  try {
    // Use the API service URL (from compose.yaml environment)
    const apiUrl = process.env.BACKEND_URL || 'http://api:3000';
    
    console.log('Fetching cluster summary data from API...');
    
    const response = await fetch(`${apiUrl}/api/clusters/summary`);
    
    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    const summaryData = await response.json();
    console.log('Retrieved cluster summary data:', summaryData);
    
    return new Response(JSON.stringify(summaryData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cluster summary API proxy error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Cluster summary API proxy failed',
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
