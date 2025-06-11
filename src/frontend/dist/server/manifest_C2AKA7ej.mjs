import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DViSQB1f.mjs';
import 'es-module-lexer';
import { g as decodeKey } from './chunks/astro/server_B-ZIt8ph.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.Dt_Fwmw8.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/activities","isIndex":false,"type":"page","pattern":"^\\/activities\\/?$","segments":[[{"content":"activities","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/activities.astro","pathname":"/activities","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/adjustments","isIndex":false,"type":"page","pattern":"^\\/adjustments\\/?$","segments":[[{"content":"adjustments","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/adjustments.astro","pathname":"/adjustments","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.fGh4bY6q.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/timeline","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/timeline\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"timeline","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/timeline.js","pathname":"/api/timeline","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/constraints","isIndex":false,"type":"page","pattern":"^\\/constraints\\/?$","segments":[[{"content":"constraints","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/constraints.astro","pathname":"/constraints","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/documentation","isIndex":false,"type":"page","pattern":"^\\/documentation\\/?$","segments":[[{"content":"documentation","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/documentation.astro","pathname":"/documentation","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/groundstations","isIndex":false,"type":"page","pattern":"^\\/groundstations\\/?$","segments":[[{"content":"groundstations","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/groundstations.astro","pathname":"/groundstations","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"const c=\"http://localhost:3000\";function l(e,t){localStorage.setItem(\"user\",JSON.stringify(e)),localStorage.setItem(\"token\",t)}function d(){const e=localStorage.getItem(\"user\"),t=localStorage.getItem(\"token\");return{user:e?JSON.parse(e):null,token:t}}function n(e){const t=document.getElementById(\"errorMessage\");t.textContent=e,t.classList.remove(\"hidden\")}function u(){document.getElementById(\"errorMessage\").classList.add(\"hidden\")}const a=d();a.user&&a.token&&(window.location.href=\"/\");document.getElementById(\"loginForm\").addEventListener(\"submit\",async e=>{e.preventDefault(),u();const t=new FormData(e.target),s=t.get(\"username\"),i=t.get(\"password\");try{const o=await fetch(`${c}/api/auth/login`,{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({username:s,password:i})}),r=await o.json();o.ok?(l(r.user,r.token),window.location.href=\"/\"):n(r.error||\"Login failed\")}catch(o){n(\"Network error. Please try again.\"),console.error(\"Login error:\",o)}});\n"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/satellites","isIndex":false,"type":"page","pattern":"^\\/satellites\\/?$","segments":[[{"content":"satellites","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/satellites.astro","pathname":"/satellites","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"const c=\"http://localhost:3000\";function n(t){const e=document.getElementById(\"errorMessage\"),s=document.getElementById(\"successMessage\");e.textContent=t,e.classList.remove(\"hidden\"),s.classList.add(\"hidden\")}function l(t){const e=document.getElementById(\"successMessage\"),s=document.getElementById(\"errorMessage\");e.textContent=t,e.classList.remove(\"hidden\"),s.classList.add(\"hidden\")}function m(){document.getElementById(\"errorMessage\").classList.add(\"hidden\"),document.getElementById(\"successMessage\").classList.add(\"hidden\")}function g(t,e){localStorage.setItem(\"user\",JSON.stringify(t)),localStorage.setItem(\"token\",e)}async function f(){try{return(await(await fetch(`${c}/api/auth/setup-status`)).json()).setup_required?!0:(window.location.href=\"/login\",!1)}catch(t){return console.error(\"Error checking setup status:\",t),n(\"Unable to verify setup status. Please check your connection.\"),!1}}function h(){const t=document.getElementById(\"password\").value,e=document.getElementById(\"confirmPassword\").value;return t!==e?(n(\"Passwords do not match\"),!1):t.length<8?(n(\"Password must be at least 8 characters long\"),!1):!0}document.getElementById(\"setupForm\").addEventListener(\"submit\",async t=>{if(t.preventDefault(),m(),!h())return;const e=document.getElementById(\"submitButton\"),s=e.textContent;e.textContent=\"Creating Account...\",e.disabled=!0;const r=new FormData(t.target),d=r.get(\"username\"),i=r.get(\"email\"),u=r.get(\"password\");try{const o=await fetch(`${c}/api/auth/setup-admin`,{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({username:d,email:i,password:u})}),a=await o.json();o.ok?(l(\"Administrator account created successfully! Redirecting...\"),g(a.user,a.token),setTimeout(()=>{window.location.href=\"/\"},2e3)):n(a.error||\"Failed to create administrator account\")}catch(o){n(\"Network error. Please check your connection and try again.\"),console.error(\"Setup error:\",o)}finally{e.textContent=s,e.disabled=!1}});document.addEventListener(\"DOMContentLoaded\",function(){f()});\n"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/setup","isIndex":false,"type":"page","pattern":"^\\/setup\\/?$","segments":[[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/setup.astro","pathname":"/setup","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/targets","isIndex":false,"type":"page","pattern":"^\\/targets\\/?$","segments":[[{"content":"targets","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/targets.astro","pathname":"/targets","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.ubEzurhk.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/timeline","isIndex":false,"type":"page","pattern":"^\\/timeline\\/?$","segments":[[{"content":"timeline","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/timeline.astro","pathname":"/timeline","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DlGuobQj.js"}],"styles":[{"type":"external","src":"/_astro/activities.DXWI3rfc.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/login.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/setup.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/activities.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/adjustments.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/admin.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/constraints.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/documentation.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/groundstations.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/satellites.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/targets.astro",{"propagation":"none","containsHead":true}],["/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/pages/timeline.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/activities@_@astro":"pages/activities.astro.mjs","\u0000@astro-page:src/pages/adjustments@_@astro":"pages/adjustments.astro.mjs","\u0000@astro-page:src/pages/admin@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/timeline@_@js":"pages/api/timeline.astro.mjs","\u0000@astro-page:src/pages/constraints@_@astro":"pages/constraints.astro.mjs","\u0000@astro-page:src/pages/documentation@_@astro":"pages/documentation.astro.mjs","\u0000@astro-page:src/pages/groundstations@_@astro":"pages/groundstations.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/satellites@_@astro":"pages/satellites.astro.mjs","\u0000@astro-page:src/pages/setup@_@astro":"pages/setup.astro.mjs","\u0000@astro-page:src/pages/targets@_@astro":"pages/targets.astro.mjs","\u0000@astro-page:src/pages/timeline@_@astro":"pages/timeline.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_C2AKA7ej.mjs","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/GanttChart.jsx":"_astro/GanttChart.BZ1_XgyI.js","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/TimelineTable.jsx":"_astro/TimelineTable.CernphlN.js","/astro/hoisted.js?q=0":"_astro/hoisted.Dt_Fwmw8.js","/astro/hoisted.js?q=1":"_astro/hoisted.fGh4bY6q.js","/astro/hoisted.js?q=2":"_astro/hoisted.CObnyP5J.js","/astro/hoisted.js?q=3":"_astro/hoisted.bVvtVD7Q.js","/astro/hoisted.js?q=4":"_astro/hoisted.DlGuobQj.js","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/GroundStationManager.jsx":"_astro/GroundStationManager.BOoKMDo0.js","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/SatelliteManager.jsx":"_astro/SatelliteManager.tVJLPeOp.js","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/TargetManager.jsx":"_astro/TargetManager.c-zkcp38.js","/Users/AntonyDeighton/WORK/20250517/missionplanning/src/frontend/src/components/TimelineContainer.jsx":"_astro/TimelineContainer.ZS6dlffr.js","@astrojs/react/client.js":"_astro/client.C4rGbYxV.js","/astro/hoisted.js?q=5":"_astro/hoisted.ubEzurhk.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/activities.DXWI3rfc.css","/_astro/GanttChart.BZ1_XgyI.js","/_astro/GroundStationManager.BOoKMDo0.js","/_astro/SatelliteManager.tVJLPeOp.js","/_astro/TargetManager.c-zkcp38.js","/_astro/TimelineContainer.ZS6dlffr.js","/_astro/TimelineTable.CernphlN.js","/_astro/ViewToggle.-WxgrB4c.js","/_astro/client.C4rGbYxV.js","/_astro/hoisted.DlGuobQj.js","/_astro/hoisted.Dt_Fwmw8.js","/_astro/hoisted.fGh4bY6q.js","/_astro/hoisted.ubEzurhk.js","/_astro/index.B52nOzfP.js"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"MPArOnC3g41hKzEsVoT8NLN5rLc8z0JPkD+etSPQ1E8=","experimentalEnvGetSecretEnabled":false});

export { manifest };
