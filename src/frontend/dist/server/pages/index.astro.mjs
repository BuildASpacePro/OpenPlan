/* empty css                                      */
import { c as createComponent, e as renderHead, d as renderComponent, r as renderTemplate } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>Constellation Control - Bloomberg Terminal</title>${renderHead()}</head> <body data-astro-cid-j7pv25f6> ${renderComponent($$result, "BloombergDashboard", null, { "client:only": "react", "client:component-hydration": "only", "data-astro-cid-j7pv25f6": true, "client:component-path": "/home/user/OpenPlan/src/frontend/src/components/BloombergDashboard.jsx", "client:component-export": "default" })}  </body> </html>`;
}, "/home/user/OpenPlan/src/frontend/src/pages/index.astro", void 0);

const $$file = "/home/user/OpenPlan/src/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
