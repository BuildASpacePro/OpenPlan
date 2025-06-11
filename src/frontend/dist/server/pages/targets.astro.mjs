/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import React, { useState, useMemo, useEffect } from 'react';
import { V as ViewToggle } from '../chunks/ViewToggle_BkXTcmtA.mjs';
export { renderers } from '../renderers.mjs';

function TargetsTable({ targets = [] }) {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const processedTargets = useMemo(() => {
    let filtered = targets;
    if (filterType !== "all") {
      filtered = filtered.filter((target) => target.target_type === filterType);
    }
    if (filterPriority !== "all") {
      filtered = filtered.filter((target) => target.priority === filterPriority);
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((target) => target.status === filterStatus);
    }
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (sortField === "coordinate1" || sortField === "coordinate2") {
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
  }, [targets, sortField, sortDirection, filterType, filterPriority, filterStatus]);
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
  const getTypeColor = (type) => {
    const colors = {
      "celestial": "bg-purple-100 text-purple-800",
      "geographic": "bg-orange-100 text-orange-800",
      "objective": "bg-blue-100 text-blue-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };
  const getPriorityColor = (priority) => {
    const colors = {
      "high": "bg-red-100 text-red-800",
      "medium": "bg-yellow-100 text-yellow-800",
      "low": "bg-green-100 text-green-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };
  const getStatusColor = (status) => {
    const colors = {
      "active": "bg-green-100 text-green-800",
      "planned": "bg-blue-100 text-blue-800",
      "completed": "bg-gray-100 text-gray-800",
      "cancelled": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  const targetTypes = useMemo(() => {
    const types = new Set(targets.map((target) => target.target_type));
    return Array.from(types);
  }, [targets]);
  const priorities = useMemo(() => {
    const priorities2 = new Set(targets.map((target) => target.priority));
    return Array.from(priorities2);
  }, [targets]);
  const statuses = useMemo(() => {
    const statuses2 = new Set(targets.map((target) => target.status));
    return Array.from(statuses2);
  }, [targets]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "type-filter", className: "block text-sm font-medium text-gray-700 mb-1", children: "Type:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "type-filter",
              value: filterType,
              onChange: (e) => setFilterType(e.target.value),
              className: "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-astro-blue focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Types" }),
                targetTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: type.charAt(0).toUpperCase() + type.slice(1) }, type))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "priority-filter", className: "block text-sm font-medium text-gray-700 mb-1", children: "Priority:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "priority-filter",
              value: filterPriority,
              onChange: (e) => setFilterPriority(e.target.value),
              className: "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-astro-blue focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Priorities" }),
                priorities.map((priority) => /* @__PURE__ */ jsx("option", { value: priority, children: priority.charAt(0).toUpperCase() + priority.slice(1) }, priority))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "status-filter", className: "block text-sm font-medium text-gray-700 mb-1", children: "Status:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "status-filter",
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-astro-blue focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Statuses" }),
                statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
        "Showing ",
        processedTargets.length,
        " of ",
        targets.length,
        " targets"
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
              onClick: () => handleSort("target_type"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Type" }),
                getSortIcon("target_type")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("coordinate1"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Coordinate 1" }),
                getSortIcon("coordinate1")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("coordinate2"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Coordinate 2" }),
                getSortIcon("coordinate2")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("priority"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Priority" }),
                getSortIcon("priority")
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("status"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Status" }),
                getSortIcon("status")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }),
          /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
              onClick: () => handleSort("created_at"),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx("span", { children: "Created" }),
                getSortIcon("created_at")
              ] })
            }
          ),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: processedTargets.map((target) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: target.name }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(target.target_type)}`, children: target.target_type }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono", children: formatCoordinate(target.coordinate1) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono", children: formatCoordinate(target.coordinate2) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(target.priority)}`, children: target.priority }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(target.status)}`, children: target.status }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: /* @__PURE__ */ jsx("div", { className: "max-w-xs truncate", title: target.description, children: target.description || "-" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDateTime(target.created_at) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-astro-blue hover:text-astro-light",
                onClick: () => console.log("View target:", target.target_id),
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
                onClick: () => console.log("Edit target:", target.target_id),
                title: "Edit",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-red-600 hover:text-red-500",
                onClick: () => console.log("Delete target:", target.target_id),
                title: "Delete",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
              }
            )
          ] }) })
        ] }, target.target_id)) })
      ] }) }),
      processedTargets.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-gray-500", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" }) }),
        /* @__PURE__ */ jsx("p", { children: "No targets found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Try adjusting your filters" })
      ] })
    ] })
  ] });
}
const TargetsTable$1 = React.memo(TargetsTable);

function TargetManager() {
  const [displayView, setDisplayView] = useState("cards");
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewOptions = [
    { key: "cards", label: "Cards", icon: "grid" },
    { key: "table", label: "Table", icon: "table" }
  ];
  useEffect(() => {
    fetchTargets();
  }, []);
  const fetchTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/targets");
      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.status}`);
      }
      const data = await response.json();
      setTargets(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching targets:", err);
    } finally {
      setLoading(false);
    }
  };
  const getTypeIcon = (type) => {
    switch (type) {
      case "celestial":
        return /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) });
      case "geographic":
        return /* @__PURE__ */ jsxs("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
        ] });
      case "objective":
        return /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) });
      default:
        return /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" }) });
    }
  };
  const getTypeColor = (type) => {
    const colors = {
      "celestial": "bg-purple-500",
      "geographic": "bg-orange-500",
      "objective": "bg-blue-500"
    };
    return colors[type] || "bg-gray-500";
  };
  const getPriorityColor = (priority) => {
    const colors = {
      "high": "text-red-600",
      "medium": "text-yellow-600",
      "low": "text-green-600"
    };
    return colors[priority] || "text-gray-600";
  };
  const getStatusColor = (status) => {
    const colors = {
      "active": "text-green-600",
      "planned": "text-blue-600",
      "completed": "text-gray-600",
      "cancelled": "text-red-600"
    };
    return colors[status] || "text-gray-600";
  };
  const formatCoordinate = (coord) => {
    if (coord === null || coord === void 0) return "N/A";
    return `${parseFloat(coord).toFixed(4)}`;
  };
  const renderCards = () => {
    if (loading) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-4 border-astro-blue border-t-transparent rounded-full mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-astro-gray", children: "Loading targets data..." })
      ] });
    }
    if (error) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-red-500 rounded-full mr-3" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-900", children: "Error Loading Targets" }),
            /* @__PURE__ */ jsx("p", { className: "text-red-700 text-sm mt-1", children: error })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: fetchTargets,
            className: "mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm",
            children: "Retry"
          }
        )
      ] });
    }
    const targetsByType = targets.reduce((acc, target) => {
      if (!acc[target.target_type]) {
        acc[target.target_type] = [];
      }
      acc[target.target_type].push(target);
      return acc;
    }, {});
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center", children: getTypeIcon("celestial") }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-astro-dark", children: "Celestial Objects" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-purple-600", children: (targetsByType.celestial || []).length })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center", children: getTypeIcon("geographic") }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-astro-dark", children: "Geographic Locations" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-orange-600", children: (targetsByType.geographic || []).length })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center", children: getTypeIcon("objective") }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-astro-dark", children: "Mission Objectives" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-600", children: (targetsByType.objective || []).length })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark mb-4", children: "All Targets" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: targets.map((target) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx("div", { className: `w-8 h-8 ${getTypeColor(target.target_type)} rounded-lg flex items-center justify-center`, children: getTypeIcon(target.target_type) }),
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900", children: target.name })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
              "ID: ",
              target.target_id
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Type:" }),
              " ",
              target.target_type
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Coordinates:" }),
              " ",
              formatCoordinate(target.coordinate1),
              ", ",
              formatCoordinate(target.coordinate2)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Priority:" }),
                /* @__PURE__ */ jsx("span", { className: `ml-1 font-semibold ${getPriorityColor(target.priority)}`, children: target.priority })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Status:" }),
                /* @__PURE__ */ jsx("span", { className: `ml-1 font-semibold ${getStatusColor(target.status)}`, children: target.status })
              ] })
            ] }),
            target.description && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Description:" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-1 line-clamp-2", children: target.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex space-x-2", children: [
            /* @__PURE__ */ jsx("button", { className: "text-xs bg-astro-blue text-white px-2 py-1 rounded hover:bg-astro-light", children: "View Details" }),
            /* @__PURE__ */ jsx("button", { className: "text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200", children: "Edit" })
          ] })
        ] }, target.target_id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-astro-dark mb-4", children: "Target Statistics" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-600", children: targets.length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700", children: "Total Targets" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-600", children: targets.filter((t) => t.status === "active").length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700", children: "Active" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-600", children: targets.filter((t) => t.priority === "high").length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700", children: "High Priority" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-purple-50 border border-purple-200 rounded-lg text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-purple-600", children: targets.length > 0 ? new Date(Math.max(...targets.map((t) => new Date(t.created_at || 0)))).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700", children: "Latest Target" })
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
        onClick: fetchTargets,
        disabled: loading,
        className: "bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white",
        children: loading ? "Loading..." : "Refresh Data"
      }
    ) }),
    displayView === "cards" ? renderCards() : /* @__PURE__ */ jsx(TargetsTable$1, { targets })
  ] });
}

const $$Targets = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Targets", "activePage": "targets" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header with Controls --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex justify-between items-center mb-4"> <h1 class="text-3xl font-bold text-astro-dark">Target Management</h1> <div class="flex space-x-3"> <button id="addTarget" class="bg-astro-blue hover:bg-astro-light hover:text-astro-dark px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white">
Add Target
</button> </div> </div> <p class="text-astro-gray">
Define and manage observation targets, including celestial objects, geographical locations, and mission objectives.
</p> </div> <!-- Target Manager Component --> ${renderComponent($$result2, "TargetManager", TargetManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/TargetManager.jsx", "client:component-export": "default" })} </div> ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/targets.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/targets.astro";
const $$url = "/targets";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Targets,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
