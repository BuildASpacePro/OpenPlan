// PlanPageMap.jsx - Main map component for the Plan page
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import OptimizedMapContainer from './OptimizedMapContainer.jsx';

function PlanPageMap() {
  const [satellites, setSatellites] = useState([]);
  const [groundStations, setGroundStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false); // Prevent concurrent loads

  const API_BASE = 'http://localhost:3000';

  // Load location data with performance optimizations
  const loadLocations = useCallback(async () => {
    if (loadingRef.current) return; // Prevent concurrent loads
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Use Promise.all for concurrent requests - faster loading
      const [satelliteResponse, groundStationResponse] = await Promise.all([
        fetch(`${API_BASE}/api/satellites/positions/current`, {
          headers: window.getAuthHeaders ? window.getAuthHeaders() : {}
        }),
        fetch(`${API_BASE}/api/locations/groundstations`, {
          headers: window.getAuthHeaders ? window.getAuthHeaders() : {}
        })
      ]);
      
      if (!satelliteResponse.ok) {
        throw new Error(`Satellite data error! status: ${satelliteResponse.status}`);
      }
      
      if (!groundStationResponse.ok) {
        throw new Error(`Ground station data error! status: ${groundStationResponse.status}`);
      }
      
      const satelliteData = await satelliteResponse.json();
      const groundStationData = await groundStationResponse.json();
      
      // Process satellite data into the format expected by map components
      const processedSatellites = satelliteData.satellites
        .filter(sat => sat.position && sat.position.latitude !== null && sat.position.longitude !== null)
        .map(sat => ({
          satellite_id: sat.satellite_id,
          name: sat.name,
          colour: sat.colour,
          latitude: sat.position.latitude,
          longitude: sat.position.longitude,
          altitude: sat.position.altitude_km,
          timestamp: sat.position.timestamp
        }));
      
      setSatellites(processedSatellites);
      setGroundStations(groundStationData);
      setLastUpdate(new Date(satelliteData.timestamp));
      
      // Update global stats if elements exist
      const satelliteCountEl = document.getElementById('satelliteCount');
      const groundStationCountEl = document.getElementById('groundStationCount');
      const lastUpdateEl = document.getElementById('lastUpdate');
      
      if (satelliteCountEl) satelliteCountEl.textContent = processedSatellites.length;
      if (groundStationCountEl) groundStationCountEl.textContent = groundStationData.length;
      if (lastUpdateEl) lastUpdateEl.textContent = new Date(satelliteData.timestamp).toLocaleTimeString();
      
    } catch (err) {
      console.error('Failed to load locations:', err);
      setError(err.message);
      
      // Try fallback method
      try {
        await loadLocationsFallback();
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Empty dependency array for useCallback

  // Fallback method using satellite.js calculations
  const loadLocationsFallback = async () => {
    const response = await fetch(`${API_BASE}/api/locations/all`, {
      headers: window.getAuthHeaders ? window.getAuthHeaders() : {}
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process fallback data
    const validSatellites = data.satellites.filter(sat => 
      sat.latitude !== null && sat.longitude !== null
    );
    
    setSatellites(validSatellites);
    setGroundStations(data.ground_stations);
    setLastUpdate(new Date(data.timestamp));
    
    // Update stats
    const satelliteCountEl = document.getElementById('satelliteCount');
    const groundStationCountEl = document.getElementById('groundStationCount');
    const lastUpdateEl = document.getElementById('lastUpdate');
    
    if (satelliteCountEl) satelliteCountEl.textContent = validSatellites.length;
    if (groundStationCountEl) groundStationCountEl.textContent = data.ground_stations.length;
    if (lastUpdateEl) lastUpdateEl.textContent = new Date(data.timestamp).toLocaleTimeString() + ' (fallback)';
  };

  // Initial load and periodic updates
  useEffect(() => {
    loadLocations();
    
    // Increase refresh interval to 90 seconds for better performance
    const interval = setInterval(loadLocations, 90000);
    
    return () => clearInterval(interval);
  }, [loadLocations]);

  // Handle refresh button - memoized
  const handleRefresh = useCallback(() => {
    loadLocations();
  }, [loadLocations]);

  if (error && satellites.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-600 mb-2">⚠️ Failed to load map data</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-4 right-4 z-20 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
          🔄 Updating...
        </div>
      )}
      
      <OptimizedMapContainer
        satellites={satellites}
        groundStations={groundStations}
        onRefresh={handleRefresh}
        className="w-full h-[600px]"
      />
      
      {error && (
        <div className="absolute bottom-4 right-4 z-20 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg text-sm max-w-sm">
          ⚠️ Using fallback data: {error}
        </div>
      )}
    </div>
  );
}

// Export memoized component
export default memo(PlanPageMap);