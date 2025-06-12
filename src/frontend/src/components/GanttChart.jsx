// filepath: missionplanning/src/frontend/src/components/GanttChart.jsx
import React, { useState, useEffect } from 'react';
import EventTooltip from './EventTooltip.jsx';

/**
 * GanttChart React component
 * @param {Object[]} events - Array of event objects with satellite_name, activity_type, duration, planned_time, colour, event_type
 * @param {string[]} satellites - Array of satellite names
 * @param {string} timeView - 'hour' | 'day' | 'week' | 'month'
 * @param {function} onTimeViewChange - callback for time view change
 */
function GanttChart({ events, satellites, timeView, onTimeViewChange }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedSatellites, setSelectedSatellites] = useState(satellites);

  // Initialize selected satellites when satellites prop changes
  useEffect(() => {
    setSelectedSatellites(satellites);
  }, [satellites]);

  const toggleSatelliteFilter = (satellite) => {
    setSelectedSatellites(prev => {
      if (prev.includes(satellite)) {
        return prev.filter(s => s !== satellite);
      } else {
        return [...prev, satellite];
      }
    });
  };
  
  const timeViewOptions = [
    { label: '1 Hour', value: 'hour' },
    { label: '1 Day', value: 'day' },
    { label: '1 Week', value: 'week' },
    { label: '1 Month', value: 'month' },
  ];

  // Event types in order
  const eventTypes = ['health', 'payload', 'AOCS', 'communication', 'maintenance', 'access_window'];
  
  // Event type colors
  const eventTypeColors = {
    health: '#10B981',      // Green
    payload: '#3B82F6',     // Blue
    AOCS: '#F59E0B',        // Amber
    communication: '#8B5CF6', // Purple
    maintenance: '#EF4444',  // Red
    access_window: '#6B7280' // Gray
  };

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

  // Helper to format just time
  const formatTimeOnly = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
      case 'month':
        return date.toLocaleDateString([], { day: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Helper to format just date
  const formatDateOnly = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case 'hour':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'week':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Legacy helper for backward compatibility
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
        timeLabel: formatTimeOnly(timestamp, timeView),
        dateLabel: formatDateOnly(timestamp, timeView)
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

      {/* Satellite Filter Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Filter Satellites:</span>
          <button
            onClick={() => setSelectedSatellites(satellites)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedSatellites.length === satellites.length 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({satellites.length})
          </button>
          <button
            onClick={() => setSelectedSatellites([])}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedSatellites.length === 0 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            None
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {satellites.map(satellite => (
            <button
              key={satellite}
              onClick={() => toggleSatelliteFilter(satellite)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedSatellites.includes(satellite)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {satellite}
            </button>
          ))}
        </div>
        {selectedSatellites.length < satellites.length && (
          <div className="mt-2 text-xs text-gray-600">
            Showing {selectedSatellites.length} of {satellites.length} satellites
          </div>
        )}
      </div>

      {/* Event Type Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 text-sm">
          {eventTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: eventTypeColors[type] }}
              />
              <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Time header */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <div className="w-64 px-4 py-3 font-semibold border-r bg-gray-100">
              Satellite / Event Type
            </div>
            <div className="flex-1 relative h-16">
              {timeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full border-l border-gray-200 text-xs text-gray-600"
                  style={{ left: `${marker.position}%` }}
                >
                  <div className="p-1 text-center">
                    <div className="font-semibold text-blue-600">
                      {marker.timeLabel}
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      {marker.dateLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Satellite rows with event type sub-rows */}
        <div className="max-h-96 overflow-y-auto">
          {selectedSatellites.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-2">🛰️</div>
              <p className="font-medium">No satellites selected</p>
              <p className="text-sm">Use the satellite filter above to select which satellites to display</p>
            </div>
          ) : (
            selectedSatellites.map((satellite, satelliteIndex) => {
            // Get unique event types for this satellite
            const satelliteEvents = events.filter(e => e.satellite_name === satellite);
            const satelliteEventTypes = eventTypes.filter(type => 
              satelliteEvents.some(e => e.event_type === type)
            );

            return (
              <div key={satellite} className="border-b-2 border-gray-300">
                {/* Satellite header row */}
                <div className="flex bg-gray-100 font-semibold">
                  <div className="w-64 px-4 py-2 border-r bg-gray-200">
                    {satellite}
                  </div>
                  <div className="flex-1 relative h-12">
                    {/* Time grid lines */}
                    {timeMarkers.map((marker, markerIndex) => (
                      <div
                        key={markerIndex}
                        className="absolute top-0 h-full border-l border-gray-200"
                        style={{ left: `${marker.position}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Event type sub-rows */}
                {satelliteEventTypes.map((eventType, typeIndex) => {
                  const typeEvents = satelliteEvents.filter(e => 
                    e.event_type === eventType &&
                    new Date(e.planned_time).getTime() >= windowStart && 
                    new Date(e.planned_time).getTime() <= windowEnd
                  );

                  return (
                    <div 
                      key={`${satellite}-${eventType}`}
                      className={`flex border-b hover:bg-gray-50 ${typeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                    >
                      <div className="w-64 px-6 py-3 text-sm border-r flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: eventTypeColors[eventType] }}
                        />
                        <span className="capitalize">{eventType.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex-1 relative h-12 min-w-0">
                        {/* Time grid lines */}
                        {timeMarkers.map((marker, markerIndex) => (
                          <div
                            key={markerIndex}
                            className="absolute top-0 h-full border-l border-gray-100"
                            style={{ left: `${marker.position}%` }}
                          />
                        ))}
                        
                        {/* Events */}
                        {typeEvents.map(event => {
                          const start = new Date(event.planned_time).getTime();
                          const left = ((start - windowStart) / windowMs) * 100;
                          const duration = event.duration || 30; // Default 30 minutes if not specified
                          const width = Math.max((duration * 60 * 1000) / windowMs * 100, 1); // Minimum 1% width
                          
                          return (
                            <div
                              key={event.event_id || `${event.satellite_name}-${event.planned_time}`}
                              className="absolute top-1 h-10 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border border-white"
                              style={{
                                left: `${Math.max(0, Math.min(left, 100))}%`,
                                width: `${Math.min(width, 100 - left)}%`,
                                backgroundColor: eventTypeColors[event.event_type] || '#3B82F6',
                                minWidth: '2px',
                              }}
                              onMouseEnter={(e) => {
                                setHoveredEvent(event);
                                setTooltipPosition({ x: e.clientX, y: e.clientY });
                                setShowTooltip(true);
                              }}
                              onMouseLeave={() => {
                                setShowTooltip(false);
                                setHoveredEvent(null);
                              }}
                              onMouseMove={(e) => {
                                if (showTooltip) {
                                  setTooltipPosition({ x: e.clientX, y: e.clientY });
                                }
                              }}
                            >
                              <span className="truncate px-1 font-medium">
                                {event.activity_type || 'Event'}
                              </span>
                            </div>
                          );
                        })}
                        
                        {/* Empty state for event type with no events */}
                        {typeEvents.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            No events in this time range
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Empty state for satellite with no event types */}
                {satelliteEventTypes.length === 0 && (
                  <div className="flex">
                    <div className="w-64 px-6 py-4 text-sm text-gray-500 border-r">
                      No events
                    </div>
                    <div className="flex-1 relative h-12 flex items-center justify-center text-gray-400 text-sm">
                      No events for this satellite
                    </div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>

      {/* Legend/Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p>• Each satellite is divided into rows by event type</p>
        <p>• Scroll through time using the navigation buttons</p>
        <p>• Change time range to zoom in/out of the timeline</p>
        <p>• Hover over events for detailed information</p>
      </div>

      {/* Event Tooltip */}
      <EventTooltip 
        event={hoveredEvent}
        isVisible={showTooltip}
        position={tooltipPosition}
      />
    </div>
  );
}

export default React.memo(GanttChart);