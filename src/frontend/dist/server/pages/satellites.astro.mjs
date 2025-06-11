/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import React, { useState, useMemo, useEffect } from 'react';
import { V as ViewToggle } from '../chunks/ViewToggle_BkXTcmtA.mjs';
export { renderers } from '../renderers.mjs';

function SatellitesTable({ satellites = [] }) {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterMission, setFilterMission] = useState("all");
  const processedSatellites = useMemo(() => {
    let filtered = satellites;
    if (filterMission !== "all") {
      filtered = satellites.filter((satellite) => satellite.mission === filterMission);
    }
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (sortField === "mission_start_time" || sortField === "created_at" || sortField === "updated_at") {
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
  }, [satellites, sortField, sortDirection, filterMission]);
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
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" }) });
    }
    return sortDirection === "asc" ? /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-astro-blue", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-astro-blue", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" }) });
  };
  const missions = useMemo(() => {
    const missionSet = new Set(satellites.map((satellite) => satellite.mission));
    return Array.from(missionSet);
  }, [satellites]);
  const truncateTLE = (tle) => {
    if (!tle) return "-";
    return tle.length > 30 ? `${tle.substring(0, 30)}...` : tle;
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "mission-filter", className: "block text-sm font-medium text-gray-700 mb-1", children: "Filter by Mission:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "mission-filter",
            value: filterMission,
            onChange: (e) => setFilterMission(e.target.value),
            className: "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-astro-blue focus:border-transparent",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Missions" }),
              missions.map((mission) => /* @__PURE__ */ jsx("option", { value: mission, children: mission }, mission))
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
        "Showing ",
        processedSatellites.length,
        " of ",
        satellites.length,
        " satellites"
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
              onClick: () => handleSort("name"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Name" }),
                getSortIcon("name")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("mission"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Mission" }),
                getSortIcon("mission")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("mission_start_time"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Mission Start" }),
                getSortIcon("mission_start_time")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "TLE Line 1" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "TLE Line 2" }),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("updated_at"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Last Updated" }),
                getSortIcon("updated_at")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: processedSatellites.map((satellite) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-4 h-4 rounded-full mr-3",
                style: { backgroundColor: satellite.colour || "#6B7280" }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: satellite.name })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: satellite.mission }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatDateTime(satellite.mission_start_time) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-500 font-mono", children: /* @__PURE__ */ jsx("span", { title: satellite.tle_1, children: truncateTLE(satellite.tle_1) }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-500 font-mono", children: /* @__PURE__ */ jsx("span", { title: satellite.tle_2, children: truncateTLE(satellite.tle_2) }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDateTime(satellite.updated_at) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-astro-blue hover:text-astro-light",
                onClick: () => console.log("View satellite:", satellite.satellite_id),
                title: "View Details",
                children: /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-yellow-600 hover:text-yellow-500",
                onClick: () => console.log("Edit satellite:", satellite.satellite_id),
                title: "Edit",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
              }
            )
          ] }) })
        ] }, satellite.satellite_id)) })
      ] }) }),
      processedSatellites.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-gray-500", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
        /* @__PURE__ */ jsx("p", { children: "No satellites found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Try adjusting your filters" })
      ] })
    ] })
  ] });
}
const SatellitesTable$1 = React.memo(SatellitesTable);

function SatelliteManager() {
  const [displayView, setDisplayView] = useState("cards");
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewOptions = [
    { key: "cards", label: "Cards", icon: "grid" },
    { key: "table", label: "Table", icon: "table" }
  ];
  useEffect(() => {
    fetchSatellites();
  }, []);
  const fetchSatellites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/satellites");
      if (!response.ok) {
        throw new Error(`Failed to fetch satellites: ${response.status}`);
      }
      const data = await response.json();
      setSatellites(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching satellites:", err);
    } finally {
      setLoading(false);
    }
  };
  const getColorForSatellite = (satellite) => {
    if (satellite.colour) return satellite.colour;
    const colorMap = {
      "red": "#EF4444",
      "blue": "#3B82F6",
      "green": "#10B981",
      "yellow": "#F59E0B",
      "orange": "#F97316",
      "purple": "#8B5CF6",
      "grey": "#6B7280",
      "gray": "#6B7280",
      "black": "#1F2937",
      "white": "#F9FAFB",
      "cyan": "#06B6D4",
      "magenta": "#EC4899"
    };
    return colorMap[satellite.colour] || "#6B7280";
  };
  const renderCards = () => {
    if (loading) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-astro-gray", children: "Loading satellite data..." })
      ] });
    }
    if (error) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-red-500 rounded-full mr-3" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-900", children: "Error Loading Satellites" }),
            /* @__PURE__ */ jsx("p", { className: "text-red-700 text-sm mt-1", children: error })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: fetchSatellites,
            className: "mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm",
            children: "Retry"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark mb-4", children: "Active Satellites" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: satellites.map((satellite) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-4 h-4 rounded-full",
                  style: { backgroundColor: getColorForSatellite(satellite) }
                }
              ),
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900", children: satellite.name })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
              "ID: ",
              satellite.satellite_id
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Mission:" }),
              " ",
              satellite.mission
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Start:" }),
              " ",
              satellite.mission_start_time ? new Date(satellite.mission_start_time).toLocaleDateString() : "N/A"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Updated:" }),
              " ",
              satellite.updated_at ? new Date(satellite.updated_at).toLocaleDateString() : "N/A"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex space-x-2", children: [
            /* @__PURE__ */ jsx("button", { className: "text-xs bg-astro-blue text-white px-2 py-1 rounded hover:bg-astro-light", children: "View Details" }),
            /* @__PURE__ */ jsx("button", { className: "text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200", children: "Edit" })
          ] })
        ] }, satellite.satellite_id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark mb-4", children: "Fleet Statistics" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-600", children: satellites.length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700", children: "Total Satellites" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-600", children: satellites.filter((s) => s.tle_1 && s.tle_2).length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700", children: "With TLE Data" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-600", children: new Set(satellites.map((s) => s.mission)).size }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700", children: "Active Missions" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-purple-50 border border-purple-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-purple-600", children: satellites.length > 0 ? new Date(Math.max(...satellites.map((s) => new Date(s.updated_at || 0)))).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700", children: "Last Update" })
          ] })
        ] })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
      ViewToggle,
      {
        currentView: displayView,
        onViewChange: setDisplayView,
        views: viewOptions
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: fetchSatellites,
        disabled: loading,
        className: "bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white",
        children: loading ? "Loading..." : "Refresh Data"
      }
    ) }),
    displayView === "cards" ? renderCards() : /* @__PURE__ */ jsx(SatellitesTable$1, { satellites })
  ] });
}

const $$Satellites = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Satellites", "activePage": "satellites" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header with Controls --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex justify-between items-center mb-4"> <h1 class="text-3xl font-bold text-astro-dark">Satellite Management</h1> <div class="flex space-x-3"> <a href="/activities" class="bg-astro-blue hover:bg-astro-light hover:text-astro-dark px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white">
Add Satellite
</a> </div> </div> <p class="text-astro-gray">
Monitor and manage all satellites in your mission fleet with real-time data from TLE orbital calculations.
</p> </div> <!-- Satellite Manager Component --> ${renderComponent($$result2, "SatelliteManager", SatelliteManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/SatelliteManager.jsx", "client:component-export": "default" })} </div> ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/satellites.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/satellites.astro";
const $$url = "/satellites";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Satellites,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
