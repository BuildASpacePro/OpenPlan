import React from 'react';

function EventTooltip({ event, isVisible, position }) {
  if (!isVisible || !event) return null;

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      health: '🩺',
      payload: '📡',
      AOCS: '🛰️',
      communication: '📶',
      maintenance: '🔧',
      access_window: '🌍'
    };
    return icons[eventType] || '📅';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-64 max-w-80"
      style={{ 
        left: Math.min(position.x + 10, window.innerWidth - 320), 
        top: Math.max(position.y - 10, 10),
        pointerEvents: 'none'
      }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {event.activity_type || 'Event'}
          </h3>
          <p className="text-xs text-gray-600">{event.satellite_name}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <div className="text-gray-900 capitalize">
              {event.event_type ? event.event_type.replace('_', ' ') : '-'}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <div className="text-gray-900">{formatDuration(event.duration)}</div>
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Start:</span>
          <div className="text-gray-900">{formatDateTime(event.planned_time)}</div>
        </div>
        
        {event.end_time && (
          <div>
            <span className="font-medium text-gray-700">End:</span>
            <div className="text-gray-900">{formatDateTime(event.end_time)}</div>
          </div>
        )}
        
        {event.ground_station_name && (
          <div>
            <span className="font-medium text-gray-700">Ground Station:</span>
            <div className="text-gray-900">{event.ground_station_name}</div>
          </div>
        )}
        
        {event.mission && (
          <div>
            <span className="font-medium text-gray-700">Mission:</span>
            <div className="text-gray-900">{event.mission}</div>
          </div>
        )}
        
        {event.satellite_id && (
          <div className="pt-2 border-t border-gray-200">
            <span className="font-medium text-gray-700">Satellite ID:</span>
            <span className="ml-1 text-gray-900">{event.satellite_id}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventTooltip;