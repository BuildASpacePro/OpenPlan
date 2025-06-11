import { jsx, jsxs } from 'react/jsx-runtime';
import React, { useState } from 'react';

function GanttChart({ events, satellites, timeView, onTimeViewChange }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const timeViewOptions = [
    { label: "1 Hour", value: "hour" },
    { label: "1 Day", value: "day" },
    { label: "1 Week", value: "week" },
    { label: "1 Month", value: "month" }
  ];
  const eventTypes = ["health", "payload", "AOCS", "communication", "maintenance", "access_window"];
  const eventTypeColors = {
    health: "#10B981",
    // Green
    payload: "#3B82F6",
    // Blue
    AOCS: "#F59E0B",
    // Amber
    communication: "#8B5CF6",
    // Purple
    maintenance: "#EF4444",
    // Red
    access_window: "#6B7280"
    // Gray
  };
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
  if (!events || events.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-gray-500 border rounded-lg bg-gray-50", children: /* @__PURE__ */ jsx("p", { children: "No timeline events available." }) });
  }
  const eventTimes = events.map((e) => new Date(e.planned_time).getTime()).filter((t) => !isNaN(t));
  if (eventTimes.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-gray-500 border rounded-lg bg-gray-50", children: /* @__PURE__ */ jsx("p", { children: "No valid timeline events found." }) });
  }
  const minTime = Math.min(...eventTimes);
  const maxTime = Math.max(...eventTimes);
  const totalRange = maxTime - minTime;
  const windowMs = getWindowMs(timeView);
  const windowStart = minTime + scrollOffset;
  const windowEnd = windowStart + windowMs;
  const maxScrollOffset = Math.max(0, totalRange - windowMs);
  const scrollStep = windowMs / 4;
  const scrollLeft = () => {
    setScrollOffset(Math.max(scrollOffset - scrollStep, 0));
  };
  const scrollRight = () => {
    setScrollOffset(Math.min(scrollOffset + scrollStep, maxScrollOffset));
  };
  const generateTimeMarkers = () => {
    const markers = [];
    const markerCount = 8;
    for (let i = 0; i <= markerCount; i++) {
      const timestamp = windowStart + i / markerCount * windowMs;
      const position = i / markerCount * 100;
      markers.push({
        timestamp,
        position,
        label: formatTimeLabel(timestamp, timeView)
      });
    }
    return markers;
  };
  const timeMarkers = generateTimeMarkers();
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
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
              setScrollOffset(0);
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
    /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-4 text-sm", children: eventTypes.map((type) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-4 h-4 rounded",
          style: { backgroundColor: eventTypeColors[type] }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "font-medium capitalize", children: type.replace("_", " ") })
    ] }, type)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "border rounded-lg bg-white shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("div", { className: "w-64 px-4 py-3 font-semibold border-r bg-gray-100", children: "Satellite / Event Type" }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 relative h-12", children: timeMarkers.map((marker, index) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute top-0 h-full border-l border-gray-200 text-xs text-gray-600",
            style: { left: `${marker.position}%` },
            children: /* @__PURE__ */ jsx("div", { className: "p-1 transform -rotate-45 origin-top-left whitespace-nowrap", children: marker.label })
          },
          index
        )) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "max-h-96 overflow-y-auto", children: satellites.map((satellite, satelliteIndex) => {
        const satelliteEvents = events.filter((e) => e.satellite_name === satellite);
        const satelliteEventTypes = eventTypes.filter(
          (type) => satelliteEvents.some((e) => e.event_type === type)
        );
        return /* @__PURE__ */ jsxs("div", { className: "border-b-2 border-gray-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex bg-gray-100 font-semibold", children: [
            /* @__PURE__ */ jsx("div", { className: "w-64 px-4 py-2 border-r bg-gray-200", children: satellite }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 relative h-8", children: timeMarkers.map((marker, markerIndex) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute top-0 h-full border-l border-gray-200",
                style: { left: `${marker.position}%` }
              },
              markerIndex
            )) })
          ] }),
          satelliteEventTypes.map((eventType, typeIndex) => {
            const typeEvents = satelliteEvents.filter(
              (e) => e.event_type === eventType && new Date(e.planned_time).getTime() >= windowStart && new Date(e.planned_time).getTime() <= windowEnd
            );
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `flex border-b hover:bg-gray-50 ${typeIndex % 2 === 0 ? "bg-white" : "bg-gray-25"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "w-64 px-6 py-3 text-sm border-r flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-3 h-3 rounded",
                        style: { backgroundColor: eventTypeColors[eventType] }
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "capitalize", children: eventType.replace("_", " ") })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 relative h-12 min-w-0", children: [
                    timeMarkers.map((marker, markerIndex) => /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "absolute top-0 h-full border-l border-gray-100",
                        style: { left: `${marker.position}%` }
                      },
                      markerIndex
                    )),
                    typeEvents.map((event) => {
                      const start = new Date(event.planned_time).getTime();
                      const left = (start - windowStart) / windowMs * 100;
                      const duration = event.duration || 30;
                      const width = Math.max(duration * 60 * 1e3 / windowMs * 100, 1);
                      return /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "absolute top-1 h-10 rounded text-xs text-white flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-white",
                          style: {
                            left: `${Math.max(0, Math.min(left, 100))}%`,
                            width: `${Math.min(width, 100 - left)}%`,
                            backgroundColor: eventTypeColors[event.event_type] || "#3B82F6",
                            minWidth: "2px"
                          },
                          title: `${event.activity_type || "Event"} (${duration} min)
Type: ${event.event_type}
Time: ${formatTimeLabel(new Date(event.planned_time).getTime(), "day")}
Satellite: ${event.satellite_name}`,
                          children: /* @__PURE__ */ jsx("span", { className: "truncate px-1 font-medium", children: event.activity_type || "Event" })
                        },
                        event.event_id || `${event.satellite_name}-${event.planned_time}`
                      );
                    }),
                    typeEvents.length === 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-gray-400 text-xs", children: "No events in this time range" })
                  ] })
                ]
              },
              `${satellite}-${eventType}`
            );
          }),
          satelliteEventTypes.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("div", { className: "w-64 px-6 py-4 text-sm text-gray-500 border-r", children: "No events" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 relative h-12 flex items-center justify-center text-gray-400 text-sm", children: "No events for this satellite" })
          ] })
        ] }, satellite);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 text-sm text-gray-600", children: [
      /* @__PURE__ */ jsx("p", { children: "• Each satellite is divided into rows by event type" }),
      /* @__PURE__ */ jsx("p", { children: "• Scroll through time using the navigation buttons" }),
      /* @__PURE__ */ jsx("p", { children: "• Change time range to zoom in/out of the timeline" }),
      /* @__PURE__ */ jsx("p", { children: "• Hover over events for detailed information" })
    ] })
  ] });
}
const GanttChart$1 = React.memo(GanttChart);

export { GanttChart$1 as default };
