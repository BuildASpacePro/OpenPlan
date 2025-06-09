// Timeline Table Component - Display timeline events in tabular format
import { useState, useMemo } from 'react';

export default function TimelineTable({ events = [] }) {
  const [sortField, setSortField] = useState('planned_time');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('all');

  // Sort and filter events
  const processedEvents = useMemo(() => {
    let filtered = events;
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = events.filter(event => event.event_type === filterType);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle date fields
      if (sortField === 'planned_time' || sortField === 'end_time') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [events, sortField, sortDirection, filterType]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'health': 'bg-green-100 text-green-800',
      'payload': 'bg-blue-100 text-blue-800',
      'AOCS': 'bg-purple-100 text-purple-800',
      'communication': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-red-100 text-red-800',
      'access_window': 'bg-gray-100 text-gray-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-astro-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-astro-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  // Get unique event types for filter
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(event => event.event_type));
    return Array.from(types);
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="event-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type:
            </label>
            <select
              id="event-type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-astro-blue focus:border-transparent"
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {processedEvents.length} of {events.length} events
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('satellite_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Satellite</span>
                    {getSortIcon('satellite_name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('event_type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {getSortIcon('event_type')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('activity_type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Activity</span>
                    {getSortIcon('activity_type')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('planned_time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Start Time</span>
                    {getSortIcon('planned_time')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('end_time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>End Time</span>
                    {getSortIcon('end_time')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Duration</span>
                    {getSortIcon('duration')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mission
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedEvents.map((event, index) => (
                <tr key={event.event_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: event.colour || '#6B7280' }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.satellite_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {event.activity_type}
                    </div>
                    {event.ground_station_name && (
                      <div className="text-xs text-gray-500">
                        → {event.ground_station_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(event.planned_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(event.end_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(event.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.mission}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {processedEvents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No events found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}