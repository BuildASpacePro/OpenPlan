// Target Manager Component - Handle display switching for targets
import { useState, useEffect } from 'react';
import ViewToggle from './ViewToggle.jsx';
import TargetsTable from './TargetsTable.jsx';

export default function TargetManager() {
  const [displayView, setDisplayView] = useState('cards');
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const viewOptions = [
    { key: 'cards', label: 'Cards', icon: 'grid' },
    { key: 'table', label: 'Table', icon: 'table' }
  ];

  // Fetch targets data
  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/targets');
      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.status}`);
      }
      
      const data = await response.json();
      setTargets(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching targets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'celestial':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'geographic':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'objective':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'celestial': 'bg-purple-500',
      'geographic': 'bg-orange-500',
      'objective': 'bg-blue-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-600',
      'planned': 'text-blue-600',
      'completed': 'text-gray-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return 'N/A';
    return `${parseFloat(coord).toFixed(4)}`;
  };

  const renderCards = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-astro-gray">Loading targets data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full mr-3"></div>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Targets</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchTargets}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    // Group targets by type
    const targetsByType = targets.reduce((acc, target) => {
      if (!acc[target.target_type]) {
        acc[target.target_type] = [];
      }
      acc[target.target_type].push(target);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {/* Target Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                {getTypeIcon('celestial')}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-astro-dark">Celestial Objects</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {(targetsByType.celestial || []).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                {getTypeIcon('geographic')}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-astro-dark">Geographic Locations</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {(targetsByType.geographic || []).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                {getTypeIcon('objective')}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-astro-dark">Mission Objectives</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {(targetsByType.objective || []).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Targets Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-astro-dark mb-4">All Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target) => (
              <div key={target.target_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getTypeColor(target.target_type)} rounded-lg flex items-center justify-center`}>
                      {getTypeIcon(target.target_type)}
                    </div>
                    <h3 className="font-medium text-gray-900">{target.name}</h3>
                  </div>
                  <span className="text-xs text-gray-500">ID: {target.target_id}</span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Type:</span> {target.target_type}
                  </div>
                  <div>
                    <span className="font-medium">Coordinates:</span> {formatCoordinate(target.coordinate1)}, {formatCoordinate(target.coordinate2)}
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">Priority:</span> 
                      <span className={`ml-1 font-semibold ${getPriorityColor(target.priority)}`}>
                        {target.priority}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 font-semibold ${getStatusColor(target.status)}`}>
                        {target.status}
                      </span>
                    </div>
                  </div>
                  {target.description && (
                    <div>
                      <span className="font-medium">Description:</span>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {target.description}
                      </div>
                    </div>
                  )}
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
          <h2 className="text-xl font-semibold text-astro-dark mb-4">Target Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{targets.length}</p>
              <p className="text-sm text-blue-700">Total Targets</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {targets.filter(t => t.status === 'active').length}
              </p>
              <p className="text-sm text-green-700">Active</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">
                {targets.filter(t => t.priority === 'high').length}
              </p>
              <p className="text-sm text-red-700">High Priority</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-600">
                {targets.length > 0 ? new Date(Math.max(...targets.map(t => new Date(t.created_at || 0)))).toLocaleDateString() : '-'}
              </p>
              <p className="text-sm text-purple-700">Latest Target</p>
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
          onClick={fetchTargets}
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
        <TargetsTable targets={targets} />
      )}
    </div>
  );
}