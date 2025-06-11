import { jsxs, jsx } from 'react/jsx-runtime';
import React, { useState, useMemo } from 'react';

function TimelineTable({ events = [] }) {
  const [sortField, setSortField] = useState("planned_time");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterType, setFilterType] = useState("all");
  const processedEvents = useMemo(() => {
    let filtered = events;
    if (filterType !== "all") {
      filtered = events.filter((event) => event.event_type === filterType);
    }
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (sortField === "planned_time" || sortField === "end_time") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [events, sortField, sortDirection, filterType]);
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };
  const formatDuration = (duration) => {
    if (!duration) return "-";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  const getEventTypeColor = (eventType) => {
    const colors = {
      "health": "bg-green-100 text-green-800",
      "payload": "bg-blue-100 text-blue-800",
      "AOCS": "bg-purple-100 text-purple-800",
      "communication": "bg-yellow-100 text-yellow-800",
      "maintenance": "bg-red-100 text-red-800",
      "access_window": "bg-gray-100 text-gray-800"
    };
    return colors[eventType] || "bg-gray-100 text-gray-800";
  };
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" }) });
    }
    return sortDirection === "asc" ? /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-astro-blue", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-astro-blue", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" }) });
  };
  const eventTypes = useMemo(() => {
    const types = new Set(events.map((event) => event.event_type));
    return Array.from(types);
  }, [events]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "event-type-filter", className: "block text-sm font-medium text-gray-700 mb-1", children: "Filter by Type:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "event-type-filter",
            value: filterType,
            onChange: (e) => setFilterType(e.target.value),
            className: "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-astro-blue focus:border-transparent",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Types" }),
              eventTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: type.charAt(0).toUpperCase() + type.slice(1) }, type))
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
        "Showing ",
        processedEvents.length,
        " of ",
        events.length,
        " events"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("satellite_name"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Satellite" }),
                getSortIcon("satellite_name")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("event_type"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Type" }),
                getSortIcon("event_type")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("activity_type"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Activity" }),
                getSortIcon("activity_type")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("planned_time"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Start Time" }),
                getSortIcon("planned_time")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("end_time"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "End Time" }),
                getSortIcon("end_time")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("duration"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Duration" }),
                getSortIcon("duration")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Mission" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: processedEvents.map((event, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-3 h-3 rounded-full mr-3",
                style: { backgroundColor: event.colour || "#6B7280" }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: event.satellite_name })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_type)}`, children: event.event_type }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900", children: event.activity_type }),
            event.ground_station_name && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
              "→ ",
              event.ground_station_name
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatDateTime(event.planned_time) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatDateTime(event.end_time) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatDuration(event.duration) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: event.mission })
        ] }, event.event_id || index)) })
      ] }) }),
      processedEvents.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-gray-500", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }),
        /* @__PURE__ */ jsx("p", { children: "No events found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Try adjusting your filters" })
      ] })
    ] })
  ] });
}
const TimelineTable$1 = React.memo(TimelineTable);

export { TimelineTable$1 as default };
