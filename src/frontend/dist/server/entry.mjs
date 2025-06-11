import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BDv8aLeF.mjs';
import { manifest } from './manifest_C2AKA7ej.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/activities.astro.mjs');
const _page2 = () => import('./pages/adjustments.astro.mjs');
const _page3 = () => import('./pages/admin.astro.mjs');
const _page4 = () => import('./pages/api/timeline.astro.mjs');
const _page5 = () => import('./pages/constraints.astro.mjs');
const _page6 = () => import('./pages/documentation.astro.mjs');
const _page7 = () => import('./pages/groundstations.astro.mjs');
const _page8 = () => import('./pages/login.astro.mjs');
const _page9 = () => import('./pages/satellites.astro.mjs');
const _page10 = () => import('./pages/setup.astro.mjs');
const _page11 = () => import('./pages/targets.astro.mjs');
const _page12 = () => import('./pages/timeline.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/activities.astro", _page1],
    ["src/pages/adjustments.astro", _page2],
    ["src/pages/admin.astro", _page3],
    ["src/pages/api/timeline.js", _page4],
    ["src/pages/constraints.astro", _page5],
    ["src/pages/documentation.astro", _page6],
    ["src/pages/groundstations.astro", _page7],
    ["src/pages/login.astro", _page8],
    ["src/pages/satellites.astro", _page9],
    ["src/pages/setup.astro", _page10],
    ["src/pages/targets.astro", _page11],
    ["src/pages/timeline.astro", _page12],
    ["src/pages/index.astro", _page13]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/dist/client/",
    "server": "file:///Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/dist/server/",
    "host": true,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
