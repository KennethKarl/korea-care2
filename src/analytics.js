/* =========================================================================
   analytics.js — GA4 · Meta Pixel · MS Clarity · ChannelTalk 로더
   global.safedoc.io 의 마케팅/계측 스택 계열. 전부 env 키가 있을 때만 로드,
   SSG/서버 환경에서는 `typeof window` 가드로 no-op.
   ========================================================================= */
import { GA4_ID, META_PIXEL_ID, CLARITY_ID, CHANNEL_PLUGIN_KEY } from "./config.js";

let inited = false;

export function initAnalytics() {
  if (typeof window === "undefined" || inited) return;
  inited = true;
  if (GA4_ID) loadGA4(GA4_ID);
  if (META_PIXEL_ID) loadPixel(META_PIXEL_ID);
  if (CLARITY_ID) loadClarity(CLARITY_ID);
  if (CHANNEL_PLUGIN_KEY) loadChannelTalk(CHANNEL_PLUGIN_KEY);
}

export function trackPageView(path) {
  if (typeof window === "undefined") return;
  if (window.gtag && GA4_ID) window.gtag("event", "page_view", { page_path: path });
  if (window.fbq) window.fbq("track", "PageView");
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", name, params);
  if (window.fbq) window.fbq("trackCustom", name, params);
}

/* ----------------------------- loaders ----------------------------- */
function inject(src, attrs = {}) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
  return s;
}

function loadGA4(id) {
  inject(`https://www.googletagmanager.com/gtag/js?id=${id}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id);
}

function loadPixel(id) {
  /* Meta Pixel base snippet */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", id);
  window.fbq("track", "PageView");
}

function loadClarity(id) {
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
}

function loadChannelTalk(pluginKey) {
  /* ChannelTalk(channel.io) boot snippet (요약판) */
  if (window.ChannelIO) return;
  const ch = function () { ch.c(arguments); };
  ch.q = []; ch.c = function (args) { ch.q.push(args); };
  window.ChannelIO = ch;
  inject("https://cdn.channel.io/plugin/ch-plugin-web.js");
  window.ChannelIO("boot", { pluginKey });
}
