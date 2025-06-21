// LeafletMap.jsx - Optimized 2D map with day/night cycle
import React, { useEffect, useRef, useState } from 'react';

export default function LeafletMap({ satellites = [], groundStations = [], onToggle3D }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    satellites: [],
    groundStations: [],
    trajectories: [],
    dayNightOverlay: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showDayNight, setShowDayNight] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Color mapping for satellites
  const colorMap = {
    'red': '#ef4444', 'green': '#22c55e', 'blue': '#3b82f6', 'yellow': '#eab308',
    'orange': '#f97316', 'purple': '#a855f7', 'grey': '#6b7280', 'gray': '#6b7280',
    'black': '#1f2937', 'white': '#f9fafb', 'cyan': '#06b6d4', 'magenta': '#d946ef'
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (mapInstanceRef.current) return;

      try {
        // Dynamically import Leaflet
        const L = await import('leaflet');
        
        // Fix for marker icons in Vite/ES6
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map instance
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          minZoom: 1,
          maxZoom: 10,
          worldCopyJump: false,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0,
          preferCanvas: true // Better performance for many markers
        });

        // Add high-quality tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 10,
          updateWhenIdle: true,
          updateWhenZooming: false
        }).addTo(mapInstanceRef.current);

        // Initialize day/night overlay
        if (showDayNight) {
          await initDayNightOverlay(L);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showDayNight]);

  // Day/Night terminator calculation
  const calculateDayNightTerminator = () => {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const solarDeclination = -23.45 * Math.cos(2 * Math.PI * (dayOfYear + 10) / 365.25) * Math.PI / 180;
    
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const solarLongitude = (utcHours - 12) * 15; // 15 degrees per hour
    
    const terminatorCoords = [];
    
    for (let lat = -90; lat <= 90; lat += 2) {
      const latRad = lat * Math.PI / 180;
      const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(solarDeclination));
      
      if (!isNaN(hourAngle)) {
        const lng1 = solarLongitude - hourAngle * 180 / Math.PI;
        const lng2 = solarLongitude + hourAngle * 180 / Math.PI;
        
        terminatorCoords.push([lat, ((lng1 % 360) + 360) % 360 - 180]);
        terminatorCoords.push([lat, ((lng2 % 360) + 360) % 360 - 180]);
      }
    }
    
    return terminatorCoords;
  };

  // Initialize day/night overlay
  const initDayNightOverlay = async (L) => {
    try {
      const terminatorCoords = calculateDayNightTerminator();
      
      // Create night overlay (simplified approach)
      const nightOverlay = L.rectangle([[-90, -180], [90, 180]], {
        color: 'transparent',
        fillColor: '#000033',
        fillOpacity: 0.3,
        interactive: false
      });
      
      markersRef.current.dayNightOverlay = nightOverlay;
      nightOverlay.addTo(mapInstanceRef.current);
      
      // Update every minute
      setInterval(() => {
        if (showDayNight && markersRef.current.dayNightOverlay) {
          updateDayNightOverlay(L);
        }
      }, 60000);
      
    } catch (error) {
      console.error('Failed to initialize day/night overlay:', error);
    }
  };

  // Update day/night overlay
  const updateDayNightOverlay = (L) => {
    if (markersRef.current.dayNightOverlay) {
      mapInstanceRef.current.removeLayer(markersRef.current.dayNightOverlay);
    }
    
    const terminatorCoords = calculateDayNightTerminator();
    const nightOverlay = L.rectangle([[-90, -180], [90, 180]], {
      color: 'transparent',
      fillColor: '#000033',
      fillOpacity: 0.3,
      interactive: false
    });
    
    markersRef.current.dayNightOverlay = nightOverlay;
    nightOverlay.addTo(mapInstanceRef.current);
  };

  // Create optimized satellite marker
  const createSatelliteMarker = (L, satellite) => {
    const color = colorMap[satellite.colour] || '#6b7280';
    const isInSunlight = calculateSatelliteIllumination(satellite);
    
    const icon = L.divIcon({
      className: 'satellite-marker',
      html: `<div style="
        background-color: ${color}; 
        width: 12px; 
        height: 12px; 
        border-radius: 50%; 
        border: 2px solid ${isInSunlight ? '#ffffff' : '#666666'}; 
        box-shadow: 0 0 ${isInSunlight ? '6px rgba(255,255,255,0.6)' : '4px rgba(0,0,0,0.3)'};
        opacity: ${isInSunlight ? '1' : '0.7'};
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const marker = L.marker([satellite.latitude, satellite.longitude], { icon })
      .bindPopup(`
        <div class="p-2">
          <h4 class="font-bold text-sm">${satellite.name}</h4>
          <p class="text-xs text-gray-600">Satellite ${isInSunlight ? '☀️ Sunlit' : '🌑 Eclipsed'}</p>
          <p class="text-xs">Lat: ${satellite.latitude.toFixed(2)}°</p>
          <p class="text-xs">Lon: ${satellite.longitude.toFixed(2)}°</p>
          <p class="text-xs">Alt: ${satellite.altitude.toFixed(0)} km</p>
          <p class="text-xs text-gray-500">${new Date(satellite.timestamp).toLocaleTimeString()}</p>
        </div>
      `);

    return marker;
  };

  // Calculate if satellite is in sunlight (simplified)
  const calculateSatelliteIllumination = (satellite) => {
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const solarLongitude = (utcHours - 12) * 15;
    
    // Simplified calculation - in reality this would be much more complex
    const solarDistance = Math.abs(satellite.longitude - solarLongitude);
    const adjustedDistance = Math.min(solarDistance, 360 - solarDistance);
    
    return adjustedDistance < 90 && satellite.altitude > 200; // Rough approximation
  };

  // Create ground station marker
  const createGroundStationMarker = (L, station) => {
    const icon = L.divIcon({
      className: 'ground-station-marker',
      html: `<div style="
        background-color: #3b82f6; 
        width: 10px; 
        height: 10px; 
        transform: rotate(45deg); 
        border: 2px solid white; 
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });

    return L.marker([station.latitude, station.longitude], { icon })
      .bindPopup(`
        <div class="p-2">
          <h4 class="font-bold text-sm">${station.name}</h4>
          <p class="text-xs text-gray-600">Ground Station</p>
          <p class="text-xs">Lat: ${station.latitude.toFixed(2)}°</p>
          <p class="text-xs">Lon: ${station.longitude.toFixed(2)}°</p>
          <p class="text-xs">Alt: ${station.altitude.toFixed(1)} km</p>
        </div>
      `);
  };

  // Clear all markers efficiently
  const clearMarkers = () => {
    Object.values(markersRef.current).forEach(markerGroup => {
      if (Array.isArray(markerGroup)) {
        markerGroup.forEach(marker => {
          if (marker && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
      }
    });
    
    markersRef.current = {
      satellites: [],
      groundStations: [],
      trajectories: [],
      dayNightOverlay: markersRef.current.dayNightOverlay
    };
  };

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    const updateMarkers = async () => {
      const L = await import('leaflet');
      
      // Clear existing markers
      clearMarkers();
      
      // Add satellites
      satellites.forEach(satellite => {
        if (satellite.latitude !== null && satellite.longitude !== null) {
          const marker = createSatelliteMarker(L, satellite);
          marker.addTo(mapInstanceRef.current);
          markersRef.current.satellites.push(marker);
        }
      });
      
      // Add ground stations
      groundStations.forEach(station => {
        const marker = createGroundStationMarker(L, station);
        marker.addTo(mapInstanceRef.current);
        markersRef.current.groundStations.push(marker);
      });
    };

    updateMarkers();
  }, [satellites, groundStations, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 2D map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex space-x-2">
        <button
          onClick={() => setShowDayNight(!showDayNight)}
          className={`px-3 py-1 text-xs rounded font-medium transition-colors
            ${showDayNight 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {showDayNight ? '🌙 Day/Night ON' : '☀️ Day/Night OFF'}
        </button>
        
        <button
          onClick={() => setShowTrajectories(!showTrajectories)}
          className={`px-3 py-1 text-xs rounded font-medium transition-colors
            ${showTrajectories 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {showTrajectories ? '🛰️ Trails ON' : '🛰️ Trails OFF'}
        </button>
      </div>
      
      {/* Map Statistics */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs">
        <div className="flex space-x-4">
          <span>🛰️ {satellites.length}</span>
          <span>📡 {groundStations.length}</span>
          <span>🌍 2D View</span>
        </div>
      </div>
    </div>
  );
}