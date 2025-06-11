import { c as createComponent, a as createAstro, e as renderHead, f as renderSlot, b as addAttribute, r as renderTemplate } from './astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import 'clsx';

const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, activePage = "plan" } = Astro2.props;
  const navigationItems = [
    { name: "Plan", href: "/", id: "plan" },
    { name: "Timeline", href: "/timeline", id: "timeline" },
    { name: "Satellites", href: "/satellites", id: "satellites" },
    { name: "Ground Stations", href: "/groundstations", id: "groundstations" },
    { name: "Targets", href: "/targets", id: "targets" },
    { name: "Activities", href: "/activities", id: "activities" },
    { name: "Constraints", href: "/constraints", id: "constraints" },
    { name: "Adjustments", href: "/adjustments", id: "adjustments" },
    { name: "Documentation", href: "/documentation", id: "documentation" }
  ];
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="Mission Planner - Astro UX Design System"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="bg-gray-50 font-sans"> <div class="flex min-h-screen"> <!-- Sidebar Navigation --> <nav class="w-64 bg-astro-dark text-white shadow-lg"> <div class="p-6"> <h1 class="text-2xl font-bold text-astro-light mb-4">Mission Planner</h1> <!-- UTC Time Display --> <div class="mb-8 p-3 bg-gray-800 rounded-lg"> <div class="text-xs text-gray-400">Current UTC Time</div> <div id="utcTime" class="text-sm font-mono text-white"></div> </div> <!-- User Info and Auth Buttons --> <div class="mb-8"> <div id="userInfo" class="hidden mb-4 p-3 bg-gray-800 rounded-lg"> <div class="text-sm text-gray-300">Logged in as:</div> <div id="username" class="font-semibold text-white"></div> <div id="userRole" class="text-xs text-gray-400"></div> </div> <div id="adminButton" class="hidden mb-2"> <a href="/admin" class="w-full bg-astro-blue hover:bg-astro-light hover:text-astro-dark px-4 py-2 rounded-lg font-medium transition-colors duration-200 block text-center">
Admin Console
</a> </div> <div id="authButtons"> <a href="/login" id="loginButton" class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 block text-center mb-2">
Login
</a> <button id="logoutButton" class="hidden w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
Logout
</button> </div> </div> <!-- Navigation Menu --> <ul class="space-y-2"> ${navigationItems.map((item) => renderTemplate`<li> <a${addAttribute(item.href, "href")}${addAttribute(`block px-4 py-3 rounded-lg transition-colors duration-200 ${activePage === item.id ? "bg-astro-light text-astro-dark font-semibold" : "text-gray-300 hover:bg-astro-blue hover:text-white"}`, "class")}> ${item.name} </a> </li>`)} </ul> </div> </nav> <!-- Main Content Area --> <main class="flex-1 p-8"> <div class="max-w-6xl mx-auto"> ${renderSlot($$result, $$slots["default"])} </div> </main> </div>  </body> </html>`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
