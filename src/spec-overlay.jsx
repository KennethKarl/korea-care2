/* =========================================================================
   spec-overlay.jsx — 기획 모드 오버레이 (홈 전용) + 커스텀 앵커 편집기
   · 토글(우하단) / ?spec=1 로 on
   · 기본 마커(1-1~1-6)는 화면 요소(data-spec)에 앵커
   · "+ 마커 추가" → 화면 아무 곳 클릭 → 자유 위치 마커 생성(드래그 이동 가능)
   · 마커 클릭 → 팝오버(요약 + 상세보기 + 수정/삭제)
   · 수정 → 모달에서 라벨/제목/요약/상세/요구사항 편집
   · 전부 localStorage(korecare_spec_markers) 저장. "초기화"로 기본값 복원.
   client-only.
   ========================================================================= */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { BLUE as TEAL, BLUE_SOFT as TEAL_SOFT, INK, SUB, MUTE, LINE, ACCENT, btn } from "./theme.js";

const KEY = "korecare_spec_markers";

const DEFAULTS = [
  { id: "1-1", type: "el", sel: '[data-spec="1-1"]', label: "1-1", title: "글로벌 GNB (상단 내비)", desc: "전 페이지 공통 상단바. 메뉴, 언어 토글(EN/KO), 로그인, 어드민(⚙).", detail: "글로벌 고객(미국·영국 보험가입자) 대상 영문 우선 GNB. 로그인은 Google(GIS)+이메일, 로그인 시 마이페이지 진입. 모바일은 가로 스크롤 메뉴.", req: "요구사항정의서: 공통 헤더 / 로그인·회원가입" },
  { id: "1-2", type: "el", sel: '[data-spec="1-2"]', label: "1-2", title: "보험사 추천 배너", desc: "보험사 referral 컨텍스트 — covered 프로그램 강조 안내.", detail: "B2B(보험사) 채널 진입 시 referral 기반 covered 강조. 현재 고정 카피 — 추후 보험사 파라미터/제휴사 분기 및 커버리지 룰 연동(백엔드).", req: "요구사항정의서: 커버리지 노출 규칙" },
  { id: "1-3", type: "el", sel: '[data-spec="1-3"]', label: "1-3", title: "히어로 + 검색", desc: "가치제안 카피 + 시술·병원·지역 검색바.", detail: "인바운드 메시지: 보험사가 시술비 커버, 나머지(항공·비자·통역·회복·사후관리)는 KoreCare 원스톱. 검색은 시술/병원 탭 분리, 결과 연동은 확장 대상.", req: "요구사항정의서: 홈 / 통합검색" },
  { id: "1-4", type: "el", sel: '[data-spec="1-4"]', label: "1-4", title: "진료과 필터 칩", desc: "진료과별 필터. 선택 시 하단 프로그램 목록 필터링.", detail: "카테고리=진료과. 시술은 복수 진료과(deptIds) 교차 노출. 어드민 '시술 관리' 노출 토글이 이 목록에 연동(mock). 지역·정렬·쿠폰 필터로 확장 가능.", req: "요구사항정의서: 시술 리스트 / 필터" },
  { id: "1-5", type: "el", sel: '[data-spec="1-5"]', label: "1-5", title: "프로그램(병원·시술) 카드", desc: "병원·인증(JCI)·Covered·평점·정가/한국가·절감·View plan.", detail: "정가(US) vs 세이프닥 할인가(Korea all-in) 대비 + 절감액. Covered=보험 커버. View plan → 병원/시술 상세. 쿠폰/복지 혜택 배지로 확장 가능.", req: "요구사항정의서: 시술/병원 카드 노출정보" },
  { id: "1-6", type: "el", sel: '[data-spec="1-6"]', label: "1-6", title: "토탈케어 5단계", desc: "매칭·이동(항공/비자)·통역·회복 숙소·미국 사후관리.", detail: "원스톱 관리가 핵심 차별점. 예약 진행단계(예약요청>조율중>예약확정>방문완료>리뷰)와 연결되는 고객 여정의 상위 개념.", req: "요구사항정의서: 서비스 플로우 / 마이페이지 예약단계" },
];

const lsGet = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
const lsSet = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) {} };

