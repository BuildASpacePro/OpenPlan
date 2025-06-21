// StandardCesiumMap.jsx - Standard Cesium implementation following best practices
import React, { useEffect, useRef, useState } from 'react';

export default function StandardCesiumMap({ satellites = [], groundStations = [], onToggle2D }) {
  const mapRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeCesium = async () => {
      try {
        console.log('Starting Cesium initialization...');
        
        // Import Cesium using standard ES6 import
        const Cesium = await import('cesium');
        console.log('Cesium module imported successfully');
        
        // Ensure we're still mounted
        if (!mounted || !mapRef.current) {
          console.log('Component unmounted during import');
          return;
        }

        // Minimal Cesium configuration for maximum compatibility
        console.log('Creating Cesium viewer...');
        
        viewerRef.current = new Cesium.Viewer(mapRef.current, {
          // Disable all optional features for fastest loading
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          
          // Use basic providers
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          
          // Minimal rendering settings
          requestRenderMode: false, // Continuous rendering for now
          targetFrameRate: 30
        });

        console.log('Cesium viewer created successfully');

        // Basic scene configuration
        const scene = viewerRef.current.scene;
        scene.fog.enabled = false;
        scene.skyAtmosphere.show = false;
        
        // Set camera position
        viewerRef.current.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000)
        });

        // Add sample data
        console.log('Adding satellites and ground stations...');
        addEntities(Cesium, satellites, groundStations);

        setIsLoading(false);
        console.log('Cesium initialization complete');

      } catch (err) {
        console.error('Cesium initialization failed:', err);
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
        setIsLoading(false);
      }
    };

    // Add entities to the scene
    const addEntities = (Cesium, satellites, groundStations) => {
      try {
        // Add a simple test entity first
        viewerRef.current.entities.add({
          position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
          point: {
            pixelSize: 10,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: 'Test Point',
            font: '12pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -30)
          }
        });

        // Add satellites
        satellites.forEach((satellite, index) => {
          if (satellite.latitude && satellite.longitude) {
            viewerRef.current.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                satellite.longitude,
                satellite.latitude,
                (satellite.altitude || 400) * 1000
              ),
              point: {
                pixelSize: 8,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2
              },
              label: {
                text: satellite.name || `Sat ${index}`,
                font: '10pt sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -20)
              }
            });
          }
        });

        // Add ground stations
        groundStations.forEach((station, index) => {
          viewerRef.current.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              station.longitude,
              station.latitude,
              (station.altitude || 0) * 1000
            ),
            point: {
              pixelSize: 6,
              color: Cesium.Color.BLUE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: station.name || `GS ${index}`,
              font: '9pt sans-serif',
              fillColor: Cesium.Color.CYAN,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -15)
            }
          });
        });

        console.log(`Added ${satellites.length} satellites and ${groundStations.length} ground stations`);
      } catch (error) {
        console.error('Error adding entities:', error);
      }
    };

    initializeCesium();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          console.log('Cesium viewer destroyed');
        } catch (e) {
          console.warn('Error destroying Cesium viewer:', e);
        }
      }
    };
  }, []); // Only run once

  if (error) {
    return (
      <div className="w-full h-full bg-red-50 rounded-lg border border-red-300 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-600 mb-2">❌ Cesium Failed to Load</div>
          <p className="text-sm text-red-700 mb-4 max-w-md">{error}</p>
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Loading Standard Cesium...</p>
          <p className="text-xs text-gray-500 mt-2">Following standard practices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Simple controls */}
      <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs">
        <div className="flex space-x-4">
          <span>🛰️ {satellites.length}</span>
          <span>📡 {groundStations.length}</span>
          <span>🌍 Standard 3D</span>
        </div>
      </div>
      
      {/* Success indicator */}
      <div className="absolute top-4 left-4 z-10 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-xs">
        ✅ Cesium Loaded Successfully
      </div>
    </div>
  );
}