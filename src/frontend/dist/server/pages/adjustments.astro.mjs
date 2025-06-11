/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
export { renderers } from '../renderers.mjs';

const $$Adjustments = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Adjustments", "activePage": "adjustments" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8"> <h1 class="text-3xl font-bold text-astro-dark mb-4">Mission Adjustments</h1> <p class="text-astro-gray mb-6">
Make real-time adjustments to mission parameters and configurations.
</p> <div class="space-y-6"> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div class="p-6 bg-yellow-50 border border-yellow-200 rounded-lg"> <h3 class="text-lg font-semibold text-yellow-800 mb-2">Pending Adjustments</h3> <p class="text-yellow-700">3 adjustments awaiting approval</p> </div> <div class="p-6 bg-green-50 border border-green-200 rounded-lg"> <h3 class="text-lg font-semibold text-green-800 mb-2">Applied Adjustments</h3> <p class="text-green-700">12 adjustments successfully applied</p> </div> </div> <div class="bg-gray-50 rounded-lg p-6"> <h2 class="text-xl font-semibold text-astro-dark mb-4">Recent Adjustments</h2> <div class="space-y-3"> <div class="flex justify-between items-center p-3 bg-white rounded border"> <span class="text-astro-dark">Orbital altitude increased by 50km</span> <span class="text-sm text-green-600 font-medium">Applied</span> </div> <div class="flex justify-between items-center p-3 bg-white rounded border"> <span class="text-astro-dark">Communication frequency adjusted</span> <span class="text-sm text-yellow-600 font-medium">Pending</span> </div> <div class="flex justify-between items-center p-3 bg-white rounded border"> <span class="text-astro-dark">Power consumption optimized</span> <span class="text-sm text-green-600 font-medium">Applied</span> </div> </div> </div> </div> </div> </div> ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/adjustments.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/adjustments.astro";
const $$url = "/adjustments";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Adjustments,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
