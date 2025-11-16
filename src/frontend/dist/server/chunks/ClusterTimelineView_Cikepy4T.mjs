import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import { E as EventTooltip } from './EventTooltip_BEB3JnE3.mjs';

function ClusterTimelineView({
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
  const timeViewOptions = [
    { label: "1 Hour", value: "hour" },
    { label: "1 Day", value: "day" },
    { label: "1 Week", value: "week" },
    { label: "1 Month", value: "month" }
  ];
  const getWindowMs = (view) => {
    switch (view) {
      case "hour":
        return 60 * 60 * 1e3;
      case "day":
        return 24 * 60 * 60 * 1e3;
      case "week":
        return 7 * 24 * 60 * 60 * 1e3;
      case "month":
        return 30 * 24 * 60 * 60 * 1e3;
      default:
        return 24 * 60 * 60 * 1e3;
    }
  };
  const { windowStart, windowEnd, windowMs, timeMarkers, totalRange, maxScrollOffset } = useMemo(() => {
    if (!events || events.length === 0) return { windowStart: 0, windowEnd: 0, windowMs: 0, timeMarkers: [], totalRange: 0, maxScrollOffset: 0 };
    const eventTimes = events.map((e) => new Date(e.planned_time).getTime()).filter((t) => !isNaN(t));
    if (eventTimes.length === 0) return { windowStart: 0, windowEnd: 0, windowMs: 0, timeMarkers: [], totalRange: 0, maxScrollOffset: 0 };
    const minTime = Math.min(...eventTimes);
    const maxTime = Math.max(...eventTimes);
    const totalRange2 = maxTime - minTime;
    const windowMs2 = getWindowMs(timeView);
    const windowStart2 = minTime + scrollOffset;
    const windowEnd2 = windowStart2 + windowMs2;
    const maxScrollOffset2 = Math.max(0, totalRange2 - windowMs2);
    const markers = [];
    const markerCount = 8;
    for (let i = 0; i <= markerCount; i++) {
      const timestamp = windowStart2 + i / markerCount * windowMs2;
      const position = i / markerCount * 100;
      markers.push({
        timestamp,
        position,
        timeLabel: formatTimeOnly(timestamp, timeView),
        dateLabel: formatDateOnly(timestamp, timeView)
      });
    }
    return { windowStart: windowStart2, windowEnd: windowEnd2, windowMs: windowMs2, timeMarkers: markers, totalRange: totalRange2, maxScrollOffset: maxScrollOffset2 };
  }, [events, timeView, scrollOffset]);
  const formatTimeOnly = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case "hour":
      case "day":
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      case "week":
      case "month":
        return date.toLocaleDateString([], { day: "numeric" });
      default:
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };
  const formatDateOnly = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case "hour":
      case "day":
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      case "week":
      case "month":
        return date.toLocaleDateString([], { month: "short", year: "2-digit" });
      default:
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };
  const formatTimeLabel = (timestamp, view) => {
    const date = new Date(timestamp);
    switch (view) {
      case "hour":
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      case "day":
        return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      case "week":
      case "month":
        return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
      default:
        return date.toLocaleString();
    }
  };
  const scrollStep = windowMs / 4;
  const scrollLeft = () => {
    onScrollOffsetChange(Math.max(scrollOffset - scrollStep, 0));
  };
  const scrollRight = () => {
    onScrollOffsetChange(Math.min(scrollOffset + scrollStep, maxScrollOffset));
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "bg-red-500";
      case "active":
        return "bg-green-500";
      case "nominal":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  const eventTypeColors = {
    health: "#10B981",
    payload: "#3B82F6",
    AOCS: "#F59E0B",
    communication: "#8B5CF6",
    maintenance: "#EF4444",
    access_window: "#6B7280"
  };
  if (!clusters || clusters.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-gray-500 border rounded-lg bg-gray-50", children: /* @__PURE__ */ jsx("p", { children: "No clusters available for timeline display." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onScrollOffsetChange(0),
            disabled: scrollOffset <= 0,
            className: "px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed",
            title: "Go to start",
            children: "⏮ Start"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: scrollLeft,
            disabled: scrollOffset <= 0,
            className: "px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed",
            children: "◀ Earlier"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: scrollRight,
            disabled: scrollOffset >= maxScrollOffset,
            className: "px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed",
            children: "Later ▶"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onScrollOffsetChange(maxScrollOffset),
            disabled: scrollOffset >= maxScrollOffset,
            className: "px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed",
            title: "Go to end",
            children: "End ⏭"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Time Range:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: timeView,
            onChange: (e) => {
              onTimeViewChange(e.target.value);
              onScrollOffsetChange(0);
            },
            className: "border rounded px-3 py-2 bg-white",
            children: timeViewOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 text-sm text-gray-600 text-center", children: [
      "Showing: ",
      formatTimeLabel(windowStart, timeView),
      " - ",
      formatTimeLabel(windowEnd, timeView)
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border rounded-lg bg-white shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-80 px-4 py-3 font-semibold border-r bg-gray-100", children: [
          "Cluster (",
          clusterType,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 relative h-16", children: [
          timeMarkers.map((marker, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 h-full border-l border-gray-200 text-xs text-gray-600",
              style: { left: `${marker.position}%` },
              children: /* @__PURE__ */ jsxs("div", { className: "p-1 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-blue-600", children: marker.timeLabel }),
                /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-[10px]", children: marker.dateLabel })
              ] })
            },
            index
          )),
          (() => {
            const now = (/* @__PURE__ */ new Date()).getTime();
            if (now >= windowStart && now <= windowEnd) {
              const currentTimePosition = (now - windowStart) / windowMs * 100;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "absolute top-0 bottom-0 w-0.5 bg-red-500 z-10",
                  style: { left: `${currentTimePosition}%` },
                  title: "Current Time",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full" }),
                    /* @__PURE__ */ jsx("div", { className: "absolute -top-6 -left-8 text-xs text-red-600 font-bold whitespace-nowrap", children: "NOW" })
                  ]
                }
              );
            }
            return null;
          })()
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "max-h-96 overflow-y-auto", children: clusters.map((cluster) => /* @__PURE__ */ jsxs("div", { className: "border-b-2 border-gray-300", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex bg-gray-100 hover:bg-gray-200 cursor-pointer ${expandedClusters.has(cluster.id) ? "border-l-4 border-blue-500" : ""}`,
            onClick: () => onToggleClusterExpansion(cluster.id),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "w-80 px-4 py-3 border-r flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${getStatusColor(cluster.status)}` }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-semibold", children: cluster.name }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-600", children: [
                      cluster.satellites.length,
                      " satellite",
                      cluster.satellites.length !== 1 ? "s" : "",
                      cluster.criticalEvents.length > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-red-600", children: [
                        cluster.criticalEvents.length,
                        " critical"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: expandedClusters.has(cluster.id) ? "▼" : "▶" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 relative h-16", children: [
                timeMarkers.map((marker, markerIndex) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute top-0 h-full border-l border-gray-200",
                    style: { left: `${marker.position}%` }
                  },
                  markerIndex
                )),
                Object.entries(cluster.eventCounts).map(([eventType, count]) => {
                  if (count === 0) return null;
                  const clusterEvents = cluster.events.filter(
                    (e) => e.event_type === eventType && new Date(e.planned_time).getTime() >= windowStart && new Date(e.planned_time).getTime() <= windowEnd
                  );
                  return clusterEvents.map((event, index) => {
                    const start = new Date(event.planned_time).getTime();
                    const left = (start - windowStart) / windowMs * 100;
                    const duration = event.duration || 30;
                    const width = Math.max(duration * 60 * 1e3 / windowMs * 100, 0.5);
                    return /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "absolute top-2 h-12 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border border-white opacity-80",
                        style: {
                          left: `${Math.max(0, Math.min(left, 100))}%`,
                          width: `${Math.min(width, 100 - left)}%`,
                          backgroundColor: eventTypeColors[event.event_type] || "#3B82F6",
                          minWidth: "2px"
                        },
                        onMouseEnter: (e) => {
                          setHoveredEvent(event);
                          setTooltipPosition({ x: e.clientX, y: e.clientY });
                          setShowTooltip(true);
                        },
                        onMouseLeave: () => {
                          setShowTooltip(false);
                          setHoveredEvent(null);
                        },
                        onMouseMove: (e) => {
                          if (showTooltip) {
                            setTooltipPosition({ x: e.clientX, y: e.clientY });
                          }
                        },
                        children: /* @__PURE__ */ jsx("span", { className: "truncate px-1 text-[10px]", children: event.satellite_name })
                      },
                      `${event.event_id}-${index}`
                    );
                  });
                }),
                (() => {
                  const now = (/* @__PURE__ */ new Date()).getTime();
                  if (now >= windowStart && now <= windowEnd) {
                    const currentTimePosition = (now - windowStart) / windowMs * 100;
                    return /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "absolute top-0 bottom-0 w-0.5 bg-red-500 z-10",
                        style: { left: `${currentTimePosition}%` }
                      }
                    );
                  }
                  return null;
                })()
              ] })
            ]
          }
        ),
        expandedClusters.has(cluster.id) && /* @__PURE__ */ jsx("div", { className: "bg-gray-50 border-l-4 border-blue-500", children: cluster.satellites.map((satellite) => {
          const satelliteEvents = cluster.events.filter((e) => e.satellite_name === satellite);
          return /* @__PURE__ */ jsxs("div", { className: "flex border-b hover:bg-gray-100", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-80 px-8 py-2 text-sm border-r", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: satellite }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
                satelliteEvents.length,
                " events"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 relative h-12", children: [
              timeMarkers.map((marker, markerIndex) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute top-0 h-full border-l border-gray-100",
                  style: { left: `${marker.position}%` }
                },
                markerIndex
              )),
              satelliteEvents.filter((event) => {
                const eventTime = new Date(event.planned_time).getTime();
                return eventTime >= windowStart && eventTime <= windowEnd;
              }).map((event) => {
                const start = new Date(event.planned_time).getTime();
                const left = (start - windowStart) / windowMs * 100;
                const duration = event.duration || 30;
                const width = Math.max(duration * 60 * 1e3 / windowMs * 100, 0.5);
                return /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute top-1 h-10 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200",
                    style: {
                      left: `${Math.max(0, Math.min(left, 100))}%`,
                      width: `${Math.min(width, 100 - left)}%`,
                      backgroundColor: eventTypeColors[event.event_type] || "#3B82F6",
                      minWidth: "2px"
                    },
                    onMouseEnter: (e) => {
                      setHoveredEvent(event);
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                      setShowTooltip(true);
                    },
                    onMouseLeave: () => {
                      setShowTooltip(false);
                      setHoveredEvent(null);
                    },
                    children: /* @__PURE__ */ jsx("span", { className: "truncate px-1 text-[10px]", children: event.activity_type })
                  },
                  event.event_id || `${event.satellite_name}-${event.planned_time}`
                );
              })
            ] })
          ] }, satellite);
        }) })
      ] }, cluster.id)) })
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

export { ClusterTimelineView as default };
