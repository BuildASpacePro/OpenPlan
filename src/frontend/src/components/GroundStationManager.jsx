// Ground Station Manager Component - Handle display switching for ground stations
import { useState, useEffect } from 'react';
import ViewToggle from './ViewToggle.jsx';
import GroundStationsTable from './GroundStationsTable.jsx';
import { DEV_CONFIG } from '../dev-config.js';

export default function GroundStationManager() {
  const [displayView, setDisplayView] = useState('cards');
  const [groundStations, setGroundStations] = useState([]);
  const [accessWindows, setAccessWindows] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [focusedStation, setFocusedStation] = useState(null);
  const [plannedContacts, setPlannedContacts] = useState([]);
  const [stationLoadingStates, setStationLoadingStates] = useState({});
  const [hoveredStation, setHoveredStation] = useState(null);

  const viewOptions = [
    { key: 'cards', label: 'Cards', icon: 'grid' },
    { key: 'table', label: 'Table', icon: 'table' }
  ];

  // Fetch ground stations and access windows data
  useEffect(() => {
    fetchGroundStations();
  }, []);

  const fetchGroundStations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ground stations first
      const response = await fetch('/api/groundstations');
      if (!response.ok) {
        throw new Error(`Failed to fetch ground stations: ${response.status}`);
      }
      
      const stations = await response.json();
      setGroundStations(stations);
      setLoading(false); // Show stations immediately
      
      // Initialize loading states for all stations
      const initialLoadingStates = {};
      stations.forEach(station => {
        initialLoadingStates[station.gs_id] = true;
      });
      setStationLoadingStates(initialLoadingStates);
      
      if (stations.length > 0) {
        // Fetch access windows using bulk API
        await fetchAccessWindowsBulk(stations);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ground stations:', err);
      setLoading(false);
    }
  };

  const fetchAccessWindowsBulk = async (stations) => {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Next 24 hours
      
      const stationIds = stations.map(station => station.gs_id);
      
      const bulkResponse = await fetch('/api/accesswindows/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ground_station_ids: stationIds,
          start_time: now.toISOString(),
          end_time: endTime.toISOString()
        })
      });
      
      if (!bulkResponse.ok) {
        throw new Error(`Failed to fetch bulk access windows: ${bulkResponse.status}`);
      }
      
      const bulkData = await bulkResponse.json();
      const windowMap = {};
      
      // Process bulk response
      Object.entries(bulkData.stations).forEach(([stationId, stationData]) => {
        windowMap[stationId] = stationData.access_windows || [];
      });
      
      setAccessWindows(windowMap);
      
      // Clear loading states for all stations
      setStationLoadingStates({});
      
      console.log(`✅ Loaded access windows for ${bulkData.successful_stations}/${bulkData.total_stations} stations`);
      
    } catch (err) {
      console.warn('Failed to fetch bulk access windows:', err);
      // Fallback to individual requests if bulk fails
      await fetchAccessWindowsIndividual(stations);
    }
  };

  const fetchAccessWindowsIndividual = async (stations) => {
    try {
      console.log('🔄 Falling back to individual access window requests...');
      
      const now = new Date();
      const endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Next 24 hours
      
      // Process stations in smaller batches to avoid overwhelming the server
      const batchSize = 3;
      const windowMap = {};
      
      for (let i = 0; i < stations.length; i += batchSize) {
        const batch = stations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (station) => {
          try {
            const accessResponse = await fetch(
              `/api/accesswindows/groundstation/${station.gs_id}?start_time=${now.toISOString()}&end_time=${endTime.toISOString()}`
            );
            
            if (accessResponse.ok) {
              const accessData = await accessResponse.json();
              return { stationId: station.gs_id, windows: accessData.access_windows || [] };
            }
            return { stationId: station.gs_id, windows: [] };
          } catch (err) {
            console.warn(`Failed to fetch access windows for station ${station.gs_id}:`, err);
            return { stationId: station.gs_id, windows: [] };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          windowMap[result.stationId] = result.windows;
        });
        
        // Update UI progressively as batches complete
        setAccessWindows(prevWindows => ({ ...prevWindows, ...windowMap }));
        
        // Clear loading states for completed stations
        const completedStationIds = {};
        batchResults.forEach(result => {
          completedStationIds[result.stationId] = false;
        });
        setStationLoadingStates(prevStates => {
          const newStates = { ...prevStates };
          Object.keys(completedStationIds).forEach(stationId => {
            delete newStates[stationId];
          });
          return newStates;
        });
        
        // Small delay between batches to be gentle on the server
        if (i + batchSize < stations.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
    } catch (err) {
      console.error('Error in individual access window requests:', err);
    }
  };

  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return 'N/A';
    return `${parseFloat(coord).toFixed(4)}°`;
  };

  const getNextAccessWindow = (stationId) => {
    const windows = accessWindows[stationId] || [];
    if (windows.length === 0) return null;
    
    const now = new Date();
    const upcomingWindows = windows.filter(window => new Date(window.start_time) > now);
    
    if (upcomingWindows.length === 0) return null;
    
    // Return the soonest upcoming window
    return upcomingWindows.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];
  };

  const getStationConnectionStatus = (station) => {
    const windows = accessWindows[station.gs_id] || [];
    const now = new Date();
    const isLoadingWindows = stationLoadingStates[station.gs_id] === true;
    const nextWindow = getNextAccessWindow(station.gs_id);
    
    // Check if currently in an access window
    const currentWindow = windows.find(window => {
      const start = new Date(window.start_time);
      const end = new Date(window.end_time);
      return now >= start && now <= end;
    });
    
    return {
      status: currentWindow ? 'active' : (nextWindow ? 'standby' : 'idle'),
      currentWindow,
      nextWindow,
      totalWindows: windows.length,
      plannedWindows: windows.filter(w => w.planned === true).length,
      upcomingWindows: windows.filter(w => new Date(w.start_time) > now).length,
      isLoadingWindows,
      lastUpdate: new Date().toLocaleString()
    };
  };

  const handleStationFocus = (station) => {
    setFocusedStation(station);
    // Fetch planned contacts for this station
    fetchPlannedContacts(station.gs_id);
  };

  const handleBackToList = () => {
    setFocusedStation(null);
    setPlannedContacts([]);
  };

  const fetchPlannedContacts = async (stationId) => {
    // Planned contacts are now derived from access windows with planned=true
    // This function is called after access windows are fetched
    const stationWindows = accessWindows[stationId] || [];
    const plannedWindows = stationWindows.filter(window => window.planned === true);
    setPlannedContacts(plannedWindows);
  };

  const toggleAccessWindowPlanned = async (accessWindow, newPlannedStatus) => {
    try {
      console.log('Toggling access window planned status:', {
        satellite_id: accessWindow.satellite_id,
        location_id: focusedStation.gs_id,
        start_time: accessWindow.start_time,
        current_planned: accessWindow.planned,
        new_planned: newPlannedStatus
      });

      // Get auth headers from global function
      const headers = (typeof window !== 'undefined' && window.getAuthHeaders) ? 
        window.getAuthHeaders() : 
        {
          'Content-Type': 'application/json'
        };
      
      // For development testing: add auth token if none exists and in dev mode
      if (!headers.Authorization && DEV_CONFIG.USE_DEV_AUTH) {
        headers.Authorization = `Bearer ${DEV_CONFIG.DEV_JWT_TOKEN}`;
        console.warn('Using development JWT token - this should never happen in production!');
      } else if (!headers.Authorization) {
        throw new Error('Authentication required. Please log in.');
      }

      console.log('Request headers:', headers);

      const requestBody = {
        satellite_id: accessWindow.satellite_id,
        location_id: focusedStation.gs_id,
        start_time: accessWindow.start_time,
        planned: newPlannedStatus
      };

      console.log('Request body:', requestBody);

      const response = await fetch('/api/accesswindows/planned', {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to update planned status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Response result:', result);

      // Refresh access windows to reflect the change
      console.log('Refreshing ground stations data...');
      await fetchGroundStations();
      
      // Update planned contacts list
      if (focusedStation) {
        console.log('Updating planned contacts for station:', focusedStation.gs_id);
        fetchPlannedContacts(focusedStation.gs_id);
      }

      console.log('Toggle completed successfully');

    } catch (err) {
      console.error('Error updating planned status:', err);
      // You could add a toast notification here
    }
  };

  const renderCards = () => {
    if (loading) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-astro-gray dark:text-gray-300">Loading ground station data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full mr-3"></div>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Ground Stations</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchGroundStations}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-semibold text-astro-dark dark:text-white mb-4">Active Ground Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groundStations.map((station) => {
              const nextWindow = getNextAccessWindow(station.gs_id);
              const windowCount = (accessWindows[station.gs_id] || []).length;
              const isLoadingWindows = stationLoadingStates[station.gs_id] === true;
              
              return (
                <div key={station.gs_id} className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${isLoadingWindows ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      <h3 
                        className="font-medium text-gray-900 dark:text-white hover:text-astro-blue cursor-pointer transition-colors"
                        onClick={() => handleStationFocus(station)}
                      >
                        {station.name}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ID: {station.gs_id}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="font-medium">Location:</span> {formatCoordinate(station.latitude)}, {formatCoordinate(station.longitude)}
                    </div>
                    <div>
                      <span className="font-medium">Altitude:</span> {station.altitude ? `${parseInt(station.altitude).toLocaleString()} m` : 'N/A'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>
                        <span className="font-medium">Access Windows (24h):</span> {isLoadingWindows ? '...' : windowCount}
                      </span>
                      {isLoadingWindows && (
                        <div className="w-4 h-4 border-2 border-astro-blue border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    {nextWindow && (
                      <div>
                        <span className="font-medium">Next Access:</span>
                        <div className="text-xs text-green-600 mt-1">
                          {new Date(nextWindow.start_time).toLocaleString()} 
                          <br />
                          {nextWindow.satellite_name} ({nextWindow.duration_minutes}min)
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <div className="relative">
                      <button 
                        className="text-xs bg-astro-blue text-white px-2 py-1 rounded hover:bg-astro-light"
                        onMouseEnter={() => setHoveredStation(station.gs_id)}
                        onMouseLeave={() => setHoveredStation(null)}
                      >
                        View Details
                      </button>
                      
                      {/* Connection Status Tooltip */}
                      {hoveredStation === station.gs_id && (
                        <div className="absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 min-w-64">
                          {(() => {
                            const status = getStationConnectionStatus(station);
                            return (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">Connection Status</span>
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      status.status === 'active' ? 'bg-green-400' :
                                      status.status === 'standby' ? 'bg-yellow-400' : 'bg-gray-400'
                                    }`}></div>
                                    <span className="capitalize">{status.status}</span>
                                  </div>
                                </div>
                                
                                {status.currentWindow && (
                                  <div>
                                    <span className="text-green-400 font-medium">Active Pass:</span>
                                    <div>{status.currentWindow.satellite_name}</div>
                                    <div>Ends: {new Date(status.currentWindow.end_time).toLocaleTimeString()}</div>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-300">Total Windows:</span>
                                    <div className="font-mono">{status.totalWindows}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-300">Planned:</span>
                                    <div className="font-mono">{status.plannedWindows}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-300">Upcoming:</span>
                                    <div className="font-mono">{status.upcomingWindows}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-300">Loading:</span>
                                    <div className="font-mono">{status.isLoadingWindows ? 'Yes' : 'No'}</div>
                                  </div>
                                </div>
                                
                                <div className="text-gray-400 text-xs border-t border-gray-700 pt-2">
                                  Last updated: {status.lastUpdate}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      onClick={() => handleStationFocus(station)}
                    >
                      Access Windows
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-semibold text-astro-dark dark:text-white mb-4">Network Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{groundStations.length}</p>
              <p className="text-sm text-blue-700">Total Stations</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.values(accessWindows).reduce((sum, windows) => sum + windows.length, 0)}
              </p>
              <p className="text-sm text-green-700">Access Windows (24h)</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {Object.values(accessWindows).filter(windows => windows.length > 0).length}
              </p>
              <p className="text-sm text-yellow-700">Active Stations</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-600">
                {groundStations.length > 0 ? new Date().toLocaleDateString() : '-'}
              </p>
              <p className="text-sm text-purple-700">Last Update</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFocusedStationView = () => {
    if (!focusedStation) return null;

    const stationWindows = accessWindows[focusedStation.gs_id] || [];
    const now = new Date();
    // Since planned defaults to true, opportunities are unplanned (false) and planned contacts are planned (true)
    const upcomingWindows = stationWindows.filter(window => 
      new Date(window.start_time) > now && window.planned === false
    );
    const plannedWindows = stationWindows.filter(window => 
      new Date(window.start_time) > now && window.planned === true
    );

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-astro-blue hover:text-astro-light transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Ground Stations</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-astro-dark dark:text-white">{focusedStation.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Active</span>
            </div>
          </div>
          
          {/* Station Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
              <p className="text-gray-900 dark:text-white font-mono">
                {formatCoordinate(focusedStation.latitude)}, {formatCoordinate(focusedStation.longitude)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Altitude:</span>
              <p className="text-gray-900 dark:text-white">
                {focusedStation.altitude ? `${parseInt(focusedStation.altitude).toLocaleString()} m` : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Station ID:</span>
              <p className="text-gray-900 dark:text-white">{focusedStation.gs_id}</p>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-semibold text-astro-dark dark:text-white mb-4">Station Location</h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Interactive Map View</p>
              <p className="text-xs">Cesium map integration would be implemented here</p>
            </div>
          </div>
        </div>

        {/* Access Windows and Planned Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Access Window Opportunities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-astro-dark dark:text-white">Access Window Opportunities</h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                {upcomingWindows.length} upcoming
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upcomingWindows.length > 0 ? (
                upcomingWindows.map((window, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{window.satellite_name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{window.duration_minutes}min</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>Start: {new Date(window.start_time).toLocaleString()}</p>
                      <p>End: {new Date(window.end_time).toLocaleString()}</p>
                      <p>Max Elevation: {window.max_elevation?.toFixed(1)}°</p>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button 
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                        onClick={() => toggleAccessWindowPlanned(window, true)}
                      >
                        Add to Planned
                      </button>
                      <button className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded">
                        Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No upcoming access windows</p>
                </div>
              )}
            </div>
          </div>

          {/* Planned Contacts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-astro-dark dark:text-white">Planned Contacts</h2>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                {plannedWindows.length} scheduled
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {plannedWindows.length > 0 ? (
                plannedWindows.map((window, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{window.satellite_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Planned
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{window.duration_minutes}min</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>Start: {new Date(window.start_time).toLocaleString()}</p>
                      <p>End: {new Date(window.end_time).toLocaleString()}</p>
                      <p>Max Elevation: {window.max_elevation?.toFixed(1)}°</p>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                        Edit
                      </button>
                      <button 
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                        onClick={() => toggleAccessWindowPlanned(window, false)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No contacts scheduled</p>
                  <p className="text-xs mt-1">Plan contacts from the opportunities list</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If a station is focused, show the focused view
  if (focusedStation) {
    return renderFocusedStationView();
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <ViewToggle 
          currentView={displayView}
          onViewChange={setDisplayView}
          views={viewOptions}
        />
      </div>

      {/* Refresh Button Integration */}
      <div className="flex justify-end">
        <button 
          onClick={fetchGroundStations}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* Content based on selected view */}
      {displayView === 'cards' ? (
        renderCards()
      ) : (
        <GroundStationsTable 
          groundStations={groundStations} 
          onStationFocus={handleStationFocus}
        />
      )}
    </div>
  );
}