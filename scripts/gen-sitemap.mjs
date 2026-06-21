/* =========================================================================
   gen-sitemap.mjs — 빌드 산출물(dist/) 을 스캔해 sitemap.xml 생성
   vite-react-ssg 가 라우트별로 생성한 모든 index.html 을 URL 로 매핑한다.
   (라우트 데이터가 바뀌어도 실제 prerender 결과와 항상 일치)
   사용: package.json build 끝에 `node scripts/gen-sitemap.mjs`
   ========================================================================= */
import { readdirSync, statSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const SITE_URL = "https://global.safedoc.io";
const DIST = "dist";

// noindex 로 둘 경로(사이트맵 제외)
const EXCLUDE = new Set(["/mypage", "/404", "/admin", "/hospital-admin"]);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name === "index.html") acc.push(p);
  }
  return acc;
}

function toRoute(htmlPath) {
  // dist/programs/index.html -> /programs ; dist/index.html -> /
  let rel = "/" + relative(DIST, htmlPath).replace(/\/?index\.html$/, "");
  if (rel === "/") return "/";
  return rel.replace(/\/$/, "");
}

let urls;
try {
  urls = [...new Set(walk(DIST).map(toRoute))]
    .filter((r) => !EXCLUDE.has(r))
    .sort();
} catch (e) {
  console.error("[gen-sitemap] dist/ 스캔 실패:", e.message);
  process.exit(0); // 빌드 자체는 막지 않음
}

const body = urls
  .map((r) => {
    const loc = SITE_URL + (r === "/" ? "/" : r);
    const priority = r === "/" ? "1.0" : "0.7";
    return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(join(DIST, "sitemap.xml"), xml);
console.log(`[gen-sitemap] ${urls.length} URLs → dist/sitemap.xml`);

// GitHub Pages SPA 폴백: 미지정 경로는 404.html → SPA 부트(NotFound)
if (existsSync(join(DIST, "index.html"))) {
  copyFileSync(join(DIST, "index.html"), join(DIST, "404.html"));
  console.log("[gen-sitemap] dist/404.html (SPA fallback)");
}
