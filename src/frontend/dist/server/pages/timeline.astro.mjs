/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DyYsMblj.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, lazy, Suspense } from 'react';
import { V as ViewToggle } from '../chunks/ViewToggle_BkXTcmtA.mjs';
export { renderers } from '../renderers.mjs';

const CLUSTER_TYPES = {
  CONSTELLATION: "constellation",
  MISSION: "mission",
  ORGANIZATION: "organization",
  TECHNICAL: "technical"
};
const TIER_THRESHOLDS = {
  INDIVIDUAL: 10,
  // ≤10 clusters -> Tier 1 (individual satellites)
  CLUSTER: 50
  // 11-50 clusters -> Tier 2, 50+ -> Tier 3
};
function useClusterDetection(satellites, events, selectedClusterType = CLUSTER_TYPES.CONSTELLATION) {
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
    groupSatellitesByTags(satellites, events, selectedClusterType).then((clusters) => {
      const clusterCount = clusters.length;
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
        unclusteredSatellites: clusters.filter((c) => c.type === "individual").flatMap((c) => c.satellites || [])
      });
    }).catch((error) => {
      console.error("Error in cluster detection:", error);
      const individualClusters = satellites.map((satellite) => ({
        id: `individual_${satellite}`,
        name: satellite,
        type: "individual",
        satellites: [satellite],
        events: events.filter((e) => e.satellite_name === satellite),
        status: "unknown",
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
async function groupSatellitesByTags(satellites, events, clusterType) {
  try {
    const response = await fetch(`/api/clusters/${clusterType}`);
    if (response.ok) {
      const clusterData = await response.json();
      return clusterData.clusters.map((cluster) => ({
        ...cluster,
        eventCounts: cluster.event_counts,
        criticalEvents: cluster.critical_events
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch cluster data from API, falling back to client-side clustering:", error);
  }
  const clusters = /* @__PURE__ */ new Map();
  const unclusteredSatellites = [];
  satellites.forEach((satellite) => {
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
        status: "unknown",
        eventCounts: {},
        criticalEvents: []
      });
    }
    clusters.get(clusterKey).satellites.push(satellite);
  });
  unclusteredSatellites.forEach((satellite) => {
    const clusterKey = `individual_${satellite}`;
    clusters.set(clusterKey, {
      id: clusterKey,
      name: satellite,
      type: "individual",
      satellites: [satellite],
      events: [],
      status: "unknown",
      eventCounts: {},
      criticalEvents: []
    });
  });
  const clusterArray = Array.from(clusters.values());
  clusterArray.forEach((cluster) => {
    const clusterEvents = events.filter(
      (event) => cluster.satellites.includes(event.satellite_name)
    );
    cluster.events = clusterEvents;
    cluster.eventCounts = aggregateEventCounts(clusterEvents);
    cluster.criticalEvents = getCriticalEvents(clusterEvents);
    cluster.status = calculateClusterStatus(clusterEvents, cluster.satellites);
  });
  return clusterArray.sort((a, b) => {
    if (b.satellites.length !== a.satellites.length) {
      return b.satellites.length - a.satellites.length;
    }
    return a.name.localeCompare(b.name);
  });
}
function getClusterKey(satelliteName, clusterType) {
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
function extractConstellationFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  if (name.includes("STARLINK")) return "Starlink";
  if (name.includes("ONEWEB")) return "OneWeb";
  if (name.includes("GPS") || name.includes("NAVSTAR")) return "GPS";
  if (name.includes("GALILEO")) return "Galileo";
  if (name.includes("GLONASS")) return "GLONASS";
  if (name.includes("BEIDOU")) return "BeiDou";
  if (name.includes("ISS")) return "Space Stations";
  if (name.includes("TIANGONG")) return "Space Stations";
  return null;
}
function extractMissionFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  if (name.includes("COMM") || name.includes("STARLINK") || name.includes("ONEWEB")) {
    return "Communication";
  }
  if (name.includes("GPS") || name.includes("NAV") || name.includes("GALILEO")) {
    return "Navigation";
  }
  if (name.includes("ISS") || name.includes("TIANGONG") || name.includes("STATION")) {
    return "Space Station";
  }
  if (name.includes("WEATHER") || name.includes("METEO")) {
    return "Weather";
  }
  if (name.includes("SCIENTIFIC") || name.includes("RESEARCH")) {
    return "Scientific";
  }
  return "General Mission";
}
function extractOrganizationFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  if (name.includes("STARLINK")) return "SpaceX";
  if (name.includes("ONEWEB")) return "OneWeb";
  if (name.includes("ISS")) return "International";
  if (name.includes("TIANGONG")) return "CNSA";
  return "Unknown";
}
function extractTechnicalFromName(satelliteName) {
  const name = satelliteName.toUpperCase();
  if (name.includes("ISS") || name.includes("TIANGONG")) return "Large Platform";
  if (name.includes("STARLINK") || name.includes("ONEWEB")) return "Smallsat";
  return "Standard";
}
function aggregateEventCounts(events) {
  const counts = {};
  events.forEach((event) => {
    const type = event.event_type || "unknown";
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}
function getCriticalEvents(events) {
  return events.filter((event) => {
    const type = event.event_type;
    const activity = event.activity_type?.toLowerCase() || "";
    return type === "maintenance" || type === "AOCS" || type === "health" && (activity.includes("error") || activity.includes("fault"));
  });
}
function calculateClusterStatus(events, satellites) {
  const criticalEvents = getCriticalEvents(events);
  if (criticalEvents.length > 0) {
    return "critical";
  }
  const now = /* @__PURE__ */ new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
  const recentEvents = events.filter((event) => {
    const eventTime = new Date(event.planned_time);
    return eventTime >= oneDayAgo;
  });
  if (recentEvents.length > 0) {
    return "active";
  }
  if (events.length > 0) {
    return "nominal";
  }
  return "unknown";
}

const GanttChart = lazy(() => import('../chunks/GanttChart_BZW5wAXv.mjs'));
const TimelineTable = lazy(() => import('../chunks/TimelineTable_CMXsN6qz.mjs'));
const ClusterTimelineView = lazy(() => import('../chunks/ClusterTimelineView_Cikepy4T.mjs'));
const ClusterGridView = lazy(() => import('../chunks/ClusterGridView_D_bY3VDJ.mjs'));
function AdaptiveTimelineContainer({ events = [], satellites = [] }) {
  const [timeView, setTimeView] = useState("day");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [displayView, setDisplayView] = useState("timeline");
  const [clusterType, setClusterType] = useState(CLUSTER_TYPES.CONSTELLATION);
  const [manualTierOverride, setManualTierOverride] = useState(null);
  const [expandedClusters, setExpandedClusters] = useState(/* @__PURE__ */ new Set());
  const clusterData = useClusterDetection(satellites, events, clusterType);
  const { clusters, tier: autoTier, clusterCount } = clusterData;
  const currentTier = manualTierOverride || autoTier;
  useEffect(() => {
    console.log("AdaptiveTimelineContainer loaded");
    console.log(`Detected ${clusterCount} clusters, auto-tier: ${autoTier}, current-tier: ${currentTier}`);
  }, [clusterCount, autoTier, currentTier]);
  const viewOptions = [
    { key: "timeline", label: "Timeline", icon: "timeline" },
    { key: "table", label: "Table", icon: "table" }
  ];
  const clusterTypeOptions = [
    { key: CLUSTER_TYPES.CONSTELLATION, label: "Constellation" },
    { key: CLUSTER_TYPES.MISSION, label: "Mission Type" },
    { key: CLUSTER_TYPES.ORGANIZATION, label: "Organization" },
    { key: CLUSTER_TYPES.TECHNICAL, label: "Technical" }
  ];
  const toggleClusterExpansion = (clusterId) => {
    setExpandedClusters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clusterId)) {
        newSet.delete(clusterId);
      } else {
        newSet.add(clusterId);
      }
      return newSet;
    });
  };
  const timelineProps = {
    timeView,
    onTimeViewChange: setTimeView,
    scrollOffset,
    onScrollOffsetChange: setScrollOffset,
    expandedClusters,
    onToggleClusterExpansion: toggleClusterExpansion
  };
  const renderTimelineContent = () => {
    if (displayView === "table") {
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(TimelineLoadingSpinner, { message: "Loading table..." }), children: /* @__PURE__ */ jsx(
        TimelineTable,
        {
          events,
          satellites,
          clusters,
          tier: currentTier
        }
      ) });
    }
    switch (currentTier) {
      case 1:
        return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(TimelineLoadingSpinner, { message: "Loading individual timeline..." }), children: /* @__PURE__ */ jsx(
          GanttChart,
          {
            events,
            satellites,
            ...timelineProps
          }
        ) });
      case 2:
        return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(TimelineLoadingSpinner, { message: "Loading cluster timeline..." }), children: /* @__PURE__ */ jsx(
          ClusterTimelineView,
          {
            clusters,
            events,
            clusterType,
            ...timelineProps
          }
        ) });
      case 3:
        return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(TimelineLoadingSpinner, { message: "Loading cluster grid..." }), children: /* @__PURE__ */ jsx(
          ClusterGridView,
          {
            clusters,
            events,
            clusterType,
            ...timelineProps
          }
        ) });
      default:
        return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-red-500", children: [
          "Invalid tier: ",
          currentTier
        ] });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
        /* @__PURE__ */ jsx(
          ViewToggle,
          {
            currentView: displayView,
            onViewChange: setDisplayView,
            views: viewOptions
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            satellites.length,
            " satellites"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            clusterCount,
            " clusters"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "Tier ",
            currentTier
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Cluster by:" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: clusterType,
              onChange: (e) => setClusterType(e.target.value),
              className: "border rounded px-3 py-1 text-sm bg-white",
              children: clusterTypeOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.key, children: option.label }, option.key))
            }
          ),
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700 ml-4", children: "Display:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: manualTierOverride || "auto",
              onChange: (e) => setManualTierOverride(e.target.value === "auto" ? null : parseInt(e.target.value)),
              className: "border rounded px-3 py-1 text-sm bg-white",
              children: [
                /* @__PURE__ */ jsxs("option", { value: "auto", children: [
                  "Auto (Tier ",
                  autoTier,
                  ")"
                ] }),
                /* @__PURE__ */ jsx("option", { value: "1", children: "Individual Satellites" }),
                /* @__PURE__ */ jsx("option", { value: "2", children: "Cluster Swimlanes" }),
                /* @__PURE__ */ jsx("option", { value: "3", children: "Cluster Grid" })
              ]
            }
          )
        ] }),
        currentTier === 2 && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setExpandedClusters(/* @__PURE__ */ new Set()),
              className: "px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300",
              children: "Collapse All"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setExpandedClusters(new Set(clusters.map((c) => c.id))),
              className: "px-3 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300",
              children: "Expand All"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: clusters.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-gray-500", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-2", children: "🛰️" }),
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: "No satellite data available" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Ensure satellites are loaded and events are available" })
    ] }) : renderTimelineContent() }),
    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        "Showing ",
        currentTier === 1 ? "individual satellites" : currentTier === 2 ? "cluster swimlanes" : "cluster grid",
        " • ",
        events.length,
        " events"
      ] }),
      manualTierOverride && /* @__PURE__ */ jsxs("div", { className: "text-blue-600", children: [
        "Manual override active (Auto: Tier ",
        autoTier,
        ")"
      ] })
    ] })
  ] });
}
function TimelineLoadingSpinner({ message = "Loading timeline..." }) {
  return /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-gray-200 h-64 rounded flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: message })
  ] }) });
}

