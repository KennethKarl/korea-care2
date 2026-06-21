import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// base: 환경변수 VITE_BASE 로 전환 가능.
//   · 커스텀 도메인(global.safedoc.io) 루트 배포 → "/" (기본, public/CNAME 참조)
//   · github.io 서브경로 즉시확인 배포 → "/korea-care/" (VITE_BASE 로 주입, CNAME 제거)
// vite-react-ssg 가 라우트별 정적 HTML 을 prerender 한다 (SEO·GEO 노출).
export default defineConfig(() => ({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  ssgOptions: {
    script: "async",
    dirStyle: "nested",   // /treatment/proton/index.html → 클린 URL
    entry: "src/main.jsx",
  },
}));
