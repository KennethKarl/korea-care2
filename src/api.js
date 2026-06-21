/* =========================================================================
   api.js — 세이프닥 백엔드 연동 클라이언트
   VITE_API_BASE 미설정 시 mock 성공을 반환해 정적 프로토타입 UX 를 유지한다.
   엔드포인트/스키마는 docs/SERVER-REQUEST.md 와 일치시킨다.
   ========================================================================= */
import { API_BASE } from "./config.js";

async function post(path, body) {
  if (!API_BASE) {
    // 백엔드 미연동: 모의 성공 (개발부 서버 준비 전 폴백)
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true, mock: true };
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json().catch(() => ({ ok: true }));
}

/** 상담/문의 리드 (Contact 폼) */
export const submitLead = (data) => post("/v1/leads", data);

/** 예약 신청 (Reservation 폼) */
export const submitReservation = (data) => post("/v1/reservations", data);
