import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import { E as EventTooltip } from './EventTooltip_BEB3JnE3.mjs';

function ClusterGridView({
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
  const [sortBy, setSortBy] = useState("activity");
  const clustersWithMetrics = useMemo(() => {
    return clusters.map((cluster) => {
      const now = /* @__PURE__ */ new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const recentEvents = cluster.events.filter((e) => new Date(e.planned_time) >= oneHourAgo);
      const dailyEvents = cluster.events.filter((e) => new Date(e.planned_time) >= oneDayAgo);
      const weeklyEvents = cluster.events.filter((e) => new Date(e.planned_time) >= oneWeekAgo);
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
  const sortedClusters = useMemo(() => {
    return [...clustersWithMetrics].sort((a, b) => {
      switch (sortBy) {
        case "activity":
          return b.metrics.importanceScore - a.metrics.importanceScore;
        case "satellites":
          return b.satellites.length - a.satellites.length;
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          const statusOrder = { critical: 4, active: 3, nominal: 2, unknown: 1 };
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
        default:
          return 0;
      }
    });
  }, [clustersWithMetrics, sortBy]);
  const topClusters = sortedClusters.slice(0, 20);
  const getActivityDensityColor = (metrics) => {
    const { activityScore, importanceScore } = metrics;
    if (importanceScore > 50) return "bg-red-500";
    if (importanceScore > 30) return "bg-orange-500";
    if (importanceScore > 15) return "bg-yellow-500";
    if (importanceScore > 5) return "bg-blue-500";
    return "bg-gray-300";
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "active":
        return "border-green-500 bg-green-50";
      case "nominal":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };
  const sortOptions = [
    { label: "Activity Level", value: "activity" },
    { label: "Satellite Count", value: "satellites" },
    { label: "Cluster Name", value: "name" },
    { label: "Status", value: "status" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "w-full p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6 bg-gray-50 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700", children: "Sort by:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "border rounded px-3 py-1 text-sm bg-white",
            children: sortOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
        "Showing top 20 of ",
        clusters.length,
        " clusters"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6", children: topClusters.map((cluster) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedCluster?.id === cluster.id ? "border-blue-500 bg-blue-50 shadow-lg" : getStatusColor(cluster.status)}`,
        onClick: () => setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg truncate", title: cluster.name, children: cluster.name }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `w-4 h-4 rounded-full ${getActivityDensityColor(cluster.metrics)}`,
                title: `Activity Score: ${cluster.metrics.importanceScore}`
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Satellites:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: cluster.satellites.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Total Events:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: cluster.events.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Recent Activity:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: cluster.metrics.recentEvents })
            ] }),
            cluster.criticalEvents.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-red-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Critical:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: cluster.criticalEvents.length })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Activity Density" }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-2 rounded-full ${getActivityDensityColor(cluster.metrics)}`,
                style: {
                  width: `${Math.min(100, cluster.metrics.importanceScore / 60 * 100)}%`
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Event Types" }),
            /* @__PURE__ */ jsx("div", { className: "flex space-x-1", children: Object.entries(cluster.eventCounts).map(([type, count]) => {
              if (count === 0) return null;
              const eventTypeColors = {
                health: "bg-green-400",
                payload: "bg-blue-400",
                AOCS: "bg-yellow-400",
                communication: "bg-purple-400",
                maintenance: "bg-red-400",
                access_window: "bg-gray-400"
              };
              return /* @__PURE__ */ jsx(
                "div",
                {
                  className: `w-2 h-6 rounded ${eventTypeColors[type] || "bg-gray-400"}`,
                  title: `${type}: ${count} events`
                },
                type
              );
            }) })
          ] })
        ]
      },
      cluster.id
    )) }),
    selectedCluster && /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-blue-500 rounded-lg p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold", children: [
          selectedCluster.name,
          " Cluster Details"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedCluster(null),
            className: "text-gray-500 hover:text-gray-700 text-xl",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Overview" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Status:" }),
              /* @__PURE__ */ jsx("span", { className: `font-medium ${selectedCluster.status === "critical" ? "text-red-600" : selectedCluster.status === "active" ? "text-green-600" : selectedCluster.status === "nominal" ? "text-blue-600" : "text-gray-600"}`, children: selectedCluster.status.toUpperCase() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Satellites:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedCluster.satellites.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Total Events:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedCluster.events.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Activity Score:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedCluster.metrics.importanceScore })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Member Satellites" }),
          /* @__PURE__ */ jsx("div", { className: "max-h-32 overflow-y-auto space-y-1 text-sm", children: selectedCluster.satellites.map((satellite) => {
            const satelliteEvents = selectedCluster.events.filter((e) => e.satellite_name === satellite);
            return /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b pb-1", children: [
              /* @__PURE__ */ jsx("span", { children: satellite }),
              /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
                satelliteEvents.length,
                " events"
              ] })
            ] }, satellite);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Recent Events" }),
        /* @__PURE__ */ jsx("div", { className: "max-h-48 overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: selectedCluster.events.sort((a, b) => new Date(b.planned_time) - new Date(a.planned_time)).slice(0, 10).map((event) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-2 bg-gray-50 rounded text-sm",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-3 h-3 rounded",
                    style: { backgroundColor: {
                      health: "#10B981",
                      payload: "#3B82F6",
                      AOCS: "#F59E0B",
                      communication: "#8B5CF6",
                      maintenance: "#EF4444",
                      access_window: "#6B7280"
                    }[event.event_type] || "#6B7280" }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium", children: event.activity_type }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: event.satellite_name })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
                new Date(event.planned_time).toLocaleDateString(),
                " ",
                new Date(event.planned_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              ] })
            ]
          },
          event.event_id || `${event.satellite_name}-${event.planned_time}`
        )) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-gray-50 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Activity Density Legend" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-6 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-red-500 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Very High (50+)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-orange-500 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "High (30-49)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-yellow-500 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Medium (15-29)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-blue-500 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Low (5-14)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-gray-300 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Minimal (0-4)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      EventTooltip,
      {
        event: hoveredEvent,
        isVisible: showTooltip,
        position: tooltipPosition
      }
    )
  ] });
}

export { ClusterGridView as default };
