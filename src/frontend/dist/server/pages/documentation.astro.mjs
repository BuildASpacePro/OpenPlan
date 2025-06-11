/* empty css                                      */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BT9JfI3G.mjs';
export { renderers } from '../renderers.mjs';

const $$Documentation = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mission Planner - Documentation", "activePage": "documentation" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8"> <h1 class="text-3xl font-bold text-astro-dark mb-4">Mission Documentation</h1> <p class="text-astro-gray mb-6">
Access comprehensive documentation, guides, and resources for mission planning and execution.
</p> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"> <!-- Quick Access --> <div class="space-y-6"> <h2 class="text-xl font-semibold text-astro-dark">Quick Access</h2> <div class="space-y-4"> <a href="#" class="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"> <h3 class="font-semibold text-astro-dark">Mission Planning Guide</h3> <p class="text-sm text-astro-gray">Comprehensive guide for planning space missions</p> </a> <a href="#" class="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"> <h3 class="font-semibold text-astro-dark">Satellite Operations Manual</h3> <p class="text-sm text-astro-gray">Operating procedures for satellite management</p> </a> <a href="#" class="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"> <h3 class="font-semibold text-astro-dark">Emergency Protocols</h3> <p class="text-sm text-astro-gray">Emergency response procedures and protocols</p> </a> <a href="#" class="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"> <h3 class="font-semibold text-astro-dark">Technical Specifications</h3> <p class="text-sm text-astro-gray">Detailed technical documentation</p> </a> </div> </div> <!-- Document Categories --> <div class="space-y-6"> <h2 class="text-xl font-semibold text-astro-dark">Document Categories</h2> <div class="space-y-4"> <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg"> <h3 class="font-semibold text-blue-900 mb-2">Planning Documents</h3> <ul class="text-sm text-blue-700 space-y-1"> <li>• Mission Requirements</li> <li>• Risk Assessment</li> <li>• Resource Allocation</li> <li>• Timeline Planning</li> </ul> </div> <div class="p-4 bg-green-50 border border-green-200 rounded-lg"> <h3 class="font-semibold text-green-900 mb-2">Operational Guides</h3> <ul class="text-sm text-green-700 space-y-1"> <li>• Launch Procedures</li> <li>• System Operations</li> <li>• Maintenance Schedules</li> <li>• Troubleshooting</li> </ul> </div> <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"> <h3 class="font-semibold text-yellow-900 mb-2">Reference Materials</h3> <ul class="text-sm text-yellow-700 space-y-1"> <li>• Technical Specifications</li> <li>• API Documentation</li> <li>• Configuration Files</li> <li>• Best Practices</li> </ul> </div> </div> </div> </div> <!-- Recent Updates --> <div class="mt-8 pt-8 border-t border-gray-200"> <h2 class="text-xl font-semibold text-astro-dark mb-4">Recent Updates</h2> <div class="space-y-3"> <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"> <div> <p class="font-medium text-astro-dark">Mission Planning Guide v2.1</p> <p class="text-sm text-astro-gray">Updated launch window calculations</p> </div> <span class="text-sm text-astro-gray">2 days ago</span> </div> <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"> <div> <p class="font-medium text-astro-dark">Emergency Protocols v1.3</p> <p class="text-sm text-astro-gray">Added new communication failure procedures</p> </div> <span class="text-sm text-astro-gray">1 week ago</span> </div> <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"> <div> <p class="font-medium text-astro-dark">Technical Specifications</p> <p class="text-sm text-astro-gray">Updated satellite power requirements</p> </div> <span class="text-sm text-astro-gray">2 weeks ago</span> </div> </div> </div> </div> </div> ` })}`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/documentation.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/documentation.astro";
const $$url = "/documentation";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Documentation,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
