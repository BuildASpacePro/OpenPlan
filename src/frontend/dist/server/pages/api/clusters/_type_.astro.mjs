export { renderers } from '../../../renderers.mjs';

// src/frontend/src/pages/api/clusters/[type].js
// Proxy endpoint for cluster data

async function GET(context) {
  try {
    const { type } = context.params;
    const validTypes = ['constellation', 'mission', 'organization', 'technical'];
    
    if (!validTypes.includes(type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid cluster type', 
        valid_types: validTypes 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the API service URL (from compose.yaml environment)
    const apiUrl = process.env.BACKEND_URL || 'http://api:3000';
    
    console.log(`Fetching cluster data for type: ${type} from ${apiUrl}`);
    
    const response = await fetch(`${apiUrl}/api/clusters/${type}`);
    
    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    const clusterData = await response.json();
    console.log(`Retrieved ${clusterData.clusters?.length || 0} clusters of type ${type}`);
    
    return new Response(JSON.stringify(clusterData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cluster API proxy error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Cluster API proxy failed',
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
