// ClusterExpansionPanel.jsx - Expandable panel for cluster details
import React, { useState } from 'react';

export default function ClusterExpansionPanel({ 
  cluster, 
  isExpanded, 
  onToggle,
  timeWindow,
  onEventHover
}) {
  const [selectedSatellite, setSelectedSatellite] = useState(null);

  const { windowStart, windowEnd, windowMs } = timeWindow;

  // Event type colors
  const eventTypeColors = {
    health: '#10B981',
    payload: '#3B82F6',
    AOCS: '#F59E0B',
    communication: '#8B5CF6',
    maintenance: '#EF4444',
    access_window: '#6B7280'
  };

  // Filter events within time window
  const visibleEvents = cluster.events.filter(event => {
    const eventTime = new Date(event.planned_time).getTime();
    return eventTime >= windowStart && eventTime <= windowEnd;
  });

  const renderSatelliteRow = (satellite) => {
    const satelliteEvents = visibleEvents.filter(e => e.satellite_name === satellite);
    
    return (
      <div 
        key={satellite} 
        className={`flex border-b hover:bg-gray-100 ${
          selectedSatellite === satellite ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => setSelectedSatellite(selectedSatellite === satellite ? null : satellite)}
      >
        <div className="w-80 px-8 py-2 text-sm border-r cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{satellite}</div>
              <div className="text-xs text-gray-500">
                {satelliteEvents.length} events in view
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              {selectedSatellite === satellite ? '▼' : '▶'}
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative h-12">
          {/* Time grid lines would be rendered by parent component */}
          
          {/* Satellite events */}
          {satelliteEvents.map(event => {
            const start = new Date(event.planned_time).getTime();
            const left = ((start - windowStart) / windowMs) * 100;
            const duration = event.duration || 30;
            const width = Math.max((duration * 60 * 1000) / windowMs * 100, 0.5);
            
            return (
              <div
                key={event.event_id || `${event.satellite_name}-${event.planned_time}`}
                className="absolute top-1 h-10 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                style={{
                  left: `${Math.max(0, Math.min(left, 100))}%`,
                  width: `${Math.min(width, 100 - left)}%`,
                  backgroundColor: eventTypeColors[event.event_type] || '#3B82F6',
                  minWidth: '2px',
                }}
                onMouseEnter={(e) => onEventHover && onEventHover(event, e)}
                onMouseLeave={() => onEventHover && onEventHover(null, e)}
                title={`${event.activity_type} - ${event.satellite_name}`}
              >
                <span className="truncate px-1 text-[10px]">
                  {event.activity_type}
                </span>
              </div>
            );
          })}
          
          {/* Empty state for satellite with no events in view */}
          {satelliteEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
              No events in time range
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSatelliteDetails = (satellite) => {
    const satelliteEvents = cluster.events.filter(e => e.satellite_name === satellite);
    const recentEvents = satelliteEvents
      .sort((a, b) => new Date(b.planned_time) - new Date(a.planned_time))
      .slice(0, 5);

    return (
      <div className="bg-blue-50 border-l-4 border-blue-300 p-4 m-2 rounded">
        <h4 className="font-semibold mb-3 text-blue-800">{satellite} Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Event Statistics */}
          <div>
            <h5 className="font-medium mb-2">Event Statistics</h5>
            <div className="space-y-1">
              {Object.entries(cluster.eventCounts).map(([type, count]) => {
                const satelliteTypeCount = satelliteEvents.filter(e => e.event_type === type).length;
                if (satelliteTypeCount === 0) return null;
                
                return (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type.replace('_', ' ')}:</span>
                    <span>{satelliteTypeCount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <h5 className="font-medium mb-2">Recent Events</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recentEvents.map(event => (
                <div 
                  key={event.event_id || `${event.satellite_name}-${event.planned_time}`}
                  className="flex justify-between text-xs"
                >
                  <span className="truncate">{event.activity_type}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(event.planned_time).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <div className="text-gray-500 text-xs">No recent events</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-l-4 border-blue-500">
      {/* Cluster Overview */}
      <div className="px-4 py-2 bg-blue-100 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">{cluster.name} - Expanded View</h3>
            <div className="text-sm text-gray-600">
              {cluster.satellites.length} satellites • {visibleEvents.length} events in view
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          >
            Collapse ▲
          </button>
        </div>
      </div>

      {/* Satellite Rows */}
      <div className="max-h-64 overflow-y-auto">
        {cluster.satellites.map(satellite => renderSatelliteRow(satellite))}
      </div>

      {/* Selected Satellite Details */}
      {selectedSatellite && renderSatelliteDetails(selectedSatellite)}

      {/* Cluster Summary */}
      <div className="px-4 py-2 bg-gray-100 border-t text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <div>
            Status: <span className={`font-medium ${
              cluster.status === 'critical' ? 'text-red-600' :
              cluster.status === 'active' ? 'text-green-600' :
              cluster.status === 'nominal' ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {cluster.status.toUpperCase()}
            </span>
          </div>
          <div>
            Critical Events: <span className="font-medium text-red-600">
              {cluster.criticalEvents.length}
            </span>
          </div>
          <div>
            Total Events: <span className="font-medium">{cluster.events.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}