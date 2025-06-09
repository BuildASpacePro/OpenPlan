// Cesium 3D Map Component - Lazy loaded for performance
import React, { useEffect, useRef, useState } from 'react';

function CesiumMap({ satellites = [], groundStations = [], onToggle2D }) {
  const mapRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeCesium = async () => {
      try {
        // Dynamically import Cesium to reduce initial bundle size
        const Cesium = await import('cesium');
        
        if (!mounted) return;

        // Initialize Cesium viewer
        viewerRef.current = new Cesium.Viewer(mapRef.current, {
          terrainProvider: Cesium.createWorldTerrain(),
          homeButton: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          geocoder: false,
          infoBox: true,
          selectionIndicator: true
        });

        // Add satellites and ground stations
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
        viewerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (viewerRef.current && !isLoading) {
      // Update satellites when data changes
      updateSatellites(satellites);
    }
  }, [satellites, isLoading]);

  const addSatellites = (Cesium, satellites) => {
    satellites.forEach(satellite => {
      if (satellite.latitude && satellite.longitude) {
        const entity = viewerRef.current.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            satellite.longitude,
            satellite.latitude,
            satellite.altitude * 1000 // Convert km to meters
          ),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString(getColorForSatellite(satellite.colour)),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.NONE
          },
          label: {
            text: satellite.name,
            font: '12pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -40)
          }
        });
      }
    });
  };

  const addGroundStations = (Cesium, stations) => {
    stations.forEach(station => {
      viewerRef.current.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          station.longitude,
          station.latitude,
          station.altitude * 1000
        ),
        point: {
          pixelSize: 8,
          color: Cesium.Color.BLUE,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: station.name,
          font: '10pt sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30)
        }
      });
    });
  };

  const updateSatellites = (satellites) => {
    // For now, clear and re-add all entities
    // In production, you'd want to update existing entities for better performance
    viewerRef.current.entities.removeAll();
    
    const Cesium = window.Cesium;
    addSatellites(Cesium, satellites);
    addGroundStations(Cesium, groundStations);
  };

  const getColorForSatellite = (colour) => {
    const colorMap = {
      'red': '#ef4444',
      'green': '#22c55e', 
      'blue': '#3b82f6',
      'yellow': '#eab308',
      'orange': '#f97316',
      'purple': '#a855f7',
      'grey': '#6b7280',
      'gray': '#6b7280'
    };
    return colorMap[colour] || '#6b7280';
  };

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load 3D map</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button 
            onClick={onToggle2D}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Switch to 2D Map
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 3D map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96">
      <div ref={mapRef} className="w-full h-full rounded-lg border border-gray-300"></div>
      <button
        onClick={onToggle2D}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        Switch to 2D
      </button>
    </div>
  );
}

export default React.memo(CesiumMap);