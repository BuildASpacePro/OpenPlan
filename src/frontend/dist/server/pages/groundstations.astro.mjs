/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DyYsMblj.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import React, { useState, useMemo, useEffect } from 'react';
import { V as ViewToggle } from '../chunks/ViewToggle_BkXTcmtA.mjs';
export { renderers } from '../renderers.mjs';

function GroundStationsTable({ groundStations = [], onStationFocus }) {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const processedStations = useMemo(() => {
    return groundStations.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (sortField === "latitude" || sortField === "longitude" || sortField === "altitude") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
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
  }, [groundStations, sortField, sortDirection]);
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
  const formatCoordinate = (coord) => {
    if (coord === null || coord === void 0) return "-";
    return parseFloat(coord).toFixed(6);
  };
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" }) });
    }
    return sortDirection === "asc" ? /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-astro-blue", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-astro-blue", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" }) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark dark:text-white", children: "Ground Stations" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
        processedStations.length,
        " stations"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-600", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
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
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
              onClick: () => handleSort("latitude"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Latitude" }),
                getSortIcon("latitude")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
              onClick: () => handleSort("longitude"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Longitude" }),
                getSortIcon("longitude")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
              onClick: () => handleSort("altitude"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Altitude (m)" }),
                getSortIcon("altitude")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Coverage" }),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
              onClick: () => handleSort("created_at"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Created" }),
                getSortIcon("created_at")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600", children: processedStations.map((station) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full mr-3" }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "text-sm font-medium text-gray-900 dark:text-white hover:text-astro-blue cursor-pointer transition-colors",
                onClick: () => onStationFocus && onStationFocus(station),
                children: station.name
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono", children: [
            formatCoordinate(station.latitude),
            "°"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono", children: [
            formatCoordinate(station.longitude),
            "°"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white", children: station.altitude ? `${parseInt(station.altitude).toLocaleString()} m` : "-" }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-900 dark:text-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full mr-2" }),
              /* @__PURE__ */ jsx("span", { children: "Active" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "10° min elevation" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: formatDateTime(station.created_at) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-astro-blue hover:text-astro-light",
                onClick: () => console.log("View station:", station.gs_id),
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
                className: "text-green-600 hover:text-green-500",
                onClick: () => console.log("View access windows:", station.gs_id),
                title: "Access Windows",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-yellow-600 hover:text-yellow-500",
                onClick: () => console.log("Edit station:", station.gs_id),
                title: "Edit",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
              }
            )
          ] }) })
        ] }, station.gs_id)) })
      ] }) }),
      processedStations.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-gray-500", children: [
        /* @__PURE__ */ jsxs("svg", { className: "w-12 h-12 mx-auto mb-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "No ground stations found" })
      ] })
    ] })
  ] });
}
const GroundStationsTable$1 = React.memo(GroundStationsTable);

// Development configuration
const DEV_CONFIG = {
  USE_DEV_AUTH: false,
  DEV_JWT_TOKEN: ''
};

