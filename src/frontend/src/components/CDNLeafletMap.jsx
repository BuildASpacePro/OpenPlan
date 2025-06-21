// CDNLeafletMap.jsx - Leaflet map loaded from CDN to avoid module resolution issues
import React, { useEffect, useRef, useState } from 'react';

export default function CDNLeafletMap({ satellites = [], groundStations = [], onToggle3D }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    satellites: [],
    groundStations: [],
    trajectories: [],
    dayNightOverlay: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);
  const [showDayNight, setShowDayNight] = useState(true);

  // Color mapping for satellites
  const colorMap = {
    'red': '#ef4444', 'green': '#22c55e', 'blue': '#3b82f6', 'yellow': '#eab308',
    'orange': '#f97316', 'purple': '#a855f7', 'grey': '#6b7280', 'gray': '#6b7280',
    'black': '#1f2937', 'white': '#f9fafb', 'cyan': '#06b6d4', 'magenta': '#d946ef'
  };

  // Load Leaflet from CDN
  useEffect(() => {
    const loadLeafletFromCDN = () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        setLeafletReady(true);
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        // Load Leaflet CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          console.log('Leaflet loaded from CDN');
          setLeafletReady(true);
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadLeafletFromCDN()
      .then(() => {
        console.log('Leaflet is ready');
      })
      .catch(error => {
        console.error('Failed to load Leaflet from CDN:', error);
        setIsLoading(false);
      });
  }, []);

  // Initialize map when Leaflet is ready
  useEffect(() => {
    if (!leafletReady || !window.L || mapInstanceRef.current) return;

    const initMap = () => {
      try {
        const L = window.L;
        
        // Create map instance
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          minZoom: 1,
          maxZoom: 10,
          worldCopyJump: false,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0,
          preferCanvas: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 10,
          updateWhenIdle: true,
          updateWhenZooming: false
        }).addTo(mapInstanceRef.current);

        // Initialize day/night overlay
        if (showDayNight) {
          initDayNightOverlay();
        }

        setIsLoading(false);
        console.log('Leaflet map initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Leaflet map:', error);
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
  }, [leafletReady, showDayNight]);

  // Day/Night overlay (simplified)
  const initDayNightOverlay = () => {
    if (!window.L || !mapInstanceRef.current) return;
    
    try {
      const L = window.L;
      const nightOverlay = L.rectangle([[-90, -180], [90, 180]], {
        color: 'transparent',
        fillColor: '#000033',
        fillOpacity: 0.3,
        interactive: false
      });
      
      markersRef.current.dayNightOverlay = nightOverlay;
      nightOverlay.addTo(mapInstanceRef.current);
    } catch (error) {
      console.error('Failed to initialize day/night overlay:', error);
    }
  };

  // Create satellite marker
  const createSatelliteMarker = (satellite) => {
    if (!window.L) return null;
    
    const L = window.L;
    const color = colorMap[satellite.colour] || '#6b7280';
    
    const icon = L.divIcon({
      className: 'satellite-marker',
      html: `<div style="
        background-color: ${color}; 
        width: 12px; 
        height: 12px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    return L.marker([satellite.latitude, satellite.longitude], { icon })
      .bindPopup(`
        <div class="p-2">
          <h4 class="font-bold text-sm">${satellite.name}</h4>
          <p class="text-xs text-gray-600">Satellite</p>
          <p class="text-xs">Lat: ${satellite.latitude.toFixed(2)}°</p>
          <p class="text-xs">Lon: ${satellite.longitude.toFixed(2)}°</p>
          <p class="text-xs">Alt: ${satellite.altitude?.toFixed(0) || 0} km</p>
          <p class="text-xs text-gray-500">${new Date(satellite.timestamp || Date.now()).toLocaleTimeString()}</p>
        </div>
      `);
  };

  // Create ground station marker
  const createGroundStationMarker = (station) => {
    if (!window.L) return null;
    
    const L = window.L;
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
          <p class="text-xs">Alt: ${station.altitude?.toFixed(1) || 0} km</p>
        </div>
      `);
  };

  // Clear markers
  const clearMarkers = () => {
    if (!mapInstanceRef.current) return;
    
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
    if (!mapInstanceRef.current || isLoading || !leafletReady) return;

    clearMarkers();
    
    // Add satellites
    satellites.forEach(satellite => {
      if (satellite.latitude !== null && satellite.longitude !== null) {
        const marker = createSatelliteMarker(satellite);
        if (marker) {
          marker.addTo(mapInstanceRef.current);
          markersRef.current.satellites.push(marker);
        }
      }
    });
    
    // Add ground stations
    groundStations.forEach(station => {
      const marker = createGroundStationMarker(station);
      if (marker) {
        marker.addTo(mapInstanceRef.current);
        markersRef.current.groundStations.push(marker);
      }
    });
  }, [satellites, groundStations, isLoading, leafletReady]);

  if (isLoading || !leafletReady) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Leaflet map from CDN...</p>
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
      </div>
      
      {/* Map Statistics */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs">
        <div className="flex space-x-4">
          <span>🛰️ {satellites.length}</span>
          <span>📡 {groundStations.length}</span>
          <span>🗺️ CDN Map</span>
        </div>
      </div>
    </div>
  );
}