/* empty css                                      */
import { c as createComponent, e as renderHead, r as renderTemplate } from '../chunks/astro/server_B-ZIt8ph.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const title = "Login - Mission Planner";
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="Mission Planner Login"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="bg-gray-50 font-sans"> <div class="min-h-screen flex items-center justify-center"> <div class="max-w-md w-full space-y-8 p-8"> <div> <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
Mission Planner
</h2> <p class="mt-2 text-center text-sm text-gray-600">
Sign in to your account
</p> </div> <form id="loginForm" class="mt-8 space-y-6"> <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert"></div> <div class="rounded-md shadow-sm -space-y-px"> <div> <label for="username" class="sr-only">Username</label> <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Username or Email"> </div> <div> <label for="password" class="sr-only">Password</label> <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password"> </div> </div> <div> <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
Sign in
</button> </div> <div class="text-center"> <p class="text-sm text-gray-600">
Use the credentials created during initial setup
</p> </div> </form> </div> </div>  </body> </html>`;
}, "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/login.astro", void 0);

const $$file = "/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
