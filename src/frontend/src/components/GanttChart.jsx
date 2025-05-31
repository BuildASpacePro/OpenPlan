import { useState } from 'react';

/**
 * GanttChart React component
 * @param {Object[]} events - Array of event objects with satellite_name, activity_type, duration, planned_time, colour
 * @param {string[]} satellites - Array of satellite names
 * @param {string} timeView - 'hour' | 'day' | 'week' | 'month'
 * @param {function} onTimeViewChange - callback for time view change
 */
export default function GanttChart({ events, satellites, timeView, onTimeViewChange }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const timeViewOptions = [
    { label: '1 Hour', value: 'hour' },
    { label: '1 Day', value: 'day' },
    { label: '1 Week', value: 'week' },
    { label: '1 Month', value: 'month' },
  ];

  // Helper to get time window in ms
  const getWindowMs = (view) => {
    switch (view) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  // Helper to format time labels
  const formatTimeLabel = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      default:
        return date.toLocaleString();
    }
  };

  // Handle empty events
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
        <p>No timeline events available.</p>
      </div>
    );
  }

  // Find min and max event times
  const eventTimes = events.map(e => new Date(e.planned_time).getTime()).filter(t => !isNaN(t));
  
  if (eventTimes.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
        <p>No valid timeline events found.</p>
      </div>
    );
  }

  const minTime = Math.min(...eventTimes);
  const maxTime = Math.max(...eventTimes);
  const totalRange = maxTime - minTime;

  // Current window
  const windowMs = getWindowMs(timeView);
  const windowStart = minTime + scrollOffset;
  const windowEnd = windowStart + windowMs;

  // Scroll handlers
  const maxScrollOffset = Math.max(0, totalRange - windowMs);
  const scrollStep = windowMs / 4; // Scroll by 1/4 of the window

  const scrollLeft = () => {
    setScrollOffset(Math.max(scrollOffset - scrollStep, 0));
  };
  
  const scrollRight = () => {
    setScrollOffset(Math.min(scrollOffset + scrollStep, maxScrollOffset));
  };

  // Generate time grid markers
  const generateTimeMarkers = () => {
    const markers = [];
    const markerCount = 8; // Number of time markers to show
    
    for (let i = 0; i <= markerCount; i++) {
      const timestamp = windowStart + (i / markerCount) * windowMs;
      const position = (i / markerCount) * 100;
      
      markers.push({
        timestamp,
        position,
        label: formatTimeLabel(timestamp, timeView)
      });
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <button 
            onClick={scrollLeft} 
            disabled={scrollOffset <= 0}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ◀ Earlier
          </button>
          <button 
            onClick={scrollRight} 
            disabled={scrollOffset >= maxScrollOffset}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Later ▶
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Time Range:</span>
          <select 
            value={timeView} 
            onChange={e => {
              onTimeViewChange(e.target.value);
              setScrollOffset(0); // Reset scroll when changing view
            }} 
            className="border rounded px-3 py-2 bg-white"
          >
            {timeViewOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current time range display */}
      <div className="mb-4 text-sm text-gray-600 text-center">
        Showing: {formatTimeLabel(windowStart, timeView)} - {formatTimeLabel(windowEnd, timeView)}
      </div>

      {/* Gantt Chart */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Time header */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <div className="w-48 px-4 py-3 font-semibold border-r bg-gray-100">
              Satellite
            </div>
            <div className="flex-1 relative h-12">
              {timeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full border-l border-gray-200 text-xs text-gray-600"
                  style={{ left: `${marker.position}%` }}
                >
                  <div className="p-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Satellite rows */}
        <div className="max-h-96 overflow-y-auto">
          {satellites.map((satellite, index) => {
            const satelliteEvents = events.filter(e => 
              e.satellite_name === satellite && 
              new Date(e.planned_time).getTime() >= windowStart && 
              new Date(e.planned_time).getTime() <= windowEnd
            );

            return (
              <div 
                key={satellite} 
                className={`flex border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              >
                <div className="w-48 px-4 py-4 font-medium border-r bg-gray-50">
                  {satellite}
                </div>
                <div className="flex-1 relative h-16 min-w-0">
                  {/* Time grid lines */}
                  {timeMarkers.map((marker, markerIndex) => (
                    <div
                      key={markerIndex}
                      className="absolute top-0 h-full border-l border-gray-100"
                      style={{ left: `${marker.position}%` }}
                    />
                  ))}
                  
                  {/* Events */}
                  {satelliteEvents.map(event => {
                    const start = new Date(event.planned_time).getTime();
                    const left = ((start - windowStart) / windowMs) * 100;
                    const duration = event.duration || 30; // Default 30 minutes if not specified
                    const width = Math.max((duration * 60 * 1000) / windowMs * 100, 1); // Minimum 1% width
                    
                    return (
                      <div
                        key={event.event_id || `${event.satellite_name}-${event.planned_time}`}
                        className="absolute top-2 h-12 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          left: `${Math.max(0, Math.min(left, 100))}%`,
                          width: `${Math.min(width, 100 - left)}%`,
                          backgroundColor: event.colour || '#3B82F6',
                          minWidth: '2px',
                        }}
                        title={`${event.activity_type || 'Event'} (${duration} min)\n${event.planned_time}\n${event.satellite_name}`}
                      >
                        <span className="truncate px-1">
                          {event.activity_type || 'Event'}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Empty state for satellite with no events */}
                  {satelliteEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      No events in this time range
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend/Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p>• Scroll through time using the navigation buttons</p>
        <p>• Change time range to zoom in/out of the timeline</p>
        <p>• Hover over events for detailed information</p>
      </div>
    </div>
  );
}