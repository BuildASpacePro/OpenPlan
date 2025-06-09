// Lazy Map Container - Switches between 2D and 3D maps with lazy loading
import React, { useState, lazy, Suspense } from 'react';

const CesiumMap = lazy(() => import('./CesiumMap.jsx'));

function LazyMapContainer({ satellites = [], groundStations = [] }) {
  const [is3D, setIs3D] = useState(false);

  const toggle2D3D = () => {
    setIs3D(!is3D);
  };

  const MapLoadingFallback = ({ mapType }) => (
    <div className="w-full h-96 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading {mapType} map...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment for the first load</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Global Mission Overview</h2>
        <button
          onClick={toggle2D3D}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Switch to {is3D ? '2D' : '3D'} View
        </button>
      </div>

      {/* Map Container */}
      {is3D ? (
        <Suspense fallback={<MapLoadingFallback mapType="3D" />}>
          <CesiumMap 
            satellites={satellites}
            groundStations={groundStations}
            onToggle2D={() => setIs3D(false)}
          />
        </Suspense>
      ) : (
        <div id="mapContainer" className="w-full h-96 rounded-lg border border-gray-300"></div>
      )}

      {/* Map Info */}
      <div className="text-sm text-gray-600">
        <p>
          {is3D 
            ? '• 3D view powered by Cesium.js - Shows orbital trajectories and global perspective' 
            : '• 2D view using Leaflet - Lightweight and fast for basic positioning'
          }
        </p>
        <p>• Real-time satellite positions updated every 60 seconds</p>
      </div>
    </div>
  );
}

export default React.memo(LazyMapContainer);