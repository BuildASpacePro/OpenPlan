import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';

function ViewToggle({ currentView = "default", onViewChange, views = [] }) {
  const [activeView, setActiveView] = useState(currentView);
  const handleViewChange = (view) => {
    setActiveView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };
  const defaultViews = [
    { key: "default", label: "Default", icon: "grid" },
    { key: "table", label: "Table", icon: "table" }
  ];
  const viewOptions = views.length > 0 ? views : defaultViews;
  const getIcon = (iconType) => {
    switch (iconType) {
      case "grid":
        return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" }) });
      case "table":
        return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" }) });
      case "timeline":
        return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) });
      case "list":
        return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6h16M4 10h16M4 14h16M4 18h16" }) });
      default:
        return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6h16M4 10h16M4 14h16M4 18h16" }) });
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex bg-gray-100 rounded-lg p-1", children: viewOptions.map((view) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => handleViewChange(view.key),
      className: `
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${activeView === view.key ? "bg-white text-astro-dark shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"}
          `,
      title: `Switch to ${view.label} view`,
      children: [
        getIcon(view.icon),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: view.label })
      ]
    },
    view.key
  )) });
}

export { ViewToggle as V };
