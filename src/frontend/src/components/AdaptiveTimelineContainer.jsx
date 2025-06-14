// AdaptiveTimelineContainer.jsx - Main orchestrator for adaptive timeline display
import React, { useState, useEffect, lazy, Suspense } from 'react';
import ViewToggle from './ViewToggle.jsx';
import ClusterDetector, { CLUSTER_TYPES, useClusterDetection } from './ClusterDetector.jsx';

// Lazy load timeline components
const GanttChart = lazy(() => import('./GanttChart.jsx'));
const TimelineTable = lazy(() => import('./TimelineTable.jsx'));
const ClusterTimelineView = lazy(() => import('./ClusterTimelineView.jsx'));
const ClusterGridView = lazy(() => import('./ClusterGridView.jsx'));

export default function AdaptiveTimelineContainer({ events = [], satellites = [] }) {
  // Time view state (preserved across tier changes)
  const [timeView, setTimeView] = useState('day');
  const [scrollOffset, setScrollOffset] = useState(0);
  
  // Display mode state
  const [displayView, setDisplayView] = useState('timeline');
  const [clusterType, setClusterType] = useState(CLUSTER_TYPES.CONSTELLATION);
  const [manualTierOverride, setManualTierOverride] = useState(null);
  
  // Expanded clusters for Tier 2
  const [expandedClusters, setExpandedClusters] = useState(new Set());
  
  // Get cluster data
  const clusterData = useClusterDetection(satellites, events, clusterType);
  const { clusters, tier: autoTier, clusterCount } = clusterData;
  
  // Use manual override if set, otherwise use automatic tier
  const currentTier = manualTierOverride || autoTier;
  
  useEffect(() => {
    console.log('AdaptiveTimelineContainer loaded');
    console.log(`Detected ${clusterCount} clusters, auto-tier: ${autoTier}, current-tier: ${currentTier}`);
  }, [clusterCount, autoTier, currentTier]);

  // View options for display toggle
  const viewOptions = [
    { key: 'timeline', label: 'Timeline', icon: 'timeline' },
    { key: 'table', label: 'Table', icon: 'table' }
  ];

  // Cluster type options for user selection
  const clusterTypeOptions = [
    { key: CLUSTER_TYPES.CONSTELLATION, label: 'Constellation' },
    { key: CLUSTER_TYPES.MISSION, label: 'Mission Type' },
    { key: CLUSTER_TYPES.ORGANIZATION, label: 'Organization' },
    { key: CLUSTER_TYPES.TECHNICAL, label: 'Technical' }
  ];

  // Tier control options
  const tierOptions = [
    { key: null, label: 'Auto' },
    { key: 1, label: 'Individual' },
    { key: 2, label: 'Clusters' },
    { key: 3, label: 'Grid' }
  ];

  // Handle cluster expansion toggle
  const toggleClusterExpansion = (clusterId) => {
    setExpandedClusters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clusterId)) {
        newSet.delete(clusterId);
      } else {
        newSet.add(clusterId);
      }
      return newSet;
    });
  };

  // Create props for timeline components
  const timelineProps = {
    timeView,
    onTimeViewChange: setTimeView,
    scrollOffset,
    onScrollOffsetChange: setScrollOffset,
    expandedClusters,
    onToggleClusterExpansion: toggleClusterExpansion
  };

  // Render tier-appropriate timeline component
  const renderTimelineContent = () => {
    if (displayView === 'table') {
      return (
        <Suspense fallback={<TimelineLoadingSpinner message="Loading table..." />}>
          <TimelineTable 
            events={events}
            satellites={satellites}
            clusters={clusters}
            tier={currentTier}
          />
        </Suspense>
      );
    }

    // Timeline view - select component based on tier
    switch (currentTier) {
      case 1:
        // Individual satellite view - use existing GanttChart
        return (
          <Suspense fallback={<TimelineLoadingSpinner message="Loading individual timeline..." />}>
            <GanttChart 
              events={events}
              satellites={satellites}
              {...timelineProps}
            />
          </Suspense>
        );
      
      case 2:
        // Cluster timeline view
        return (
          <Suspense fallback={<TimelineLoadingSpinner message="Loading cluster timeline..." />}>
            <ClusterTimelineView 
              clusters={clusters}
              events={events}
              clusterType={clusterType}
              {...timelineProps}
            />
          </Suspense>
        );
      
      case 3:
        // Grid view for high cluster counts
        return (
          <Suspense fallback={<TimelineLoadingSpinner message="Loading cluster grid..." />}>
            <ClusterGridView 
              clusters={clusters}
              events={events}
              clusterType={clusterType}
              {...timelineProps}
            />
          </Suspense>
        );
      
      default:
        return <div className="p-8 text-center text-red-500">Invalid tier: {currentTier}</div>;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Control Panel */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        {/* Primary Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Display Mode Toggle */}
          <ViewToggle 
            currentView={displayView}
            onViewChange={setDisplayView}
            views={viewOptions}
          />
          
          {/* Cluster Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{satellites.length} satellites</span>
            <span>•</span>
            <span>{clusterCount} clusters</span>
            <span>•</span>
            <span className="font-medium">Tier {currentTier}</span>
          </div>
        </div>

        {/* Secondary Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Clustering Controls */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Cluster by:
            </label>
            <select 
              value={clusterType}
              onChange={(e) => setClusterType(e.target.value)}
              className="border rounded px-3 py-1 text-sm bg-white"
            >
              {clusterTypeOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700 ml-4">
              Display:
            </label>
            <select 
              value={manualTierOverride || 'auto'}
              onChange={(e) => setManualTierOverride(e.target.value === 'auto' ? null : parseInt(e.target.value))}
              className="border rounded px-3 py-1 text-sm bg-white"
            >
              <option value="auto">Auto (Tier {autoTier})</option>
              <option value="1">Individual Satellites</option>
              <option value="2">Cluster Swimlanes</option>
              <option value="3">Cluster Grid</option>
            </select>
          </div>

          {/* Tier-specific controls */}
          {currentTier === 2 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setExpandedClusters(new Set())}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Collapse All
              </button>
              <button
                onClick={() => setExpandedClusters(new Set(clusters.map(c => c.id)))}
                className="px-3 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
              >
                Expand All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {clusters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-2">🛰️</div>
            <p className="font-medium">No satellite data available</p>
            <p className="text-sm">Ensure satellites are loaded and events are available</p>
          </div>
        ) : (
          renderTimelineContent()
        )}
      </div>

      {/* Status Bar */}
      <div className="text-xs text-gray-500 flex justify-between items-center">
        <div>
          Showing {currentTier === 1 ? 'individual satellites' : 
                   currentTier === 2 ? 'cluster swimlanes' : 
                   'cluster grid'} • {events.length} events
        </div>
        {manualTierOverride && (
          <div className="text-blue-600">
            Manual override active (Auto: Tier {autoTier})
          </div>
        )}
      </div>
    </div>
  );
}

// Loading spinner component
function TimelineLoadingSpinner({ message = "Loading timeline..." }) {
  return (
    <div className="animate-pulse bg-gray-200 h-64 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}