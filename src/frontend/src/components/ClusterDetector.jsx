// ClusterDetector.jsx - Analyzes satellites and creates clusters based on tags
import { useState, useEffect } from 'react';

export const CLUSTER_TYPES = {
  CONSTELLATION: 'constellation',
  MISSION: 'mission', 
  ORGANIZATION: 'organization',
  TECHNICAL: 'technical'
};

export const TIER_THRESHOLDS = {
  INDIVIDUAL: 10,    // ≤10 clusters -> Tier 1 (individual satellites)
  CLUSTER: 50        // 11-50 clusters -> Tier 2, 50+ -> Tier 3
};

/**
 * Hook for detecting and managing satellite clusters
 */
export function useClusterDetection(satellites, events, selectedClusterType = CLUSTER_TYPES.CONSTELLATION) {
  const [clusterData, setClusterData] = useState({
    clusters: [],
    tier: 1,
    clusterCount: 0,
    unclusteredSatellites: []
  });

  useEffect(() => {
    if (!satellites || satellites.length === 0) {
      setClusterData({
        clusters: [],
        tier: 1,
        clusterCount: 0,
        unclusteredSatellites: []
      });
      return;
    }

    // Group satellites by the selected cluster type
    groupSatellitesByTags(satellites, events, selectedClusterType)
      .then(clusters => {
        const clusterCount = clusters.length;
        
        // Determine display tier based on cluster count
        let tier;
        if (clusterCount <= TIER_THRESHOLDS.INDIVIDUAL) {
          tier = 1;
        } else if (clusterCount <= TIER_THRESHOLDS.CLUSTER) {
          tier = 2;
        } else {
          tier = 3;
        }

        setClusterData({
          clusters,
          tier,
          clusterCount,
          unclusteredSatellites: clusters.filter(c => c.type === 'individual').flatMap(c => c.satellites || [])
        });
      })
      .catch(error => {
        console.error('Error in cluster detection:', error);
        // Fallback to individual satellites
        const individualClusters = satellites.map(satellite => ({
          id: `individual_${satellite}`,
          name: satellite,
          type: 'individual',
          satellites: [satellite],
          events: events.filter(e => e.satellite_name === satellite),
          status: 'unknown',
          eventCounts: {},
          criticalEvents: []
        }));

        setClusterData({
          clusters: individualClusters,
          tier: 1,
          clusterCount: individualClusters.length,
          unclusteredSatellites: []
        });
      });
  }, [satellites, events, selectedClusterType]);

  return clusterData;
}

/**
 * Groups satellites by their tags based on the selected cluster type
 * NOTE: This function now serves as a fallback for client-side clustering
 * when API data is not available. The primary clustering should use the API.
 */
