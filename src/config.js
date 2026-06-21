/* =========================================================================
   config.js — 런타임 환경설정 중앙화 (Vite import.meta.env 기반)
   값은 빌드 시 .env / GitHub Actions secrets 로 주입된다. 미설정 시 빈 문자열
   → 분석/ChannelTalk 은 no-op, API 는 mock 폴백 (정적 배포에서도 무에러).
   ========================================================================= */
const env = import.meta.env;

// 세이프닥 백엔드 (폼 제출 등). 미설정 시 api.js 가 mock 성공 반환.
export const API_BASE = env.VITE_API_BASE || "";

// 분석/마케팅 (global.safedoc.io 스택과 동일 계열)
export const GA4_ID = env.VITE_GA4_ID || "";                 // 예: G-XXXXXXXXXX
export const META_PIXEL_ID = env.VITE_META_PIXEL_ID || "";   // 예: 123456789012345
export const CLARITY_ID = env.VITE_CLARITY_ID || "";         // MS Clarity project id
export const CHANNEL_PLUGIN_KEY = env.VITE_CHANNEL_PLUGIN_KEY || ""; // ChannelTalk

// Google 로그인(회원가입 대체). 설정 시 실제 GIS 로그인, 미설정 시 데모 로그인 폴백.
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID || "";

// 사이트 정식 URL (canonical/OG/sitemap 기준) — 커스텀 도메인 루트
export const SITE_URL = "https://global.safedoc.io";
