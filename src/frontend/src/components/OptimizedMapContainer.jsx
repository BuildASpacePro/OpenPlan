// OptimizedMapContainer.jsx - Performance-optimized map with 2D/3D toggle
import React, { useState, useEffect, useRef, Suspense, lazy, memo, useMemo } from 'react';

// Lazy load Cesium to reduce initial bundle size - only when 3D is requested
const CesiumMap = lazy(() => 
  import('./StandardCesiumMap.jsx').catch(() => {
    console.warn('Cesium failed to load, falling back to 2D map');
    return { default: () => <div className="p-4 text-center text-red-600">3D map unavailable</div> };
  })
);

// Import maps dynamically only when needed
const loadCDNLeafletMap = () => import('./CDNLeafletMap.jsx');
const loadSimpleMap = () => import('./SimpleMap.jsx');

function OptimizedMapContainer({ 
  satellites = [], 
  groundStations = [], 
  onRefresh,
  className = "w-full h-96"
}) {
  const [mapMode, setMapMode] = useState('2d'); // Start with 2D for faster initial load
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [leafletComponent, setLeafletComponent] = useState(null);
  const [simpleMapComponent, setSimpleMapComponent] = useState(null);
  const [useSimpleMap, setUseSimpleMap] = useState(false);
  const [cesiumLoadAttempted, setCesiumLoadAttempted] = useState(false);
  
  // Memoize map data to prevent unnecessary re-renders
  const mapData = useMemo(() => ({
    satellites,
    groundStations,
    lastUpdate: new Date()
  }), [satellites, groundStations]);

  // Preload map components
  useEffect(() => {
    // Try to load CDN Leaflet first, fallback to SimpleMap if it fails
    loadCDNLeafletMap()
      .then(module => {
        setLeafletComponent(() => module.default);
        console.log('CDN Leaflet loaded successfully');
      })
      .catch(error => {
        console.warn('Failed to load CDN Leaflet, using SimpleMap fallback:', error);
        setUseSimpleMap(true);
        return loadSimpleMap();
      })
      .then(module => {
        if (module) {
          setSimpleMapComponent(() => module.default);
          console.log('SimpleMap loaded as fallback');
        }
      })
      .catch(error => {
        console.error('Failed to load any map component:', error);
      });
  }, []);

  const handleToggleMap = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Pre-load Cesium when switching to 3D for the first time
    if (mapMode === '2d' && !cesiumLoadAttempted) {
      setCesiumLoadAttempted(true);
      try {
        // Pre-load Cesium module to reduce switching delay
        await import('./StandardCesiumMap.jsx');
        console.log('Cesium pre-loaded successfully');
      } catch (error) {
        console.warn('Cesium pre-load failed:', error);
      }
    }
    
    // Small delay for smooth UX
    setTimeout(() => {
      setMapMode(prev => prev === '2d' ? '3d' : '2d');
      setIsTransitioning(false);
    }, 200);
  };

  // Memoize controls to prevent unnecessary re-renders
  const MapControls = memo(() => (
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
         mapMode === '3d' ? '🗺️ Switch to 2D' : '🌍 Switch to 3D'}
      </button>
      
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
      >
        🔄 Refresh
      </button>
    </div>
  ));

  const LoadingOverlay = memo(({ message = "Loading map..." }) => (
    <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-20 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  ));

  return (
    <div className={`relative ${className} bg-gray-100 rounded-lg border border-gray-300 overflow-hidden`}>
      <MapControls />
      
      {isTransitioning && <LoadingOverlay message={`Switching to ${mapMode === '2d' ? '3D' : '2D'} view...`} />}
      
      {mapMode === '2d' && !useSimpleMap && leafletComponent && (
        <div className="w-full h-full">
          {React.createElement(leafletComponent, {
            satellites: mapData.satellites,
            groundStations: mapData.groundStations,
            onToggle3D: handleToggleMap
          })}
        </div>
      )}
      
      {mapMode === '2d' && useSimpleMap && simpleMapComponent && (
        <div className="w-full h-full">
          {React.createElement(simpleMapComponent, {
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
      
      {!leafletComponent && !simpleMapComponent && mapMode === '2d' && (
        <LoadingOverlay message="Initializing map..." />
      )}
    </div>
  );
}

// Export memoized component for better performance
export default memo(OptimizedMapContainer);