async function groupSatellitesByTags(satellites, events, clusterType) {
  // Try to use API first (using relative URL for browser)
  try {
    const response = await fetch(`/api/clusters/${clusterType}`);
    
    if (response.ok) {
      const clusterData = await response.json();
      return clusterData.clusters.map(cluster => ({
        ...cluster,
        eventCounts: cluster.event_counts,
        criticalEvents: cluster.critical_events
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch cluster data from API, falling back to client-side clustering:', error);
  }
  
  // Fallback to client-side clustering using name patterns
  const clusters = new Map();
  const unclusteredSatellites = [];

  satellites.forEach(satellite => {
    const clusterKey = getClusterKey(satellite, clusterType);
    
    if (!clusterKey) {
      unclusteredSatellites.push(satellite);
      return;
    }

    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, {
        id: clusterKey,
        name: clusterKey,
        type: clusterType,
        satellites: [],
        events: [],
        status: 'unknown',
        eventCounts: {},
        criticalEvents: []
      });
    }

    clusters.get(clusterKey).satellites.push(satellite);
  });

  // Add unclustered satellites as individual "clusters"
  unclusteredSatellites.forEach(satellite => {
    const clusterKey = `individual_${satellite}`;
    clusters.set(clusterKey, {
      id: clusterKey,
      name: satellite,
      type: 'individual',
      satellites: [satellite],
      events: [],
      status: 'unknown',
      eventCounts: {},
      criticalEvents: []
    });
  });

  // Convert to array and enrich with event data
  const clusterArray = Array.from(clusters.values());
  
  // Aggregate events for each cluster
  clusterArray.forEach(cluster => {
    const clusterEvents = events.filter(event => 
      cluster.satellites.includes(event.satellite_name)
    );
    
    cluster.events = clusterEvents;
    cluster.eventCounts = aggregateEventCounts(clusterEvents);
    cluster.criticalEvents = getCriticalEvents(clusterEvents);
    cluster.status = calculateClusterStatus(clusterEvents, cluster.satellites);
  });

  return clusterArray.sort((a, b) => {
    // Sort by cluster size (descending), then by name
    if (b.satellites.length !== a.satellites.length) {
      return b.satellites.length - a.satellites.length;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Extracts cluster key from satellite based on cluster type
 */
function getClusterKey(satelliteName, clusterType) {
  // For now, extract from satellite name patterns
  // TODO: This should use actual tag data from API when available
  
  switch (clusterType) {
    case CLUSTER_TYPES.CONSTELLATION:
      return extractConstellationFromName(satelliteName);
    
    case CLUSTER_TYPES.MISSION:
      return extractMissionFromName(satelliteName);
    
    case CLUSTER_TYPES.ORGANIZATION:
      return extractOrganizationFromName(satelliteName);
    
    case CLUSTER_TYPES.TECHNICAL:
      return extractTechnicalFromName(satelliteName);
    
    default:
      return null;
  }
}

/**
 * Temporary name-based constellation extraction
 * TODO: Replace with tag-based lookup from API
 */
function extractConstellationFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  
  if (name.includes('STARLINK')) return 'Starlink';
  if (name.includes('ONEWEB')) return 'OneWeb';
  if (name.includes('GPS') || name.includes('NAVSTAR')) return 'GPS';
  if (name.includes('GALILEO')) return 'Galileo';
  if (name.includes('GLONASS')) return 'GLONASS';
  if (name.includes('BEIDOU')) return 'BeiDou';
  if (name.includes('ISS')) return 'Space Stations';
  if (name.includes('TIANGONG')) return 'Space Stations';
  
  return null; // Will be treated as individual
}

function extractMissionFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  
  if (name.includes('COMM') || name.includes('STARLINK') || name.includes('ONEWEB')) {
    return 'Communication';
  }
  if (name.includes('GPS') || name.includes('NAV') || name.includes('GALILEO')) {
    return 'Navigation';
  }
  if (name.includes('ISS') || name.includes('TIANGONG') || name.includes('STATION')) {
    return 'Space Station';
  }
  if (name.includes('WEATHER') || name.includes('METEO')) {
    return 'Weather';
  }
  if (name.includes('SCIENTIFIC') || name.includes('RESEARCH')) {
    return 'Scientific';
  }
  
  return 'General Mission';
}

function extractOrganizationFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  
  if (name.includes('STARLINK')) return 'SpaceX';
  if (name.includes('ONEWEB')) return 'OneWeb';
  if (name.includes('ISS')) return 'International';
  if (name.includes('TIANGONG')) return 'CNSA';
  
  return 'Unknown';
}

function extractTechnicalFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  
  if (name.includes('ISS') || name.includes('TIANGONG')) return 'Large Platform';
  if (name.includes('STARLINK') || name.includes('ONEWEB')) return 'Smallsat';
  
  return 'Standard';
}

/**
 * Aggregates event counts by type for a cluster
 */
function aggregateEventCounts(events) {
  const counts = {};
  
  events.forEach(event => {
    const type = event.event_type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });
  
  return counts;
}

/**
 * Filters critical events from cluster events
 */
function getCriticalEvents(events) {
  // Consider maintenance, AOCS issues, and health problems as critical
  return events.filter(event => {
    const type = event.event_type;
    const activity = event.activity_type?.toLowerCase() || '';
    
    return type === 'maintenance' || 
           type === 'AOCS' || 
           (type === 'health' && (activity.includes('error') || activity.includes('fault')));
  });
}

/**
 * Calculates overall cluster status based on events and satellites
 */
function calculateClusterStatus(events, satellites) {
  const criticalEvents = getCriticalEvents(events);
  
  if (criticalEvents.length > 0) {
    return 'critical';
  }
  
  // Check for recent activity (events in last 24 hours)
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentEvents = events.filter(event => {
    const eventTime = new Date(event.planned_time);
    return eventTime >= oneDayAgo;
  });
  
  if (recentEvents.length > 0) {
    return 'active';
  }
  
  if (events.length > 0) {
    return 'nominal';
  }
  
  return 'unknown';
}

export default function ClusterDetector({ children, ...props }) {
  const clusterData = useClusterDetection(props.satellites, props.events, props.clusterType);
  
  return children(clusterData);
}