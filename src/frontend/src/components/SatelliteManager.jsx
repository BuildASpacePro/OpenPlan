// Satellite Manager Component - Handle display switching for satellites
import { useState, useEffect } from 'react';
import ViewToggle from './ViewToggle.jsx';
import SatellitesTable from './SatellitesTable.jsx';

export default function SatelliteManager() {
  const [displayView, setDisplayView] = useState('cards');
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const viewOptions = [
    { key: 'cards', label: 'Cards', icon: 'grid' },
    { key: 'table', label: 'Table', icon: 'table' }
  ];

  // Fetch satellites data
  useEffect(() => {
    fetchSatellites();
  }, []);

  const fetchSatellites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/satellites');
      if (!response.ok) {
        throw new Error(`Failed to fetch satellites: ${response.status}`);
      }
      
      const data = await response.json();
      setSatellites(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching satellites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Color mapping for satellites (fallback if not provided)
  const getColorForSatellite = (satellite) => {
    if (satellite.colour) return satellite.colour;
    
    const colorMap = {
      'red': '#EF4444',
      'blue': '#3B82F6', 
      'green': '#10B981',
      'yellow': '#F59E0B',
      'orange': '#F97316',
      'purple': '#8B5CF6',
      'grey': '#6B7280',
      'gray': '#6B7280',
      'black': '#1F2937',
      'white': '#F9FAFB',
      'cyan': '#06B6D4',
      'magenta': '#EC4899'
    };
    
    return colorMap[satellite.colour] || '#6B7280';
  };

  const renderCards = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-astro-gray">Loading satellite data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full mr-3"></div>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Satellites</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchSatellites}
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
          <h2 className="text-xl font-semibold text-astro-dark mb-4">Active Satellites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {satellites.map((satellite) => (
              <div key={satellite.satellite_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getColorForSatellite(satellite) }}
                    ></div>
                    <h3 className="font-medium text-gray-900">{satellite.name}</h3>
                  </div>
                  <span className="text-xs text-gray-500">ID: {satellite.satellite_id}</span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Mission:</span> {satellite.mission}
                  </div>
                  <div>
                    <span className="font-medium">Start:</span> {satellite.mission_start_time ? new Date(satellite.mission_start_time).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {satellite.updated_at ? new Date(satellite.updated_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="text-xs bg-astro-blue text-white px-2 py-1 rounded hover:bg-astro-light">
                    View Details
                  </button>
                  <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-astro-dark mb-4">Fleet Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{satellites.length}</p>
              <p className="text-sm text-blue-700">Total Satellites</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{satellites.filter(s => s.tle_1 && s.tle_2).length}</p>
              <p className="text-sm text-green-700">With TLE Data</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{new Set(satellites.map(s => s.mission)).size}</p>
              <p className="text-sm text-yellow-700">Active Missions</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-600">
                {satellites.length > 0 ? new Date(Math.max(...satellites.map(s => new Date(s.updated_at || 0)))).toLocaleDateString() : '-'}
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
          onClick={fetchSatellites}
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
        <SatellitesTable satellites={satellites} />
      )}
    </div>
  );
}