const $$Timeline = createComponent(async ($$result, $$props, $$slots) => {
  let timeline = [];
  let accessWindows = [];
  try {
    const apiUrl = process.env.BACKEND_URL || "http://api:3000";
    const timelineResponse = await fetch(`${apiUrl}/api/timeline`);
    if (timelineResponse.ok) {
      timeline = await timelineResponse.json();
      console.log(`Fetched ${timeline.length} timeline events from API`);
    } else {
      console.error("Failed to fetch timeline:", timelineResponse.status, timelineResponse.statusText);
    }
    try {
      const accessResponse = await fetch(`${apiUrl}/api/accesswindows`);
      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        accessWindows = accessData.access_windows || [];
        console.log(`Fetched ${accessWindows.length} access window predictions from API`);
        const accessWindowEvents = accessWindows.map((window) => ({
          event_id: `access_${window.satellite_id}_${window.ground_station_id}_${window.start_time}`,
          satellite_id: window.satellite_id,
          satellite_name: window.satellite_name,
          mission: window.satellite_mission,
          colour: "gray",
          // Default color for access windows
          event_type: "access_window",
          activity_type: `Access to ${window.ground_station_name}`,
          duration: window.duration_minutes,
          planned_time: window.start_time,
          end_time: window.end_time,
          ground_station_name: window.ground_station_name,
          ground_station_id: window.ground_station_id
        }));
        timeline = [...timeline, ...accessWindowEvents];
        console.log(`Combined timeline now has ${timeline.length} total events`);
      } else {
        console.warn("Access windows not available:", accessResponse.status, accessResponse.statusText);
      }
    } catch (accessError) {
      console.warn("Error fetching access windows (continuing without them):", accessError);
    }
  } catch (error) {
    console.error("Error fetching timeline data:", error);
  }
  const satellites = Array.from(new Set(timeline.map((e) => e.satellite_name)));
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Timeline", "activePage": "timeline" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8"> <h1 class="text-3xl font-bold text-astro-dark mb-4">Mission Timeline</h1> <p class="text-astro-gray mb-6">
View and manage the complete mission timeline with key milestones and events.
</p> <div class="mb-4"> ${renderComponent($$result2, "AdaptiveTimelineContainer", AdaptiveTimelineContainer, { "client:load": true, "events": timeline, "satellites": satellites, "client:component-hydration": "load", "client:component-path": "/home/user/OpenPlan/src/frontend/src/components/AdaptiveTimelineContainer.jsx", "client:component-export": "default" })} </div> </div> </div> ` })}`;
}, "/home/user/OpenPlan/src/frontend/src/pages/timeline.astro", void 0);

const $$file = "/home/user/OpenPlan/src/frontend/src/pages/timeline.astro";
const $$url = "/timeline";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Timeline,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
