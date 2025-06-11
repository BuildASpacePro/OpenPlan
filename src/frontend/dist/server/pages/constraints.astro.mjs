/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
export { renderers } from '../renderers.mjs';

const $$Constraints = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Constraints", "activePage": "constraints" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8"> <h1 class="text-3xl font-bold text-astro-dark mb-4">Mission Constraints</h1> <p class="text-astro-gray mb-6">
Define and manage constraints that affect mission planning and execution.
</p> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"> <div class="space-y-6"> <h2 class="text-xl font-semibold text-astro-dark">Time Constraints</h2> <div class="space-y-4"> <div class="p-4 bg-gray-50 rounded-lg"> <h3 class="font-medium text-astro-dark">Launch Window</h3> <p class="text-sm text-astro-gray">March 15 - March 22, 2024</p> </div> <div class="p-4 bg-gray-50 rounded-lg"> <h3 class="font-medium text-astro-dark">Mission Duration</h3> <p class="text-sm text-astro-gray">Maximum 180 days</p> </div> </div> </div> <div class="space-y-6"> <h2 class="text-xl font-semibold text-astro-dark">Resource Constraints</h2> <div class="space-y-4"> <div class="p-4 bg-gray-50 rounded-lg"> <h3 class="font-medium text-astro-dark">Fuel Capacity</h3> <p class="text-sm text-astro-gray">5,000 kg maximum</p> </div> <div class="p-4 bg-gray-50 rounded-lg"> <h3 class="font-medium text-astro-dark">Payload Weight</h3> <p class="text-sm text-astro-gray">2,500 kg maximum</p> </div> </div> </div> </div> </div> </div> ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/constraints.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/constraints.astro";
const $$url = "/constraints";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Constraints,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
