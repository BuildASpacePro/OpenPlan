// ClusterTimelineView.jsx - Tier 2 cluster swimlane timeline view
import React, { useState, useMemo } from 'react';
import EventTooltip from './EventTooltip.jsx';

export default function ClusterTimelineView({ 
  clusters, 
  events, 
  clusterType,
  timeView,
  onTimeViewChange,
  scrollOffset,
  onScrollOffsetChange,
  expandedClusters,
  onToggleClusterExpansion
}) {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Time view configuration
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

  // Calculate time window and markers
  const { windowStart, windowEnd, windowMs, timeMarkers, totalRange, maxScrollOffset } = useMemo(() => {
    if (!events || events.length === 0) return { windowStart: 0, windowEnd: 0, windowMs: 0, timeMarkers: [], totalRange: 0, maxScrollOffset: 0 };

    const eventTimes = events.map(e => new Date(e.planned_time).getTime()).filter(t => !isNaN(t));
    if (eventTimes.length === 0) return { windowStart: 0, windowEnd: 0, windowMs: 0, timeMarkers: [], totalRange: 0, maxScrollOffset: 0 };

    const minTime = Math.min(...eventTimes);
    const maxTime = Math.max(...eventTimes);
    const totalRange = maxTime - minTime;
    const windowMs = getWindowMs(timeView);
    const windowStart = minTime + scrollOffset;
    const windowEnd = windowStart + windowMs;
    const maxScrollOffset = Math.max(0, totalRange - windowMs);

    // Generate time markers
    const markers = [];
    const markerCount = 8;
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

    return { windowStart, windowEnd, windowMs, timeMarkers: markers, totalRange, maxScrollOffset };
  }, [events, timeView, scrollOffset]);

  // Format time labels
  const formatTimeOnly = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case 'hour':
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
      case 'month':
        return date.toLocaleDateString([], { day: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDateOnly = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case 'hour':
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'week':
      case 'month':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

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

  // Scroll handlers
  const scrollStep = windowMs / 4;

  const scrollLeft = () => {
    onScrollOffsetChange(Math.max(scrollOffset - scrollStep, 0));
  };

  const scrollRight = () => {
    onScrollOffsetChange(Math.min(scrollOffset + scrollStep, maxScrollOffset));
  };

  // Cluster status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'nominal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Event type colors
  const eventTypeColors = {
    health: '#10B981',
    payload: '#3B82F6',
    AOCS: '#F59E0B',
    communication: '#8B5CF6',
    maintenance: '#EF4444',
    access_window: '#6B7280'
  };

  if (!clusters || clusters.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
        <p>No clusters available for timeline display.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onScrollOffsetChange(0)} 
            disabled={scrollOffset <= 0}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Go to start"
          >
            ⏮ Start
          </button>
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
          <button 
            onClick={() => onScrollOffsetChange(maxScrollOffset)} 
            disabled={scrollOffset >= maxScrollOffset}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Go to end"
          >
            End ⏭
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Time Range:</span>
          <select 
            value={timeView} 
            onChange={e => {
              onTimeViewChange(e.target.value);
              onScrollOffsetChange(0);
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

      {/* Cluster Timeline */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Time header */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <div className="w-80 px-4 py-3 font-semibold border-r bg-gray-100">
              Cluster ({clusterType})
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
              
              {/* Current Time Indicator */}
              {(() => {
                const now = new Date().getTime();
                if (now >= windowStart && now <= windowEnd) {
                  const currentTimePosition = ((now - windowStart) / windowMs) * 100;
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${currentTimePosition}%` }}
                      title="Current Time"
                    >
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
                      <div className="absolute -top-6 -left-8 text-xs text-red-600 font-bold whitespace-nowrap">
                        NOW
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        {/* Cluster rows */}
        <div className="max-h-96 overflow-y-auto">
          {clusters.map(cluster => (
            <div key={cluster.id} className="border-b-2 border-gray-300">
              {/* Cluster header row */}
              <div 
                className={`flex bg-gray-100 hover:bg-gray-200 cursor-pointer ${
                  expandedClusters.has(cluster.id) ? 'border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onToggleClusterExpansion(cluster.id)}
              >
                <div className="w-80 px-4 py-3 border-r flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(cluster.status)}`} />
                    <div>
                      <div className="font-semibold">{cluster.name}</div>
                      <div className="text-xs text-gray-600">
                        {cluster.satellites.length} satellite{cluster.satellites.length !== 1 ? 's' : ''}
                        {cluster.criticalEvents.length > 0 && (
                          <span className="ml-2 text-red-600">
                            {cluster.criticalEvents.length} critical
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedClusters.has(cluster.id) ? '▼' : '▶'}
                  </div>
                </div>
                
                <div className="flex-1 relative h-16">
                  {/* Time grid lines */}
                  {timeMarkers.map((marker, markerIndex) => (
                    <div
                      key={markerIndex}
                      className="absolute top-0 h-full border-l border-gray-200"
                      style={{ left: `${marker.position}%` }}
                    />
                  ))}
                  
                  {/* Cluster-level aggregated events */}
                  {Object.entries(cluster.eventCounts).map(([eventType, count]) => {
                    if (count === 0) return null;
                    
                    const clusterEvents = cluster.events.filter(e => 
                      e.event_type === eventType &&
                      new Date(e.planned_time).getTime() >= windowStart && 
                      new Date(e.planned_time).getTime() <= windowEnd
                    );
                    
                    return clusterEvents.map((event, index) => {
                      const start = new Date(event.planned_time).getTime();
                      const left = ((start - windowStart) / windowMs) * 100;
                      const duration = event.duration || 30;
                      const width = Math.max((duration * 60 * 1000) / windowMs * 100, 0.5);
                      
                      return (
                        <div
                          key={`${event.event_id}-${index}`}
                          className="absolute top-2 h-12 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border border-white opacity-80"
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
                          <span className="truncate px-1 text-[10px]">
                            {event.satellite_name}
                          </span>
                        </div>
                      );
                    });
                  })}
                  
                  {/* Current Time Indicator */}
                  {(() => {
                    const now = new Date().getTime();
                    if (now >= windowStart && now <= windowEnd) {
                      const currentTimePosition = ((now - windowStart) / windowMs) * 100;
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{ left: `${currentTimePosition}%` }}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Expanded cluster details */}
              {expandedClusters.has(cluster.id) && (
                <div className="bg-gray-50 border-l-4 border-blue-500">
                  {cluster.satellites.map(satellite => {
                    const satelliteEvents = cluster.events.filter(e => e.satellite_name === satellite);
                    
                    return (
                      <div key={satellite} className="flex border-b hover:bg-gray-100">
                        <div className="w-80 px-8 py-2 text-sm border-r">
                          <div className="font-medium">{satellite}</div>
                          <div className="text-xs text-gray-500">
                            {satelliteEvents.length} events
                          </div>
                        </div>
                        <div className="flex-1 relative h-12">
                          {/* Time grid lines */}
                          {timeMarkers.map((marker, markerIndex) => (
                            <div
                              key={markerIndex}
                              className="absolute top-0 h-full border-l border-gray-100"
                              style={{ left: `${marker.position}%` }}
                            />
                          ))}
                          
                          {/* Individual satellite events */}
                          {satelliteEvents.filter(event => {
                            const eventTime = new Date(event.planned_time).getTime();
                            return eventTime >= windowStart && eventTime <= windowEnd;
                          }).map(event => {
                            const start = new Date(event.planned_time).getTime();
                            const left = ((start - windowStart) / windowMs) * 100;
                            const duration = event.duration || 30;
                            const width = Math.max((duration * 60 * 1000) / windowMs * 100, 0.5);
                            
                            return (
                              <div
                                key={event.event_id || `${event.satellite_name}-${event.planned_time}`}
                                className="absolute top-1 h-10 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200"
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
                              >
                                <span className="truncate px-1 text-[10px]">
                                  {event.activity_type}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
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