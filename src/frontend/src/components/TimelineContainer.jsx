import { useState, useEffect } from 'react';

// Debug version of your TimelineContainer to identify issues
export default function TimelineDebug({ events = [], satellites = [] }) {
  const [debugInfo, setDebugInfo] = useState({
    eventsReceived: false,
    eventsCount: 0,
    satellitesCount: 0,
    sampleEvent: null,
    errors: []
  });

  useEffect(() => {
    console.log('Timeline Debug - Props received:', { events, satellites });
    
    const errors = [];
    
    // Check if events is an array
    if (!Array.isArray(events)) {
      errors.push(`Events is not an array: ${typeof events}`);
    }
    
    // Check if satellites is an array
    if (!Array.isArray(satellites)) {
      errors.push(`Satellites is not an array: ${typeof satellites}`);
    }
    
    setDebugInfo({
      eventsReceived: !!events,
      eventsCount: Array.isArray(events) ? events.length : 0,
      satellitesCount: Array.isArray(satellites) ? satellites.length : 0,
      sampleEvent: Array.isArray(events) && events.length > 0 ? events[0] : null,
      errors
    });
  }, [events, satellites]);

  return (
    <div className="p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
      <h2 className="text-xl font-bold mb-4 text-blue-800">Timeline Debug Information</h2>
      
      <div className="space-y-3">
        <div className="p-3 bg-white rounded border">
          <strong>Events Data:</strong>
          <ul className="mt-2 text-sm">
            <li>Received: {debugInfo.eventsReceived ? '✅ Yes' : '❌ No'}</li>
            <li>Count: {debugInfo.eventsCount}</li>
            <li>Type: {typeof events}</li>
          </ul>
        </div>
        
        <div className="p-3 bg-white rounded border">
          <strong>Satellites Data:</strong>
          <ul className="mt-2 text-sm">
            <li>Count: {debugInfo.satellitesCount}</li>
            <li>Type: {typeof satellites}</li>
            <li>Values: {JSON.stringify(satellites)}</li>
          </ul>
        </div>
        
        {debugInfo.sampleEvent && (
          <div className="p-3 bg-white rounded border">
            <strong>Sample Event:</strong>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.sampleEvent, null, 2)}
            </pre>
          </div>
        )}
        
        {debugInfo.errors.length > 0 && (
          <div className="p-3 bg-red-100 border border-red-300 rounded">
            <strong className="text-red-700">Errors:</strong>
            <ul className="mt-2 text-sm text-red-600">
              {debugInfo.errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="p-3 bg-white rounded border">
          <strong>Raw Props:</strong>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({ events, satellites }, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Test if basic React rendering works */}
      <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
        <strong className="text-green-700">React Rendering Test:</strong>
        <p className="text-sm text-green-600">If you can see this, React components are working!</p>
        <button 
          onClick={() => alert('React event handling works!')}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Click
        </button>
      </div>
    </div>
  );
}