export default function SpecOverlay() {
  const [on, setOn] = useState(() => { try { return new URLSearchParams(window.location.search).get("spec") === "1"; } catch { return false; } });
  const [markers, setMarkers] = useState(() => lsGet() || DEFAULTS);
  const [rects, setRects] = useState({});
  const [sel, setSel] = useState(null);       // 팝오버 marker id
  const [editing, setEditing] = useState(null); // 편집 중 marker(복사본) or null
  const [detail, setDetail] = useState(null);   // 상세 모달 marker id
  const [placing, setPlacing] = useState(false);
  const drag = useRef(null);

  const save = (next) => { setMarkers(next); lsSet(next); };
  useEffect(() => { if (!lsGet()) lsSet(DEFAULTS); }, []);

  const measure = useCallback(() => {
    const r = { __sx: window.scrollX, __sy: window.scrollY };
    markers.forEach((m) => { if (m.type === "el") { const el = document.querySelector(m.sel); if (el) { const b = el.getBoundingClientRect(); r[m.id] = { top: b.top, left: b.left }; } } });
    setRects(r);
  }, [markers]);

  useEffect(() => {
    if (!on) return;
    measure();
    const f = () => { if (!drag.current) measure(); };
    window.addEventListener("scroll", f, true);
    window.addEventListener("resize", f);
    const t = setInterval(f, 600);
    return () => { window.removeEventListener("scroll", f, true); window.removeEventListener("resize", f); clearInterval(t); };
  }, [on, measure]);

  const posOf = (m) => {
    if (m.type === "el") { const r = rects[m.id]; return r ? { top: r.top + 8, left: r.left + 8 } : null; }
    return { top: m.y - (rects.__sy || 0), left: m.x - (rects.__sx || 0) };
  };

  /* --- 커스텀 마커 추가 --- */
  const onPlaceClick = (e) => {
    const x = e.clientX + window.scrollX, y = e.clientY + window.scrollY;
    const n = markers.filter((m) => m.type === "xy").length + 1;
    const m = { id: "c" + Date.now(), type: "xy", label: "C" + n, title: "새 마커", desc: "", detail: "", req: "", x, y };
    save([...markers, m]); setPlacing(false); setSel(null); setEditing({ ...m });
  };

  /* --- 드래그 이동 (모든 마커; 기본 마커도 끌면 자유 위치로 전환) --- */
  const startDrag = (e, m) => {
    e.preventDefault(); e.stopPropagation();
    drag.current = { id: m.id, moved: false, sx: e.clientX, sy: e.clientY };
    const move = (ev) => {
      const d = drag.current; if (!d) return;
      if (Math.abs(ev.clientX - d.sx) > 3 || Math.abs(ev.clientY - d.sy) > 3) d.moved = true;
      if (d.moved) setMarkers((prev) => prev.map((x) => (x.id === d.id ? { ...x, type: "xy", x: ev.clientX + window.scrollX, y: ev.clientY + window.scrollY } : x)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      const d = drag.current; drag.current = null;
      if (d && d.moved) setMarkers((prev) => { lsSet(prev); return prev; }); // 최신 위치 영속화
      else setSel((s) => (s === m.id ? null : m.id));
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  const m = sel ? markers.find((x) => x.id === sel) : null;
  const dm = detail ? markers.find((x) => x.id === detail) : null;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const removeMarker = (id) => { save(markers.filter((x) => x.id !== id)); setSel(null); setEditing(null); setDetail(null); };
  const saveEdit = () => { save(markers.map((x) => (x.id === editing.id ? { ...editing } : x))); setEditing(null); };

  return (
    <>
      {/* 토글 */}
      <button onClick={() => { setOn((o) => !o); setSel(null); setPlacing(false); }} title="기획 모드"
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9000, ...btn(on ? ACCENT : TEAL, "#fff"), boxShadow: "0 6px 20px rgba(0,0,0,.18)" }}>
        {on ? "✕ 기획 모드 닫기" : "📐 기획 모드"}
      </button>

      {/* 툴바 */}
      {on && (
        <div style={{ position: "fixed", left: 16, bottom: 16, zIndex: 9000, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, boxShadow: "0 6px 20px rgba(0,0,0,.12)", width: 240 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 8 }}>📐 기획 모드</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => { setPlacing((p) => !p); setSel(null); }} style={{ ...btn(placing ? ACCENT : TEAL, "#fff"), fontSize: 12, padding: "7px 10px" }}>{placing ? "위치 클릭…" : "+ 마커 추가"}</button>
            <button onClick={() => save(DEFAULTS)} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}`, fontSize: 12, padding: "7px 10px" }}>초기화</button>
          </div>
          <div style={{ fontSize: 11, color: MUTE, marginTop: 8, lineHeight: 1.45 }}>
            {placing ? "화면에서 마커를 놓을 위치를 클릭하세요." : "마커 클릭=설명 · 드래그=이동(기본 마커도 가능) · 공유 "}{!placing && <code>?spec=1</code>}
          </div>
        </div>
      )}

      {/* 배치 클릭 캐처 */}
      {on && placing && (
        <div onClick={onPlaceClick} style={{ position: "fixed", inset: 0, zIndex: 8700, cursor: "crosshair", background: "rgba(27,89,250,.05)" }} />
      )}

      {/* 마커 */}
      {on && markers.map((mk) => {
        const p = posOf(mk); if (!p) return null;
        const active = sel === mk.id;
        return (
          <button key={mk.id}
            onPointerDown={(e) => startDrag(e, mk)}
            title="클릭=설명 · 드래그=이동"
            style={{ position: "fixed", top: Math.max(8, p.top), left: Math.max(4, p.left), zIndex: 8800,
              background: mk.type === "xy" ? TEAL : ACCENT, color: "#fff", border: "2px solid #fff", borderRadius: 8,
              minWidth: 30, height: 24, padding: "0 7px", fontSize: 12, fontWeight: 800,
              cursor: "grab", touchAction: "none",
              boxShadow: active ? `0 0 0 3px ${ACCENT}55` : "0 2px 8px rgba(0,0,0,.25)" }}>
            {mk.label}
          </button>
        );
      })}

      {/* 팝오버 */}
      {on && m && posOf(m) && (
        <div style={{ position: "fixed", zIndex: 8900, top: Math.min(posOf(m).top + 34, vh - 240), left: Math.min(posOf(m).left, vw - 320), width: 300, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.18)", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontWeight: 800, color: TEAL, fontSize: 14 }}>
              <span style={{ background: m.type === "xy" ? TEAL : ACCENT, color: "#fff", borderRadius: 6, padding: "1px 7px", fontSize: 12, marginRight: 6 }}>{m.label}</span>{m.title}
            </span>
            <button onClick={() => setSel(null)} style={xBtn}>✕</button>
          </div>
          {m.desc && <div style={{ fontSize: 13, color: SUB, marginTop: 8, lineHeight: 1.55 }}>{m.desc}</div>}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <button onClick={() => setDetail(m.id)} style={{ ...btn(TEAL, "#fff"), fontSize: 12.5, padding: "8px 10px", flex: 1 }}>상세 보기 →</button>
            <button onClick={() => { setEditing({ ...m }); setSel(null); }} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}`, fontSize: 12.5, padding: "8px 10px" }}>수정</button>
            <button onClick={() => removeMarker(m.id)} style={{ ...btn("#fff", ACCENT), border: `1px solid ${ACCENT}`, fontSize: 12.5, padding: "8px 10px" }}>삭제</button>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {on && dm && (
        <div onClick={() => setDetail(null)} style={modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>
                <span style={{ background: dm.type === "xy" ? TEAL : ACCENT, color: "#fff", borderRadius: 7, padding: "2px 9px", fontSize: 14, marginRight: 8 }}>{dm.label}</span>{dm.title}
              </h3>
              <button onClick={() => setDetail(null)} style={xBtn}>✕</button>
            </div>
            <p style={{ color: SUB, lineHeight: 1.65, marginTop: 14, fontSize: 14.5, whiteSpace: "pre-wrap" }}>{dm.detail || "(상세 설명 없음)"}</p>
            {dm.req && <div style={{ marginTop: 16, background: TEAL_SOFT, color: TEAL, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>🔗 {dm.req}</div>}
            <div style={{ textAlign: "right", marginTop: 18, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setEditing({ ...dm }); setDetail(null); }} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}` }}>수정</button>
              <button onClick={() => setDetail(null)} style={{ ...btn(TEAL, "#fff") }}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 편집 모달 */}
      {on && editing && (
        <div onClick={() => setEditing(null)} style={modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: INK }}>마커 편집 · {editing.label}</h3>
              <button onClick={() => setEditing(null)} style={xBtn}>✕</button>
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <Field label="라벨"><input style={inp} value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} /></Field>
              <Field label="제목"><input style={inp} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="요약 (팝오버)"><textarea rows={2} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
              <Field label="상세 (모달)"><textarea rows={4} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} value={editing.detail} onChange={(e) => setEditing({ ...editing, detail: e.target.value })} /></Field>
              <Field label="요구사항 링크/메모"><input style={inp} value={editing.req} onChange={(e) => setEditing({ ...editing, req: e.target.value })} /></Field>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              <button onClick={() => removeMarker(editing.id)} style={{ ...btn("#fff", ACCENT), border: `1px solid ${ACCENT}` }}>삭제</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(null)} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}` }}>취소</button>
                <button onClick={saveEdit} style={{ ...btn(TEAL, "#fff") }}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }) {
  return <label style={{ display: "block" }}><span style={{ fontSize: 12, fontWeight: 600, color: SUB, display: "block", marginBottom: 4 }}>{label}</span>{children}</label>;
}
const inp = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, color: INK, outline: "none", boxSizing: "border-box" };
const xBtn = { border: "none", background: "transparent", cursor: "pointer", color: "#9aa5b1", fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 };
const modalBackdrop = { position: "fixed", inset: 0, zIndex: 9100, background: "rgba(15,23,42,.5)", display: "grid", placeItems: "center", padding: 20 };
const modalCard = { width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,.3)" };