function GroundStationManager() {
  const [displayView, setDisplayView] = useState("cards");
  const [groundStations, setGroundStations] = useState([]);
  const [accessWindows, setAccessWindows] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [focusedStation, setFocusedStation] = useState(null);
  const [plannedContacts, setPlannedContacts] = useState([]);
  const [stationLoadingStates, setStationLoadingStates] = useState({});
  const [hoveredStation, setHoveredStation] = useState(null);
  const viewOptions = [
    { key: "cards", label: "Cards", icon: "grid" },
    { key: "table", label: "Table", icon: "table" }
  ];
  useEffect(() => {
    fetchGroundStations();
  }, []);
  const fetchGroundStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/groundstations");
      if (!response.ok) {
        throw new Error(`Failed to fetch ground stations: ${response.status}`);
      }
      const stations = await response.json();
      setGroundStations(stations);
      setLoading(false);
      const initialLoadingStates = {};
      stations.forEach((station) => {
        initialLoadingStates[station.gs_id] = true;
      });
      setStationLoadingStates(initialLoadingStates);
      if (stations.length > 0) {
        await fetchAccessWindowsBulk(stations);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching ground stations:", err);
      setLoading(false);
    }
  };
  const fetchAccessWindowsBulk = async (stations) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
      const stationIds = stations.map((station) => station.gs_id);
      const bulkResponse = await fetch("/api/accesswindows/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ground_station_ids: stationIds,
          start_time: now.toISOString(),
          end_time: endTime.toISOString()
        })
      });
      if (!bulkResponse.ok) {
        throw new Error(`Failed to fetch bulk access windows: ${bulkResponse.status}`);
      }
      const bulkData = await bulkResponse.json();
      const windowMap = {};
      Object.entries(bulkData.stations).forEach(([stationId, stationData]) => {
        windowMap[stationId] = stationData.access_windows || [];
      });
      setAccessWindows(windowMap);
      setStationLoadingStates({});
      console.log(`✅ Loaded access windows for ${bulkData.successful_stations}/${bulkData.total_stations} stations`);
    } catch (err) {
      console.warn("Failed to fetch bulk access windows:", err);
      await fetchAccessWindowsIndividual(stations);
    }
  };
  const fetchAccessWindowsIndividual = async (stations) => {
    try {
      console.log("🔄 Falling back to individual access window requests...");
      const now = /* @__PURE__ */ new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
      const batchSize = 3;
      const windowMap = {};
      for (let i = 0; i < stations.length; i += batchSize) {
        const batch = stations.slice(i, i + batchSize);
        const batchPromises = batch.map(async (station) => {
          try {
            const accessResponse = await fetch(
              `/api/accesswindows/groundstation/${station.gs_id}?start_time=${now.toISOString()}&end_time=${endTime.toISOString()}`
            );
            if (accessResponse.ok) {
              const accessData = await accessResponse.json();
              return { stationId: station.gs_id, windows: accessData.access_windows || [] };
            }
            return { stationId: station.gs_id, windows: [] };
          } catch (err) {
            console.warn(`Failed to fetch access windows for station ${station.gs_id}:`, err);
            return { stationId: station.gs_id, windows: [] };
          }
        });
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach((result) => {
          windowMap[result.stationId] = result.windows;
        });
        setAccessWindows((prevWindows) => ({ ...prevWindows, ...windowMap }));
        const completedStationIds = {};
        batchResults.forEach((result) => {
          completedStationIds[result.stationId] = false;
        });
        setStationLoadingStates((prevStates) => {
          const newStates = { ...prevStates };
          Object.keys(completedStationIds).forEach((stationId) => {
            delete newStates[stationId];
          });
          return newStates;
        });
        if (i + batchSize < stations.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch (err) {
      console.error("Error in individual access window requests:", err);
    }
  };
  const formatCoordinate = (coord) => {
    if (coord === null || coord === void 0) return "N/A";
    return `${parseFloat(coord).toFixed(4)}°`;
  };
  const getNextAccessWindow = (stationId) => {
    const windows = accessWindows[stationId] || [];
    if (windows.length === 0) return null;
    const now = /* @__PURE__ */ new Date();
    const upcomingWindows = windows.filter((window2) => new Date(window2.start_time) > now);
    if (upcomingWindows.length === 0) return null;
    return upcomingWindows.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];
  };
  const getStationConnectionStatus = (station) => {
    const windows = accessWindows[station.gs_id] || [];
    const now = /* @__PURE__ */ new Date();
    const isLoadingWindows = stationLoadingStates[station.gs_id] === true;
    const nextWindow = getNextAccessWindow(station.gs_id);
    const currentWindow = windows.find((window2) => {
      const start = new Date(window2.start_time);
      const end = new Date(window2.end_time);
      return now >= start && now <= end;
    });
    return {
      status: currentWindow ? "active" : nextWindow ? "standby" : "idle",
      currentWindow,
      nextWindow,
      totalWindows: windows.length,
      plannedWindows: windows.filter((w) => w.planned === true).length,
      upcomingWindows: windows.filter((w) => new Date(w.start_time) > now).length,
      isLoadingWindows,
      lastUpdate: (/* @__PURE__ */ new Date()).toLocaleString()
    };
  };
  const handleStationFocus = (station) => {
    setFocusedStation(station);
    fetchPlannedContacts(station.gs_id);
  };
  const handleBackToList = () => {
    setFocusedStation(null);
    setPlannedContacts([]);
  };
  const fetchPlannedContacts = async (stationId) => {
    const stationWindows = accessWindows[stationId] || [];
    const plannedWindows = stationWindows.filter((window2) => window2.planned === true);
    setPlannedContacts(plannedWindows);
  };
  const toggleAccessWindowPlanned = async (accessWindow, newPlannedStatus) => {
    try {
      console.log("Toggling access window planned status:", {
        satellite_id: accessWindow.satellite_id,
        location_id: focusedStation.gs_id,
        start_time: accessWindow.start_time,
        current_planned: accessWindow.planned,
        new_planned: newPlannedStatus
      });
      const headers = typeof window !== "undefined" && window.getAuthHeaders ? window.getAuthHeaders() : {
        "Content-Type": "application/json"
      };
      if (!headers.Authorization && DEV_CONFIG.USE_DEV_AUTH) ; else if (!headers.Authorization) {
        throw new Error("Authentication required. Please log in.");
      }
      console.log("Request headers:", headers);
      const requestBody = {
        satellite_id: accessWindow.satellite_id,
        location_id: focusedStation.gs_id,
        start_time: accessWindow.start_time,
        planned: newPlannedStatus
      };
      console.log("Request body:", requestBody);
      const response = await fetch("/api/accesswindows/planned", {
        method: "PUT",
        headers,
        body: JSON.stringify(requestBody)
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to update planned status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log("Response result:", result);
      console.log("Refreshing ground stations data...");
      await fetchGroundStations();
      if (focusedStation) {
        console.log("Updating planned contacts for station:", focusedStation.gs_id);
        fetchPlannedContacts(focusedStation.gs_id);
      }
      console.log("Toggle completed successfully");
    } catch (err) {
      console.error("Error updating planned status:", err);
    }
  };
  const renderCards = () => {
    if (loading) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-8 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-astro-gray dark:text-gray-300", children: "Loading ground station data..." })
      ] });
    }
    if (error) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-red-500 rounded-full mr-3" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-900", children: "Error Loading Ground Stations" }),
            /* @__PURE__ */ jsx("p", { className: "text-red-700 text-sm mt-1", children: error })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: fetchGroundStations,
            className: "mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm",
            children: "Retry"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark dark:text-white mb-4", children: "Active Ground Stations" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: groundStations.map((station) => {
          const nextWindow = getNextAccessWindow(station.gs_id);
          const windowCount = (accessWindows[station.gs_id] || []).length;
          const isLoadingWindows = stationLoadingStates[station.gs_id] === true;
          return /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx("div", { className: `w-4 h-4 rounded-full ${isLoadingWindows ? "bg-yellow-500 animate-pulse" : "bg-blue-500"}` }),
                /* @__PURE__ */ jsx(
                  "h3",
                  {
                    className: "font-medium text-gray-900 dark:text-white hover:text-astro-blue cursor-pointer transition-colors",
                    onClick: () => handleStationFocus(station),
                    children: station.name
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                "ID: ",
                station.gs_id
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Location:" }),
                " ",
                formatCoordinate(station.latitude),
                ", ",
                formatCoordinate(station.longitude)
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Altitude:" }),
                " ",
                station.altitude ? `${parseInt(station.altitude).toLocaleString()} m` : "N/A"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Access Windows (24h):" }),
                  " ",
                  isLoadingWindows ? "..." : windowCount
                ] }),
                isLoadingWindows && /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-astro-blue border-t-transparent rounded-full animate-spin" })
              ] }),
              nextWindow && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Next Access:" }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-green-600 mt-1", children: [
                  new Date(nextWindow.start_time).toLocaleString(),
                  /* @__PURE__ */ jsx("br", {}),
                  nextWindow.satellite_name,
                  " (",
                  nextWindow.duration_minutes,
                  "min)"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex space-x-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "text-xs bg-astro-blue text-white px-2 py-1 rounded hover:bg-astro-light",
                    onMouseEnter: () => setHoveredStation(station.gs_id),
                    onMouseLeave: () => setHoveredStation(null),
                    children: "View Details"
                  }
                ),
                hoveredStation === station.gs_id && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 min-w-64", children: (() => {
                  const status = getStationConnectionStatus(station);
                  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Connection Status" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                        /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${status.status === "active" ? "bg-green-400" : status.status === "standby" ? "bg-yellow-400" : "bg-gray-400"}` }),
                        /* @__PURE__ */ jsx("span", { className: "capitalize", children: status.status })
                      ] })
                    ] }),
                    status.currentWindow && /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "text-green-400 font-medium", children: "Active Pass:" }),
                      /* @__PURE__ */ jsx("div", { children: status.currentWindow.satellite_name }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        "Ends: ",
                        new Date(status.currentWindow.end_time).toLocaleTimeString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "Total Windows:" }),
                        /* @__PURE__ */ jsx("div", { className: "font-mono", children: status.totalWindows })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "Planned:" }),
                        /* @__PURE__ */ jsx("div", { className: "font-mono", children: status.plannedWindows })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "Upcoming:" }),
                        /* @__PURE__ */ jsx("div", { className: "font-mono", children: status.upcomingWindows })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "Loading:" }),
                        /* @__PURE__ */ jsx("div", { className: "font-mono", children: status.isLoadingWindows ? "Yes" : "No" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-gray-400 text-xs border-t border-gray-700 pt-2", children: [
                      "Last updated: ",
                      status.lastUpdate
                    ] })
                  ] });
                })() })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700",
                  onClick: () => handleStationFocus(station),
                  children: "Access Windows"
                }
              )
            ] })
          ] }, station.gs_id);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark dark:text-white mb-4", children: "Network Statistics" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-600", children: groundStations.length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700", children: "Total Stations" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-600", children: Object.values(accessWindows).reduce((sum, windows) => sum + windows.length, 0) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700", children: "Access Windows (24h)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-600", children: Object.values(accessWindows).filter((windows) => windows.length > 0).length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700", children: "Active Stations" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-purple-50 border border-purple-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-purple-600", children: groundStations.length > 0 ? (/* @__PURE__ */ new Date()).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700", children: "Last Update" })
          ] })
        ] })
      ] })
    ] });
  };
  const renderFocusedStationView = () => {
    if (!focusedStation) return null;
    const stationWindows = accessWindows[focusedStation.gs_id] || [];
    const now = /* @__PURE__ */ new Date();
    const upcomingWindows = stationWindows.filter(
      (window2) => new Date(window2.start_time) > now && window2.planned === false
    );
    const plannedWindows = stationWindows.filter(
      (window2) => new Date(window2.start_time) > now && window2.planned === true
    );
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleBackToList,
                className: "flex items-center space-x-2 text-astro-blue hover:text-astro-light transition-colors",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 19l-7-7 7-7" }) }),
                  /* @__PURE__ */ jsx("span", { children: "Back to Ground Stations" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "h-6 border-l border-gray-300" }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-astro-dark dark:text-white", children: focusedStation.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Active" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Location:" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-900 dark:text-white font-mono", children: [
              formatCoordinate(focusedStation.latitude),
              ", ",
              formatCoordinate(focusedStation.longitude)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Altitude:" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-900 dark:text-white", children: focusedStation.altitude ? `${parseInt(focusedStation.altitude).toLocaleString()} m` : "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Station ID:" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-900 dark:text-white", children: focusedStation.gs_id })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark dark:text-white mb-4", children: "Station Location" }),
        /* @__PURE__ */ jsx("div", { className: "bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400", children: [
          /* @__PURE__ */ jsxs("svg", { className: "w-12 h-12 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
          ] }),
          /* @__PURE__ */ jsx("p", { children: "Interactive Map View" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs", children: "Cesium map integration would be implemented here" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark dark:text-white", children: "Access Window Opportunities" }),
            /* @__PURE__ */ jsxs("span", { className: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full", children: [
              upcomingWindows.length,
              " upcoming"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: upcomingWindows.length > 0 ? upcomingWindows.map((window2, index) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: window2.satellite_name }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                window2.duration_minutes,
                "min"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Start: ",
                new Date(window2.start_time).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "End: ",
                new Date(window2.end_time).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Max Elevation: ",
                window2.max_elevation?.toFixed(1),
                "°"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex space-x-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded",
                  onClick: () => toggleAccessWindowPlanned(window2, true),
                  children: "Add to Planned"
                }
              ),
              /* @__PURE__ */ jsx("button", { className: "text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded", children: "Details" })
            ] })
          ] }, index)) : /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400 py-8", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsx("p", { children: "No upcoming access windows" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark dark:text-white", children: "Planned Contacts" }),
            /* @__PURE__ */ jsxs("span", { className: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full", children: [
              plannedWindows.length,
              " scheduled"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: plannedWindows.length > 0 ? plannedWindows.map((window2, index) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: window2.satellite_name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200", children: "Planned" }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  window2.duration_minutes,
                  "min"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Start: ",
                new Date(window2.start_time).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "End: ",
                new Date(window2.end_time).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Max Elevation: ",
                window2.max_elevation?.toFixed(1),
                "°"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex space-x-2", children: [
              /* @__PURE__ */ jsx("button", { className: "text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded", children: "Edit" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded",
                  onClick: () => toggleAccessWindowPlanned(window2, false),
                  children: "Remove"
                }
              )
            ] })
          ] }, index)) : /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400 py-8", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            /* @__PURE__ */ jsx("p", { children: "No contacts scheduled" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", children: "Plan contacts from the opportunities list" })
          ] }) })
        ] })
      ] })
    ] });
  };
  if (focusedStation) {
    return renderFocusedStationView();
  }
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
        onClick: fetchGroundStations,
        disabled: loading,
        className: "bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white",
        children: loading ? "Loading..." : "Refresh Data"
      }
    ) }),
    displayView === "cards" ? renderCards() : /* @__PURE__ */ jsx(
      GroundStationsTable$1,
      {
        groundStations,
        onStationFocus: handleStationFocus
      }
    )
  ] });
}

const $$Groundstations = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Ground Stations", "activePage": "groundstations" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header with Controls --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6"> <div class="flex justify-between items-center mb-4"> <h1 class="text-3xl font-bold text-astro-dark dark:text-white">Ground Station Management</h1> <div class="flex space-x-3"> <a href="/activities" class="bg-astro-blue hover:bg-astro-light hover:text-astro-dark px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white">
Add Ground Station
</a> </div> </div> <p class="text-astro-gray dark:text-gray-300">
Monitor and manage all ground stations in your network with upcoming satellite access windows.
</p> </div> <!-- Ground Station Manager Component --> ${renderComponent($$result2, "GroundStationManager", GroundStationManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/OpenPlan/src/frontend/src/components/GroundStationManager.jsx", "client:component-export": "default" })} </div> ` })}`;
}, "/home/user/OpenPlan/src/frontend/src/pages/groundstations.astro", void 0);

const $$file = "/home/user/OpenPlan/src/frontend/src/pages/groundstations.astro";
const $$url = "/groundstations";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Groundstations,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
