// Ground Station Manager Component - Handle display switching for ground stations
import { useState, useEffect } from 'react';
import ViewToggle from './ViewToggle.jsx';
import GroundStationsTable from './GroundStationsTable.jsx';

export default function GroundStationManager() {
  const [displayView, setDisplayView] = useState('cards');
  const [groundStations, setGroundStations] = useState([]);
  const [accessWindows, setAccessWindows] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      const response = await fetch('/api/groundstations');
      if (!response.ok) {
        throw new Error(`Failed to fetch ground stations: ${response.status}`);
      }
      
      const stations = await response.json();
      setGroundStations(stations);
      
      // Fetch access windows for each ground station
      const windowPromises = stations.map(async (station) => {
        try {
          const now = new Date();
          const endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Next 24 hours
          
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
      
      const windowResults = await Promise.all(windowPromises);
      const windowMap = {};
      windowResults.forEach(result => {
        windowMap[result.stationId] = result.windows;
      });
      setAccessWindows(windowMap);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ground stations:', err);
    } finally {
      setLoading(false);
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

  const renderCards = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-astro-gray">Loading ground station data...</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-astro-dark mb-4">Active Ground Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groundStations.map((station) => {
              const nextWindow = getNextAccessWindow(station.gs_id);
              const windowCount = (accessWindows[station.gs_id] || []).length;
              
              return (
                <div key={station.gs_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <h3 className="font-medium text-gray-900">{station.name}</h3>
                    </div>
                    <span className="text-xs text-gray-500">ID: {station.gs_id}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Location:</span> {formatCoordinate(station.latitude)}, {formatCoordinate(station.longitude)}
                    </div>
                    <div>
                      <span className="font-medium">Altitude:</span> {station.altitude ? `${parseInt(station.altitude).toLocaleString()} m` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Access Windows (24h):</span> {windowCount}
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
                    <button className="text-xs bg-astro-blue text-white px-2 py-1 rounded hover:bg-astro-light">
                      View Details
                    </button>
                    <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                      Access Windows
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-astro-dark mb-4">Network Statistics</h2>
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
        <GroundStationsTable groundStations={groundStations} />
      )}
    </div>
  );
}