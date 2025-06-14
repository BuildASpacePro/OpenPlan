// SatelliteFocusView.jsx - Individual satellite detailed focus view
import { useState, useEffect } from 'react';

export default function SatelliteFocusView({ satellite, onBack }) {
  const [accessWindows, setAccessWindows] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (satellite) {
      fetchSatelliteData();
    }
  }, [satellite]);

  const fetchSatelliteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch access windows for this satellite
      const now = new Date();
      const futureTime = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // Next 7 days

      console.log(`Fetching access windows for satellite ${satellite.satellite_id}`);
      console.log(`Time range: ${now.toISOString()} to ${futureTime.toISOString()}`);

      const accessResponse = await fetch(
        `/api/accesswindows/satellite/${satellite.satellite_id}?start_time=${now.toISOString()}&end_time=${futureTime.toISOString()}`
      );

      console.log(`Access windows API response status: ${accessResponse.status}`);

      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        console.log('Access windows response:', accessData);
        setAccessWindows(accessData.access_windows || []);
        console.log(`Set ${accessData.access_windows?.length || 0} access windows`);
        
        // If no access windows found, run debug check
        if (!accessData.access_windows || accessData.access_windows.length === 0) {
          console.log('No access windows found, running debug check...');
          try {
            const debugResponse = await fetch('/api/debug/accesswindows');
            if (debugResponse.ok) {
              const debugData = await debugResponse.json();
              console.log('Debug data:', debugData);
            }
          } catch (debugError) {
            console.error('Debug check failed:', debugError);
          }
        }
      } else {
        const errorData = await accessResponse.text();
        console.error('Access windows API error:', errorData);
      }

      // Fetch targets
      const targetsResponse = await fetch('/api/targets');
      if (targetsResponse.ok) {
        const targetsData = await targetsResponse.json();
        // Filter for active targets
        const activeTargets = targetsData.filter(target => 
          target.status === 'active' || target.status === 'planned'
        );
        setTargets(activeTargets);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching satellite data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Color mapping for satellites
  const getColorForSatellite = (satellite) => {
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

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTargetIcon = (targetType) => {
    switch (targetType) {
      case 'celestial': return '🌟';
      case 'geographic': return '🌍';
      case 'objective': return '🎯';
      case 'customer': return '👤';
      default: return '📍';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'planned': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'access', label: 'Access Windows', icon: '📡', count: accessWindows.length },
    { key: 'targets', label: 'Targets', icon: '🎯', count: targets.length },
    { key: 'telemetry', label: 'Telemetry', icon: '📈' }
  ];

  if (!satellite) {
    return <div>No satellite selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Satellites
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: getColorForSatellite(satellite) }}
              ></div>
              <h1 className="text-2xl font-bold text-gray-900">{satellite.name}</h1>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            ID: {satellite.satellite_id}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">Mission</p>
            <p className="font-semibold text-blue-900">{satellite.mission}</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">Mission Start</p>
            <p className="font-semibold text-green-900">
              {satellite.mission_start_time ? new Date(satellite.mission_start_time).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700">Upcoming Windows</p>
            <p className="font-semibold text-purple-900">{accessWindows.length}</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">Active Targets</p>
            <p className="font-semibold text-orange-900">{targets.filter(t => t.status === 'active').length}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading satellite data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">Error loading data: {error}</p>
              <button 
                onClick={fetchSatelliteData}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Satellite Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Satellite Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{satellite.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mission:</span>
                          <span className="font-medium">{satellite.mission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color:</span>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: getColorForSatellite(satellite) }}
                            ></div>
                            <span className="font-medium">{satellite.colour}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mission Start:</span>
                          <span className="font-medium">
                            {satellite.mission_start_time ? new Date(satellite.mission_start_time).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">
                            {satellite.updated_at ? new Date(satellite.updated_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TLE Data */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Orbital Elements (TLE)</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2 text-xs font-mono">
                          <div>
                            <span className="text-gray-600">Line 1:</span>
                            <div className="bg-white p-2 rounded mt-1 break-all">
                              {satellite.tle_1 || 'No TLE data available'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Line 2:</span>
                            <div className="bg-white p-2 rounded mt-1 break-all">
                              {satellite.tle_2 || 'No TLE data available'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Access Windows Tab */}
              {activeTab === 'access' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Upcoming Access Windows</h3>
                    <span className="text-sm text-gray-500">Next 7 days</span>
                  </div>
                  
                  {accessWindows.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No upcoming access windows found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accessWindows.map((window, index) => {
                        const start = formatDateTime(window.start_time);
                        const end = formatDateTime(window.end_time);
                        
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  📡 {window.ground_station_name}
                                </h4>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>{start.date} • {start.time} - {end.time}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-blue-600">
                                  {formatDuration(window.duration_minutes)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Duration
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Targets Tab */}
              {activeTab === 'targets' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Mission Targets</h3>
                    <span className="text-sm text-gray-500">{targets.length} total targets</span>
                  </div>
                  
                  {targets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No targets available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {targets.map((target) => (
                        <div key={target.target_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getTargetIcon(target.target_type)}</span>
                              <div>
                                <h4 className="font-medium text-gray-900">{target.name}</h4>
                                <div className="text-sm text-gray-600">
                                  <span className="capitalize">{target.target_type}</span>
                                  {target.description && (
                                    <span> • {target.description}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                                {target.status}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                Priority: {target.priority}
                              </div>
                            </div>
                          </div>
                          
                          {target.start_time && (
                            <div className="mt-3 text-sm text-gray-600">
                              <span>Active: {formatDateTime(target.start_time).date}</span>
                              {target.end_time && !target.indefinite_end && (
                                <span> - {formatDateTime(target.end_time).date}</span>
                              )}
                              {target.indefinite_end && (
                                <span> - Ongoing</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Telemetry Tab */}
              {activeTab === 'telemetry' && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-medium mb-2">Telemetry Data</h3>
                  <p>Real-time telemetry and health monitoring will be available here.</p>
                  <p className="text-sm mt-2">Coming soon...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}