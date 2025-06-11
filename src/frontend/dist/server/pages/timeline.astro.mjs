/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { lazy, useState, useEffect, Suspense } from 'react';
import { V as ViewToggle } from '../chunks/ViewToggle_BkXTcmtA.mjs';
export { renderers } from '../renderers.mjs';

const GanttChart = lazy(() => import('../chunks/GanttChart_0MkUIe-u.mjs'));
const TimelineTable = lazy(() => import('../chunks/TimelineTable_CMXsN6qz.mjs'));
function TimelineContainer({ events = [], satellites = [] }) {
  const [timeView, setTimeView] = useState("day");
  const [displayView, setDisplayView] = useState("timeline");
  useEffect(() => {
    console.log("React loaded");
  }, []);
  const viewOptions = [
    { key: "timeline", label: "Timeline", icon: "timeline" },
    { key: "table", label: "Table", icon: "table" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "w-full space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
      ViewToggle,
      {
        currentView: displayView,
        onViewChange: setDisplayView,
        views: viewOptions
      }
    ) }),
    displayView === "timeline" ? /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-gray-200 h-64 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Loading timeline..." }) }), children: /* @__PURE__ */ jsx(
      GanttChart,
      {
        events,
        satellites,
        timeView,
        onTimeViewChange: setTimeView
      }
    ) }) : /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-gray-200 h-64 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Loading table..." }) }), children: /* @__PURE__ */ jsx(
      TimelineTable,
      {
        events
      }
    ) })
  ] });
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
</p> <div class="mb-4"> ${renderComponent($$result2, "TimelineContainer", TimelineContainer, { "client:load": true, "events": timeline, "satellites": satellites, "client:component-hydration": "load", "client:component-path": "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/TimelineContainer.jsx", "client:component-export": "default" })} </div> </div> </div> ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/timeline.astro", void 0);
const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/timeline.astro";
const $$url = "/timeline";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Timeline,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
