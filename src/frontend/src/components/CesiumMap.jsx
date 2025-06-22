// Enhanced Cesium 3D Map with day/night cycle and performance optimizations
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';

function CesiumMap({ satellites = [], groundStations = [], onToggle2D }) {
  const mapRef = useRef(null);
  const viewerRef = useRef(null);
  const entitiesRef = useRef({ satellites: new Map(), groundStations: new Map() });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(false);
  // Time controls removed for performance

  // Memoized color mapping
  const getColorForSatellite = useCallback((colour) => {
    const colorMap = {
      'red': '#ef4444', 'green': '#22c55e', 'blue': '#3b82f6', 'yellow': '#eab308',
      'orange': '#f97316', 'purple': '#a855f7', 'grey': '#6b7280', 'gray': '#6b7280',
      'black': '#1f2937', 'white': '#f9fafb', 'cyan': '#06b6d4', 'magenta': '#d946ef'
    };
    return colorMap[colour] || '#6b7280';
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeCesium = async () => {
      try {
        console.log('Initializing Cesium...');
        
        // Import Cesium
        const Cesium = await import('cesium');
        console.log('Cesium imported successfully');
        
        // For development, we'll use basic imagery without Ion token
        // To use high-quality imagery/terrain, get a free token from https://cesium.com/ion/
        // Cesium.Ion.defaultAccessToken = 'your_cesium_ion_token_here';
        
        if (!mounted) return;

        // Wait for DOM to be ready
        await new Promise(resolve => {
          if (mapRef.current && document.contains(mapRef.current)) {
            resolve();
          } else {
            const checkContainer = () => {
              if (mapRef.current && document.contains(mapRef.current)) {
                resolve();
              } else {
                requestAnimationFrame(checkContainer);
              }
            };
            checkContainer();
          }
        });

        // Double-check after waiting
        if (!mounted || !mapRef.current) {
          console.log('Component unmounted or container lost during wait');
          return;
        }

        console.log('Container element ready:', mapRef.current);

        // Minimal performance settings for fast loading
        const performanceSettings = {
          // Use custom Earth texture (your 5MB earth image)
          imageryProvider: new Cesium.SingleTileImageryProvider({
            url: './Assets/Textures/earth_5mb.jpg',
            rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0)
          }),
          terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Basic terrain, no Ion required
          homeButton: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          navigationHelpButton: false,
          animation: false, // Disable for faster loading
          timeline: false, // Disable for faster loading
          fullscreenButton: false,
          geocoder: false,
          infoBox: true,
          selectionIndicator: true,
          requestRenderMode: true, // Only render when needed
          maximumRenderTimeChange: Infinity,
          shadows: false, // Disable for faster loading
          skyBox: false, // Disable for faster loading
          skyAtmosphere: false // Disable for faster loading
        };

        // Initialize Cesium viewer with performance settings
        console.log('Creating Cesium viewer with container:', mapRef.current);
        viewerRef.current = new Cesium.Viewer(mapRef.current, performanceSettings);
        console.log('Cesium viewer created successfully');
        
        // Configure scene for maximum performance with custom Earth texture
        const scene = viewerRef.current.scene;
        scene.globe.enableLighting = false; // Disable for faster loading
        scene.globe.showWaterEffect = false; // Disable for performance
        scene.fog.enabled = false; // Disable fog for performance
        scene.skyBox.show = false; // Disabled in settings
        scene.sun.show = false; // Disable for faster loading
        scene.moon.show = false; // Disable for faster loading
        
        // Disable atmosphere effects for speed
        scene.globe.dynamicAtmosphereLighting = false;
        scene.globe.dynamicAtmosphereLightingFromSun = false;
        
        // Optimize for custom texture
        scene.globe.baseColor = Cesium.Color.WHITE; // Better color reproduction
        scene.globe.showGroundAtmosphere = false; // Disable atmosphere for performance
        
        // Configure frame rate
        viewerRef.current.targetFrameRate = 60;
        
        // Set initial camera position
        viewerRef.current.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
          orientation: {
            heading: 0.0,
            pitch: -0.5,
            roll: 0.0
          }
        });

        // Add initial data
        addSatellites(Cesium, satellites);
        addGroundStations(Cesium, groundStations);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Cesium:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeCesium();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying Cesium viewer:', e);
        }
      }
    };
  }, []);

  // Optimized satellite addition with entity reuse
  const addSatellites = useCallback(async (Cesium, satelliteData) => {
    const existingSatellites = entitiesRef.current.satellites;
    const currentSatelliteIds = new Set(satelliteData.map(s => s.satellite_id || s.name));
    
    // Remove satellites that no longer exist
    for (const [id, entity] of existingSatellites) {
      if (!currentSatelliteIds.has(id)) {
        viewerRef.current.entities.remove(entity);
        existingSatellites.delete(id);
      }
    }
    
    // Add or update satellites
    satelliteData.forEach(satellite => {
      if (!satellite.latitude || !satellite.longitude) return;
      
      const id = satellite.satellite_id || satellite.name;
      const position = Cesium.Cartesian3.fromDegrees(
        satellite.longitude,
        satellite.latitude,
        (satellite.altitude || 400) * 1000 // Convert km to meters
      );
      
      let entity = existingSatellites.get(id);
      
      if (entity) {
        // Update existing entity
        entity.position = position;
        if (entity.label) {
          entity.label.show = showLabels;
        }
      } else {
        // Create new entity
        entity = viewerRef.current.entities.add({
          id: `satellite_${id}`,
          position: position,
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString(getColorForSatellite(satellite.colour)),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.NONE,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 1.5e7, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: showLabels ? {
            text: satellite.name,
            font: '10pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -25),
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          } : undefined,
          description: `
            <div style="padding: 10px;">
              <h3>${satellite.name}</h3>
              <p><strong>Type:</strong> Satellite</p>
              <p><strong>Altitude:</strong> ${(satellite.altitude || 0).toFixed(0)} km</p>
              <p><strong>Coordinates:</strong> ${satellite.latitude.toFixed(2)}°, ${satellite.longitude.toFixed(2)}°</p>
              <p><strong>Last Update:</strong> ${new Date(satellite.timestamp || Date.now()).toLocaleString()}</p>
            </div>
          `
        });
        
        existingSatellites.set(id, entity);
      }
    });
  }, [getColorForSatellite, showLabels]);

  // Optimized ground station addition
  const addGroundStations = useCallback((Cesium, stationData) => {
    const existingStations = entitiesRef.current.groundStations;
    const currentStationIds = new Set(stationData.map(s => s.gs_id || s.name));
    
    // Remove stations that no longer exist
    for (const [id, entity] of existingStations) {
      if (!currentStationIds.has(id)) {
        viewerRef.current.entities.remove(entity);
        existingStations.delete(id);
      }
    }
    
    // Add or update ground stations
    stationData.forEach(station => {
      const id = station.gs_id || station.name;
      const position = Cesium.Cartesian3.fromDegrees(
        station.longitude,
        station.latitude,
        (station.altitude || 0) * 1000
      );
      
      let entity = existingStations.get(id);
      
      if (entity) {
        // Update existing entity
        entity.position = position;
        if (entity.label) {
          entity.label.show = showLabels;
        }
      } else {
        // Create new entity
        entity = viewerRef.current.entities.add({
          id: `groundstation_${id}`,
          position: position,
          point: {
            pixelSize: 6,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.2, 1.5e7, 0.4)
          },
          label: showLabels ? {
            text: station.name,
            font: '9pt sans-serif',
            fillColor: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0)
          } : undefined,
          description: `
            <div style="padding: 10px;">
              <h3>${station.name}</h3>
              <p><strong>Type:</strong> Ground Station</p>
              <p><strong>Coordinates:</strong> ${station.latitude.toFixed(2)}°, ${station.longitude.toFixed(2)}°</p>
              <p><strong>Altitude:</strong> ${(station.altitude || 0).toFixed(1)} km</p>
            </div>
          `
        });
        
        existingStations.set(id, entity);
      }
    });
  }, [showLabels]);

  // Update data when props change
  useEffect(() => {
    if (viewerRef.current && !isLoading) {
      const updateData = async () => {
        const Cesium = await import('cesium');
        addSatellites(Cesium, satellites);
        addGroundStations(Cesium, groundStations);
      };
      updateData();
    }
  }, [satellites, groundStations, isLoading, addSatellites, addGroundStations]);

  // Time controls disabled for performance

  // Handle label toggle
  const toggleLabels = useCallback(() => {
    setShowLabels(prev => {
      const newValue = !prev;
      if (viewerRef.current) {
        // Update all existing entities
        [...entitiesRef.current.satellites.values(), ...entitiesRef.current.groundStations.values()].forEach(entity => {
          if (entity.label) {
            entity.label.show = newValue;
          }
        });
      }
      return newValue;
    });
  }, []);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Failed to load 3D map</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={onToggle2D}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Switch to 2D Map
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading 3D Earth...</p>
          <p className="text-xs text-gray-500 mt-2">Initializing Cesium engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* 3D Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2">
          <button
            onClick={toggleLabels}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors
              ${showLabels 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {showLabels ? '🏷️ Labels ON' : '🏷️ Labels OFF'}
          </button>
        </div>
        
        <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs">
          <div className="flex space-x-4">
            <span>🛰️ {satellites.length}</span>
            <span>📡 {groundStations.length}</span>
            <span>🌍 3D View</span>
          </div>
        </div>
      </div>
      
      {/* Performance indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs text-green-600">
        🚀 Fast 3D Mode
      </div>
    </div>
  );
}

export default memo(CesiumMap);