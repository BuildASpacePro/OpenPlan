/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Global Map", "activePage": "plan" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header with Map Controls --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex justify-between items-center mb-4"> <h1 class="text-3xl font-bold text-astro-dark">Global Mission Overview</h1> <div class="flex space-x-3"> <button id="toggle2D3D" class="bg-astro-blue hover:bg-astro-light hover:text-astro-dark px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white">
Switch to 3D View
</button> <button id="refreshLocations" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white">
Refresh Positions
</button> </div> </div> <p class="text-astro-gray">
Real-time positions of all satellites and ground stations. Satellites update based on TLE orbital data.
</p> </div> <!-- Map Container --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"> <div id="mapContainer" class="w-full h-96 rounded-lg border border-gray-300"></div> </div> <!-- Stats and Legend --> <div class="grid grid-cols-1 md:grid-cols-3 gap-6"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex items-center"> <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center"> <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path> </svg> </div> <div class="ml-4"> <h3 class="text-lg font-semibold text-astro-dark">Satellites Tracked</h3> <p id="satelliteCount" class="text-2xl font-bold text-green-600">-</p> </div> </div> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex items-center"> <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"> <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> </svg> </div> <div class="ml-4"> <h3 class="text-lg font-semibold text-astro-dark">Ground Stations</h3> <p id="groundStationCount" class="text-2xl font-bold text-blue-600">-</p> </div> </div> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex items-center"> <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center"> <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <div class="ml-4"> <h3 class="text-lg font-semibold text-astro-dark">Last Update</h3> <p id="lastUpdate" class="text-lg font-bold text-yellow-600">-</p> </div> </div> </div> </div> <!-- Legend --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-lg font-semibold text-astro-dark mb-4">Map Legend</h3> <div class="grid grid-cols-2 md:grid-cols-3 gap-4"> <div class="flex items-center"> <div class="w-4 h-4 bg-blue-500 rounded-full mr-2"></div> <span class="text-sm text-gray-700">Ground Stations</span> </div> <div class="flex items-center"> <div class="w-4 h-4 bg-red-500 rounded-full mr-2"></div> <span class="text-sm text-gray-700">Red Satellites</span> </div> <div class="flex items-center"> <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div> <span class="text-sm text-gray-700">Green Satellites</span> </div> <div class="flex items-center"> <div class="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div> <span class="text-sm text-gray-700">Yellow Satellites</span> </div> <div class="flex items-center"> <div class="w-4 h-1 bg-gray-400 mr-2" style="border: 1px dashed #6b7280;"></div> <span class="text-sm text-gray-700">3-hour Trajectories</span> </div> <div class="flex items-center"> <div class="w-4 h-4 bg-gray-200 rounded-full mr-2 border-2 border-white"></div> <span class="text-sm text-gray-700">Current Position</span> </div> </div> </div> </div>  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">   ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/index.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
