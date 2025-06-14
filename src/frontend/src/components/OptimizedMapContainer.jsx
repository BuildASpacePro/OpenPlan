// OptimizedMapContainer.jsx - Performance-optimized map with 2D/3D toggle
import { useState, useEffect, useRef, Suspense, lazy } from 'react';

// Lazy load Cesium to reduce initial bundle size
const CesiumMap = lazy(() => import('./CesiumMap.jsx'));

// Import Leaflet dynamically only when needed
const loadLeafletMap = () => import('./LeafletMap.jsx');

export default function OptimizedMapContainer({ 
  satellites = [], 
  groundStations = [], 
  onRefresh,
  className = "w-full h-96"
}) {
  const [mapMode, setMapMode] = useState('2d'); // '2d' or '3d'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [leafletComponent, setLeafletComponent] = useState(null);
  const [mapData, setMapData] = useState({
    satellites: [],
    groundStations: [],
    lastUpdate: null
  });

  // Preload Leaflet component
  useEffect(() => {
    loadLeafletMap().then(module => {
      setLeafletComponent(() => module.default);
    });
  }, []);

  // Update map data when props change
  useEffect(() => {
    setMapData({
      satellites,
      groundStations,
      lastUpdate: new Date()
    });
  }, [satellites, groundStations]);

  const handleToggleMap = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Small delay for smooth UX
    setTimeout(() => {
      setMapMode(prev => prev === '2d' ? '3d' : '2d');
      setIsTransitioning(false);
    }, 200);
  };

  const MapControls = () => (
    <div className="absolute top-4 right-4 z-10 flex space-x-2">
      <button
        onClick={handleToggleMap}
        disabled={isTransitioning}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg
          ${mapMode === '2d' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
          }
          ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isTransitioning ? 'Switching...' : 
         mapMode === '2d' ? '🌍 Switch to 3D' : '🗺️ Switch to 2D'}
      </button>
      
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
      >
        🔄 Refresh
      </button>
    </div>
  );

  const LoadingOverlay = ({ message = "Loading map..." }) => (
    <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-20 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className} bg-gray-100 rounded-lg border border-gray-300 overflow-hidden`}>
      <MapControls />
      
      {isTransitioning && <LoadingOverlay message={`Switching to ${mapMode === '2d' ? '3D' : '2D'} view...`} />}
      
      {mapMode === '2d' && leafletComponent && (
        <div className="w-full h-full">
          {React.createElement(leafletComponent, {
            satellites: mapData.satellites,
            groundStations: mapData.groundStations,
            onToggle3D: handleToggleMap
          })}
        </div>
      )}
      
      {mapMode === '3d' && (
        <Suspense fallback={<LoadingOverlay message="Loading 3D map engine..." />}>
          <CesiumMap
            satellites={mapData.satellites}
            groundStations={mapData.groundStations}
            onToggle2D={handleToggleMap}
          />
        </Suspense>
      )}
      
      {!leafletComponent && mapMode === '2d' && (
        <LoadingOverlay message="Initializing map..." />
      )}
    </div>
  );
}