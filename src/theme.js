/* =========================================================================
   theme.js — 디자인 토큰 (global.safedoc.io / SafeDoc Global 실측 반영)
   기존 App.jsx / screens.jsx 의 TEAL… 로컬 상수를 여기로 중앙화한다.
   호출부는 `import { BLUE as TEAL, ... }` 별칭으로 받아 사용처를 그대로 둔다.
   ========================================================================= */

// Brand
export const BLUE = "#1b59fa";       // primary (CTA·링크·강조)
export const BLUE_DARK = "#1f5dff";  // hover/pressed
export const BLUE_SOFT = "#eaf0ff";  // tinted background
export const ACCENT = "#ff2552";     // coral/red 강조 (할인·배지)
export const ACCENT_SOFT = "#ffe9ee";

// Neutrals
export const INK = "#212121";        // 본문 헤딩
export const SUB = "#52606b";        // 보조 텍스트
export const MUTE = "#757575";       // 흐린 텍스트
export const LINE = "#e7e7e7";       // 보더
export const BG = "#ffffff";
export const BG_SOFT = "#f5f7f8";    // 섹션 배경

// Status
export const SUCCESS = "#00d255";    // 절감/성공
export const STAR = "#ffb020";       // 별점

// Landing (KoreCare Landing.dc 디자인 토큰)
export const NAVY = "#0a1f44";       // 다크 섹션/배너/푸터 배경
export const NAVY_LINE = "#1a3460";  // 다크 섹션 내부 보더
export const GREEN = "#16a34a";      // covered/절감 배지(랜딩)
export const GREEN_SOFT = "#eafaf2";
export const DISPLAY =               // 랜딩 디스플레이 폰트 스택(영문 우선, 한글 Pretendard 폴백)
  '"Plus Jakarta Sans", "Pretendard Variable", Pretendard, system-ui, sans-serif';

/* helpers (App.jsx / screens.jsx 공용) */
export const btn = (bg, fg) => ({
  background: bg, color: fg, border: "none",
  padding: "11px 18px", borderRadius: 10, fontWeight: 700,
  cursor: "pointer", fontSize: 14,
});
export const money = (n) => "$" + Number(n).toLocaleString();
export const txt = (v, lang) => (v && typeof v === "object" ? v[lang] ?? v.en : v);
