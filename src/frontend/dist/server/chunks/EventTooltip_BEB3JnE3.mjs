import { jsxs, jsx } from 'react/jsx-runtime';
import 'react';

function EventTooltip({ event, isVisible, position }) {
  if (!isVisible || !event) return null;
  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const getEventTypeIcon = (eventType) => {
    const icons = {
      health: "🩺",
      payload: "📡",
      AOCS: "🛰️",
      communication: "📶",
      maintenance: "🔧",
      access_window: "🌍"
    };
    return icons[eventType] || "📅";
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-64 max-w-80",
      style: {
        left: Math.min(position.x + 10, window.innerWidth - 320),
        top: Math.max(position.y - 10, 10),
        pointerEvents: "none"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: getEventTypeIcon(event.event_type) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 text-sm leading-tight", children: event.activity_type || "Event" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: event.satellite_name })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Type:" }),
              /* @__PURE__ */ jsx("div", { className: "text-gray-900 capitalize", children: event.event_type ? event.event_type.replace("_", " ") : "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Duration:" }),
              /* @__PURE__ */ jsx("div", { className: "text-gray-900", children: formatDuration(event.duration) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Start:" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-900", children: formatDateTime(event.planned_time) })
          ] }),
          event.end_time && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "End:" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-900", children: formatDateTime(event.end_time) })
          ] }),
          event.ground_station_name && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Ground Station:" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-900", children: event.ground_station_name })
          ] }),
          event.mission && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Mission:" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-900", children: event.mission })
          ] }),
          event.satellite_id && /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-gray-200", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Satellite ID:" }),
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-gray-900", children: event.satellite_id })
          ] })
        ] })
      ]
    }
  );
}

export { EventTooltip as E };
