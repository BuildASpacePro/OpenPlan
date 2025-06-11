/* empty css                                      */
import { c as createComponent, e as renderHead, r as renderTemplate } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Setup = createComponent(async ($$result, $$props, $$slots) => {
  const title = "Initial Setup - Mission Planner";
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="Mission Planner Initial Setup"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="bg-gray-50 font-sans"> <div class="min-h-screen flex items-center justify-center"> <div class="max-w-md w-full space-y-8 p-8"> <div> <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
Mission Planner Setup
</h2> <p class="mt-2 text-center text-sm text-gray-600">
Create your administrator account to get started
</p> </div> <form id="setupForm" class="mt-8 space-y-6"> <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert"></div> <div id="successMessage" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert"></div> <div class="space-y-4"> <div> <label for="username" class="block text-sm font-medium text-gray-700">Username</label> <input id="username" name="username" type="text" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Enter admin username"> </div> <div> <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label> <input id="email" name="email" type="email" required class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Enter admin email"> </div> <div> <label for="password" class="block text-sm font-medium text-gray-700">Password</label> <input id="password" name="password" type="password" required minlength="8" class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Enter secure password (min 8 characters)"> </div> <div> <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label> <input id="confirmPassword" name="confirmPassword" type="password" required minlength="8" class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Confirm your password"> </div> </div> <div> <button type="submit" id="submitButton" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
Create Administrator Account
</button> </div> <div class="text-center"> <p class="text-xs text-gray-500">
This account will have full administrative privileges including user management and system configuration.
</p> </div> </form> </div> </div>  </body> </html>`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/setup.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/setup.astro";
const $$url = "/setup";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Setup,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
