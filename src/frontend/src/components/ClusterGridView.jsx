// ClusterGridView.jsx - Tier 3 high-density cluster grid view
import React, { useState, useMemo } from 'react';
import EventTooltip from './EventTooltip.jsx';

export default function ClusterGridView({ 
  clusters, 
  events, 
  clusterType,
  timeView,
  onTimeViewChange,
  scrollOffset,
  onScrollOffsetChange
}) {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [sortBy, setSortBy] = useState('activity'); // 'activity', 'satellites', 'name', 'status'

  // Calculate cluster metrics and activity density
  const clustersWithMetrics = useMemo(() => {
    return clusters.map(cluster => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentEvents = cluster.events.filter(e => new Date(e.planned_time) >= oneHourAgo);
      const dailyEvents = cluster.events.filter(e => new Date(e.planned_time) >= oneDayAgo);
      const weeklyEvents = cluster.events.filter(e => new Date(e.planned_time) >= oneWeekAgo);

      const activityScore = recentEvents.length * 10 + dailyEvents.length * 2 + weeklyEvents.length;
      const criticalScore = cluster.criticalEvents.length * 5;
      const importanceScore = activityScore + criticalScore + cluster.satellites.length;

      return {
        ...cluster,
        metrics: {
          recentEvents: recentEvents.length,
          dailyEvents: dailyEvents.length,
          weeklyEvents: weeklyEvents.length,
          activityScore,
          criticalScore,
          importanceScore,
          density: cluster.events.length / Math.max(cluster.satellites.length, 1)
        }
      };
    });
  }, [clusters]);

  // Sort clusters by selected criteria
  const sortedClusters = useMemo(() => {
    return [...clustersWithMetrics].sort((a, b) => {
      switch (sortBy) {
        case 'activity':
          return b.metrics.importanceScore - a.metrics.importanceScore;
        case 'satellites':
          return b.satellites.length - a.satellites.length;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          const statusOrder = { critical: 4, active: 3, nominal: 2, unknown: 1 };
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
        default:
          return 0;
      }
    });
  }, [clustersWithMetrics, sortBy]);

  // Get top clusters for detailed view
  const topClusters = sortedClusters.slice(0, 20);

  // Activity density heat map calculation
  const getActivityDensityColor = (metrics) => {
    const { activityScore, importanceScore } = metrics;
    
    if (importanceScore > 50) return 'bg-red-500';      // Very high activity
    if (importanceScore > 30) return 'bg-orange-500';   // High activity
    if (importanceScore > 15) return 'bg-yellow-500';   // Medium activity  
    if (importanceScore > 5) return 'bg-blue-500';      // Low activity
    return 'bg-gray-300';                               // Minimal activity
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'active': return 'border-green-500 bg-green-50';
      case 'nominal': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  // Time period options for activity filtering
  const timePeriodOptions = [
    { label: 'Last Hour', value: 'hour' },
    { label: 'Last 24 Hours', value: 'day' },
    { label: 'Last Week', value: 'week' },
    { label: 'Last Month', value: 'month' }
  ];

  const sortOptions = [
    { label: 'Activity Level', value: 'activity' },
    { label: 'Satellite Count', value: 'satellites' },
    { label: 'Cluster Name', value: 'name' },
    { label: 'Status', value: 'status' }
  ];

  return (
    <div className="w-full p-4">
      {/* Controls */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-3 py-1 text-sm bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing top 20 of {clusters.length} clusters
          </div>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {topClusters.map(cluster => (
          <div
            key={cluster.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedCluster?.id === cluster.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : getStatusColor(cluster.status)
            }`}
            onClick={() => setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster)}
          >
            {/* Cluster header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg truncate" title={cluster.name}>
                {cluster.name}
              </h3>
              <div className={`w-4 h-4 rounded-full ${getActivityDensityColor(cluster.metrics)}`} 
                   title={`Activity Score: ${cluster.metrics.importanceScore}`} />
            </div>

            {/* Cluster stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Satellites:</span>
                <span className="font-medium">{cluster.satellites.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Events:</span>
                <span className="font-medium">{cluster.events.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Recent Activity:</span>
                <span className="font-medium">{cluster.metrics.recentEvents}</span>
              </div>
              
              {cluster.criticalEvents.length > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Critical:</span>
                  <span className="font-medium">{cluster.criticalEvents.length}</span>
                </div>
              )}
            </div>

            {/* Activity density bar */}
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Activity Density</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getActivityDensityColor(cluster.metrics)}`}
                  style={{ 
                    width: `${Math.min(100, (cluster.metrics.importanceScore / 60) * 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Event type breakdown */}
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Event Types</div>
              <div className="flex space-x-1">
                {Object.entries(cluster.eventCounts).map(([type, count]) => {
                  if (count === 0) return null;
                  const eventTypeColors = {
                    health: 'bg-green-400',
                    payload: 'bg-blue-400',
                    AOCS: 'bg-yellow-400',
                    communication: 'bg-purple-400',
                    maintenance: 'bg-red-400',
                    access_window: 'bg-gray-400'
                  };
                  
                  return (
                    <div 
                      key={type}
                      className={`w-2 h-6 rounded ${eventTypeColors[type] || 'bg-gray-400'}`}
                      title={`${type}: ${count} events`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Cluster Details */}
      {selectedCluster && (
        <div className="bg-white border-2 border-blue-500 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{selectedCluster.name} Cluster Details</h2>
            <button 
              onClick={() => setSelectedCluster(null)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cluster Overview */}
            <div>
              <h3 className="font-semibold mb-3">Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    selectedCluster.status === 'critical' ? 'text-red-600' :
                    selectedCluster.status === 'active' ? 'text-green-600' :
                    selectedCluster.status === 'nominal' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {selectedCluster.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Satellites:</span>
                  <span className="font-medium">{selectedCluster.satellites.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Events:</span>
                  <span className="font-medium">{selectedCluster.events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity Score:</span>
                  <span className="font-medium">{selectedCluster.metrics.importanceScore}</span>
                </div>
              </div>
            </div>

            {/* Satellites List */}
            <div>
              <h3 className="font-semibold mb-3">Member Satellites</h3>
              <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
                {selectedCluster.satellites.map(satellite => {
                  const satelliteEvents = selectedCluster.events.filter(e => e.satellite_name === satellite);
                  return (
                    <div key={satellite} className="flex justify-between border-b pb-1">
                      <span>{satellite}</span>
                      <span className="text-gray-500">{satelliteEvents.length} events</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Recent Events</h3>
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {selectedCluster.events
                  .sort((a, b) => new Date(b.planned_time) - new Date(a.planned_time))
                  .slice(0, 10)
                  .map(event => (
                    <div 
                      key={event.event_id || `${event.satellite_name}-${event.planned_time}`}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: {
                            health: '#10B981',
                            payload: '#3B82F6',
                            AOCS: '#F59E0B',
                            communication: '#8B5CF6',
                            maintenance: '#EF4444',
                            access_window: '#6B7280'
                          }[event.event_type] || '#6B7280' }}
                        />
                        <div>
                          <div className="font-medium">{event.activity_type}</div>
                          <div className="text-xs text-gray-500">{event.satellite_name}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.planned_time).toLocaleDateString()} {new Date(event.planned_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Activity Density Legend</h3>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Very High (50+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>High (30-49)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium (15-29)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Low (5-14)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Minimal (0-4)</span>
          </div>
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