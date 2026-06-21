/* =========================================================================
   backoffice.jsx — 운영자 어드민 + 병원 관리자 페이지 (요구사항정의서, mock)
   3개 시스템(고객웹·어드민·병원관리자)이 localStorage 를 공유 → 사이트 간
   자동화가 프로토타입에서 실제로 동작한다:
     · 웹 예약신청 → 어드민 예약 DB (korecare_bookings 공유)
     · 어드민 단계변경 → 웹 마이페이지 예약내역 단계 연동
     · 어드민 예약확정 → 병원관리자 '글로벌 예약' 탭 노출
     · 병원관리자 금액입력 → 어드민 정산내역 반영 (korecare_settlements)
     · 웹 리뷰작성 → 어드민 리뷰관리 (korecare_reviews)
     · 웹 취소요청 → 어드민 예약내역 (booking.cancelRequested)
   전부 프론트 mock. client-only (App.jsx 라우트가 <ClientOnly> 로 감싼다).
   ========================================================================= */
import React, { useState } from "react";
import {
  Calendar, DollarSign, Users, Star, Building2, LayoutDashboard,
  Eye, EyeOff, Plus, Trash2, ExternalLink, ShieldCheck, Stethoscope, HelpCircle, Newspaper,
} from "lucide-react";
import { BLUE as TEAL, BLUE_SOFT as TEAL_SOFT, ACCENT, ACCENT_SOFT, INK, SUB, MUTE, LINE, BG_SOFT, SUCCESS, STAR, btn, money, txt } from "./theme.js";
import { treatments as TREATMENTS, blogPosts as BLOG_POSTS, faqItems as FAQ_ITEMS } from "./site-data.js";

const ls = {
  get(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "null") ?? fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
};
const STAGES = ["Requested", "Coordinating", "Confirmed", "Visited", "Reviewed"];
const STAGE_KO = ["예약 요청", "조율중", "예약 확정", "방문 완료", "리뷰 작성"];

/* --------------------------- shared demo seed --------------------------- */
function seedBookings() {
  if (ls.get("korecare_bookings", null)) return;
  ls.set("korecare_bookings", [
    { id: "bk_demo1", patientName: "Jane Doe", hospital: "Seoul National Cancer Center", treatment: "Proton Therapy", option: "", amount: 52000, listPrice: 145000, visit1: { date: "2026-07-15", slot: "AM" }, visit2: { date: "2026-07-22", slot: "PM" }, confirmedAt: null, stage: 1, createdAt: "2026-06-10T00:00:00.000Z", reviewed: false, cancelRequested: false },
    { id: "bk_demo2", patientName: "Jane Doe", hospital: "Asan Health Promotion Ctr.", treatment: "Executive Deep Screening", option: "Whole-body MRI + PET-CT", amount: 2200, listPrice: 8500, visit1: { date: "2026-06-02", slot: "AM" }, visit2: { date: "", slot: "" }, confirmedAt: "2026-06-01 10:00", stage: 3, createdAt: "2026-05-20T00:00:00.000Z", reviewed: false, cancelRequested: false },
  ]);
}
function seedAdmin() {
  seedBookings();
  if (!ls.get("korecare_hospitals", null)) {
    ls.set("korecare_hospitals", [
      { id: "snc", category: "Oncology", name: "Seoul National Cancer Center", address: "Seoul, Jongno-gu", visible: true },
      { id: "asan", category: "Oncology", name: "Asan Medical Oncology Inst.", address: "Seoul, Songpa-gu", visible: true },
      { id: "wooridul", category: "Orthopedics & Spine", name: "Wooridul Spine Hospital", address: "Seoul, Gangnam-gu", visible: true },
      { id: "asanhp", category: "Full Health Screening", name: "Asan Health Promotion Ctr.", address: "Seoul, Songpa-gu", visible: false },
    ]);
  }
  if (!ls.get("korecare_users", null)) {
    const u = [
      { joinedAt: "2026-05-18", firstName: "Jane", middleName: "", lastName: "Doe", email: "jane@example.com", phone: "+1 555 0142", referralCode: "WELCOME5", referredBy: "—", dob: "1986-04-02", gender: "Female", interpreterLang: "English", nationality: "United States", passportNumber: "US-4421•••", medicalHistory: "—", medications: "—", allergies: "Penicillin" },
      { joinedAt: "2026-06-08", firstName: "Minho", middleName: "", lastName: "Kim", email: "minho@example.com", phone: "+82 10 1234 5678", referralCode: "", referredBy: "WELCOME5", dob: "1990-11-20", gender: "Male", interpreterLang: "Korean", nationality: "South Korea", passportNumber: "KR-9087•••", medicalHistory: "Hypertension", medications: "Amlodipine", allergies: "—" },
    ];
    // 고객이 작성한 프로필이 있으면 합류
    const p = ls.get("korecare_profile", null);
    if (p && (p.firstName || p.email)) u.unshift({ joinedAt: "today", ...p, referredBy: p.referralCode ? "(code used)" : "—" });
    ls.set("korecare_users", u);
  }
  if (!ls.get("korecare_settlements", null)) ls.set("korecare_settlements", []);
  // 시술 카탈로그(노출 토글) — 고객 시술 리스트와 id 매칭
  if (!ls.get("korecare_treatments", null)) {
    ls.set("korecare_treatments", TREATMENTS.map((t) => ({ id: t.id, name: txt(t.name, "en"), deptIds: t.deptIds, price: t.price, usPrice: t.usPrice, visible: true })));
  }
  // FAQ CMS / 블로그 CMS — 고객 화면과 공유(오버레이)
  if (!ls.get("korecare_faqs", null)) ls.set("korecare_faqs", FAQ_ITEMS.map((f) => ({ ...f })));
  if (!ls.get("korecare_blogposts", null)) ls.set("korecare_blogposts", BLOG_POSTS.map((p) => ({ ...p })));
}

/* ============================== shell ============================== */
function Shell({ kind, tabs, tab, setTab, children }) {
  const isAdmin = kind === "admin";
  return (
    <div style={{ minHeight: "100vh", background: BG_SOFT, fontFamily: "Pretendard, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${LINE}`, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: isAdmin ? TEAL : "#0e2a5e", color: "#fff", display: "grid", placeItems: "center" }}>{isAdmin ? <ShieldCheck size={17} /> : <Building2 size={17} />}</div>
          <div>
            <div style={{ fontWeight: 800, color: INK, fontSize: 16 }}>KoreCare {isAdmin ? "운영자 어드민" : "병원 관리자"}</div>
            <div style={{ fontSize: 11.5, color: MUTE }}>Internal mock · 데이터는 고객 사이트와 localStorage 로 공유됩니다</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={isAdmin ? "/hospital-admin" : "/admin"} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}`, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>{isAdmin ? "병원 관리자" : "운영자 어드민"} <ExternalLink size={13} /></a>
          <a href="/" style={{ ...btn(TEAL, "#fff"), textDecoration: "none", fontSize: 13 }}>고객 사이트</a>
        </div>
      </header>
      <div style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
        <nav style={{ width: 210, flexShrink: 0, background: "#fff", borderRight: `1px solid ${LINE}`, padding: 12 }} className="bo-side">
          {tabs.map((tb) => {
            const on = tab === tb.id; const Icon = tb.icon;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                width: "100%", textAlign: "left", border: "none", borderRadius: 9, cursor: "pointer",
                background: on ? TEAL_SOFT : "transparent", color: on ? TEAL : SUB, fontWeight: on ? 700 : 500,
                padding: "10px 12px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 9, marginBottom: 3,
              }}><Icon size={16} /> {tb.label}</button>
            );
          })}
        </nav>
        <main style={{ flex: 1, padding: 24, minWidth: 0 }}>{children}</main>
      </div>
      <style>{`@media(max-width:760px){.bo-side{display:none}}`}</style>
    </div>
  );
}

/* ============================== Operator Admin ============================== */
export function AdminApp() {
  const [tab, setTab] = useState("reservations");
  seedAdmin();
  const tabs = [
    { id: "reservations", label: "예약 관리", icon: Calendar },
    { id: "settlements", label: "정산 관리", icon: DollarSign },
    { id: "users", label: "유저 관리", icon: Users },
    { id: "reviews", label: "리뷰 관리", icon: Star },
    { id: "hospitals", label: "병원 관리", icon: Building2 },
    { id: "treatments", label: "시술 관리", icon: Stethoscope },
    { id: "faq", label: "FAQ 관리", icon: HelpCircle },
    { id: "blog", label: "블로그 관리", icon: Newspaper },
  ];
  return (
    <Shell kind="admin" tabs={tabs} tab={tab} setTab={setTab}>
      {tab === "reservations" && <AdminReservations />}
      {tab === "settlements" && <AdminSettlements />}
      {tab === "users" && <AdminUsers />}
      {tab === "reviews" && <AdminReviews />}
      {tab === "hospitals" && <AdminHospitals />}
      {tab === "treatments" && <AdminTreatments />}
      {tab === "faq" && <AdminFaq />}
      {tab === "blog" && <AdminBlog />}
    </Shell>
  );
}

function AdminReservations() {
  const [rows, setRows] = useState(() => ls.get("korecare_bookings", []));
  const save = (next) => { setRows(next); ls.set("korecare_bookings", next); };
  const setStage = (id, stage) => save(rows.map((b) => (b.id === id ? { ...b, stage, confirmedAt: stage >= 2 && !b.confirmedAt ? nowStr() : b.confirmedAt } : b)));
  return (
    <Section title="예약 관리" desc="예약 단계를 변경하면 고객 마이페이지 예약내역에 즉시 연동됩니다. 예약 확정 시 병원 관리자 '글로벌 예약' 탭에 노출됩니다.">
      <Table head={["환자", "병원", "시술", "금액", "단계", "취소요청"]}>
        {rows.slice().reverse().map((b) => (
          <tr key={b.id} style={trS}>
            <Td>{b.patientName}</Td>
            <Td>{b.hospital || "—"}</Td>
            <Td>{b.treatment}</Td>
            <Td>{money(b.amount)}</Td>
            <Td>
              <select value={b.stage} onChange={(e) => setStage(b.id, parseInt(e.target.value, 10))} style={selS}>
                {STAGES.map((s, i) => <option key={i} value={i}>{i + 1}. {s} ({STAGE_KO[i]})</option>)}
              </select>
            </Td>
            <Td>{b.cancelRequested ? <Badge bg={ACCENT_SOFT} fg={ACCENT}>취소 요청</Badge> : <span style={{ color: MUTE }}>—</span>}</Td>
          </tr>
        ))}
      </Table>
      {!rows.length && <Empty text="예약이 없습니다." />}
    </Section>
  );
}

function AdminTreatments() {
  const [rows, setRows] = useState(() => ls.get("korecare_treatments", []));
  const [form, setForm] = useState({ name: "", deptId: "onco", price: "", usPrice: "" });
  const save = (next) => { setRows(next); ls.set("korecare_treatments", next); };
  const toggle = (id) => save(rows.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)));
  const add = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    save([...rows, { id: "t_" + Date.now(), name: form.name, deptIds: [form.deptId], price: Number(form.price) || 0, usPrice: Number(form.usPrice) || 0, visible: true }]);
    setForm({ name: "", deptId: form.deptId, price: "", usPrice: "" });
  };
  const inS = { border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, outline: "none" };
  const DEPTS = [["onco", "Oncology"], ["ortho", "Orthopedics & Spine"], ["cardiac", "Cardiac Surgery"], ["screen", "Full Health Screening"]];
  return (
    <Section title="시술 관리" desc="노출여부 토글로 고객 시술 리스트 노출을 제어합니다(즉시 연동). 시술 등록 시 카탈로그에 추가됩니다.">
      <form onSubmit={add} style={{ ...card, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 }}>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>시술명</span><input style={inS} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: LASIK" /></label>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>진료과</span>
          <select style={inS} value={form.deptId} onChange={(e) => setForm({ ...form, deptId: e.target.value })}>{DEPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>정가(US$)</span><input type="number" style={inS} value={form.usPrice} onChange={(e) => setForm({ ...form, usPrice: e.target.value })} /></label>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>세이프닥가</span><input type="number" style={inS} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        <button type="submit" style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={15} /> 시술 등록</button>
      </form>
      <Table head={["시술 ID", "시술명", "진료과", "정가", "할인가", "노출"]}>
        {rows.map((t) => (
          <tr key={t.id} style={trS}>
            <Td><span style={{ fontFamily: "monospace", fontSize: 12, color: MUTE }}>{t.id}</span></Td>
            <Td>{t.name}</Td>
            <Td>{(t.deptIds || []).join(", ")}</Td>
            <Td>{money(t.usPrice)}</Td>
            <Td><b style={{ color: TEAL }}>{money(t.price)}</b></Td>
            <Td>
              <button onClick={() => toggle(t.id)} style={{ border: `1px solid ${t.visible ? SUCCESS : LINE}`, background: t.visible ? "#eafaf2" : "#fff", color: t.visible ? "#1f9d6b" : MUTE, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                {t.visible ? <Eye size={13} /> : <EyeOff size={13} />} {t.visible ? "노출" : "숨김"}
              </button>
            </Td>
          </tr>
        ))}
      </Table>
    </Section>
  );
}

function AdminFaq() {
  const [rows, setRows] = useState(() => ls.get("korecare_faqs", []));
  const [form, setForm] = useState({ q: "", a: "" });
  const save = (next) => { setRows(next); ls.set("korecare_faqs", next); };
  const remove = (i) => save(rows.filter((_, idx) => idx !== i));
  const add = (e) => { e.preventDefault(); if (!form.q.trim()) return; save([...rows, { q: form.q, a: form.a }]); setForm({ q: "", a: "" }); };
  const inS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, outline: "none", boxSizing: "border-box" };
  return (
    <Section title="FAQ 관리" desc="등록·삭제 시 고객 FAQ 화면에 연동됩니다(오버레이).">
      <form onSubmit={add} style={{ ...card, display: "grid", gap: 10, marginBottom: 14 }}>
        <input style={inS} value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="질문(Q)" />
        <textarea style={{ ...inS, resize: "vertical", fontFamily: "inherit" }} rows={2} value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} placeholder="답변(A)" />
        <div><button type="submit" style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={15} /> FAQ 등록</button></div>
      </form>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((f, i) => (
          <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div><div style={{ fontWeight: 700, color: INK }}>{f.q}</div><div style={{ fontSize: 13, color: SUB, marginTop: 4, lineHeight: 1.5 }}>{f.a}</div></div>
            <button onClick={() => remove(i)} title="삭제" style={{ border: `1px solid ${LINE}`, background: "#fff", color: ACCENT, borderRadius: 8, padding: 7, cursor: "pointer", height: 34, flexShrink: 0 }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AdminBlog() {
  const [rows, setRows] = useState(() => ls.get("korecare_blogposts", []));
  const [form, setForm] = useState({ title: "", excerpt: "", body: "", tag: "Guide" });
  const save = (next) => { setRows(next); ls.set("korecare_blogposts", next); };
  const remove = (id) => save(rows.filter((p) => p.id !== id));
  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    save([{ id: "post_" + Date.now(), tag: form.tag, date: nowStr().slice(0, 10), cover: "", title: form.title, excerpt: form.excerpt, body: form.body }, ...rows]);
    setForm({ title: "", excerpt: "", body: "", tag: form.tag });
  };
  const inS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, outline: "none", boxSizing: "border-box" };
  return (
    <Section title="블로그 관리" desc="게시글 등록 시 고객 블로그에 자동 노출됩니다(오버레이).">
      <form onSubmit={add} style={{ ...card, display: "grid", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input style={{ ...inS, flex: 1, minWidth: 200 }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="제목" />
          <select style={{ ...inS, width: 130 }} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}><option>Guide</option><option>Travel</option><option>Medical</option><option>Story</option></select>
        </div>
        <input style={inS} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="요약" />
        <textarea style={{ ...inS, resize: "vertical", fontFamily: "inherit" }} rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="본문" />
        <div><button type="submit" style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={15} /> 게시글 등록</button></div>
      </form>
      <Table head={["날짜", "태그", "제목", "삭제"]}>
        {rows.map((p) => (
          <tr key={p.id} style={trS}>
            <Td>{p.date}</Td><Td><Badge bg={TEAL_SOFT} fg={TEAL}>{p.tag}</Badge></Td>
            <Td>{txt(p.title, "en")}</Td>
            <Td><button onClick={() => remove(p.id)} style={{ border: `1px solid ${LINE}`, background: "#fff", color: ACCENT, borderRadius: 8, padding: 6, cursor: "pointer" }}><Trash2 size={14} /></button></Td>
          </tr>
        ))}
      </Table>
    </Section>
  );
}

function AdminSettlements() {
  const rows = ls.get("korecare_settlements", []);
  return (
    <Section title="정산 관리" desc="병원 관리자가 금액을 입력하면 여기 정산 내역으로 반영됩니다.">
      <Table head={["병원", "시술", "환자", "정산 금액", "상태", "요청일"]}>
        {rows.slice().reverse().map((s, i) => (
          <tr key={i} style={trS}>
            <Td>{s.hospital}</Td><Td>{s.treatment}</Td><Td>{s.patientName}</Td>
            <Td><b style={{ color: TEAL }}>{money(s.amount)}</b></Td>
            <Td><Badge bg={TEAL_SOFT} fg={TEAL}>{s.status}</Badge></Td>
            <Td>{(s.createdAt || "").slice(0, 10)}</Td>
          </tr>
        ))}
      </Table>
      {!rows.length && <Empty text="정산 내역이 없습니다. 병원 관리자 페이지에서 금액을 입력해 보세요." />}
    </Section>
  );
}

function AdminUsers() {
  const rows = ls.get("korecare_users", []);
  return (
    <Section title="유저 관리" desc="정상적인 추천인 코드로 가입하면 5% 할인권이 지급됩니다(정의서).">
      <Table head={["가입일", "이름", "이메일", "연락처", "국적", "통역", "추천코드/추천인"]}>
        {rows.map((u, i) => (
          <tr key={i} style={trS}>
            <Td>{u.joinedAt}</Td>
            <Td>{[u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ")}</Td>
            <Td>{u.email}</Td><Td>{u.phone}</Td><Td>{u.nationality}</Td><Td>{u.interpreterLang}</Td>
            <Td>{u.referralCode || "—"} {u.referredBy && u.referredBy !== "—" ? <span style={{ color: MUTE }}>· by {u.referredBy}</span> : ""}</Td>
          </tr>
        ))}
      </Table>
      {!rows.length && <Empty text="유저가 없습니다." />}
    </Section>
  );
}

function AdminReviews() {
  const rows = ls.get("korecare_reviews", []);
  return (
    <Section title="리뷰 관리" desc="고객이 방문 완료 후 작성한 리뷰가 연동됩니다.">
      <div style={{ display: "grid", gap: 10 }}>
        {rows.slice().reverse().map((r, i) => (
          <div key={i} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 700, color: INK }}>{r.treatment} · <span style={{ color: SUB, fontWeight: 500 }}>{r.hospital}</span></div>
              <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} fill={n <= r.rating ? STAR : "none"} color={n <= r.rating ? STAR : "#cfd8dd"} />)}</div>
            </div>
            <div style={{ fontSize: 13.5, color: SUB, marginTop: 8, lineHeight: 1.5 }}>{r.text}</div>
          </div>
        ))}
      </div>
      {!rows.length && <Empty text="리뷰가 없습니다. 고객 사이트 마이페이지에서 방문 완료 예약에 리뷰를 작성해 보세요." />}
    </Section>
  );
}

function AdminHospitals() {
  const [rows, setRows] = useState(() => ls.get("korecare_hospitals", []));
  const [form, setForm] = useState({ name: "", category: "Oncology", address: "" });
  const save = (next) => { setRows(next); ls.set("korecare_hospitals", next); };
  const toggle = (id) => save(rows.map((h) => (h.id === id ? { ...h, visible: !h.visible } : h)));
  const add = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    save([...rows, { id: "h_" + Date.now(), category: form.category, name: form.name, address: form.address, visible: true }]);
    setForm({ name: "", category: form.category, address: "" });
  };
  const inS = { border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, outline: "none" };
  return (
    <Section title="병원 관리" desc="노출여부 토글로 고객 사이트 노출을 제어합니다. 병원 등록 시 웹사이트에 연동됩니다(정의서 자동화).">
      <form onSubmit={add} style={{ ...card, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 }}>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>병원명</span><input style={inS} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="병원명" /></label>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>진료과(카테고리)</span>
          <select style={inS} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Oncology</option><option>Orthopedics & Spine</option><option>Cardiac Surgery</option><option>Full Health Screening</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 4 }}><span style={lblS}>주소(지역)</span><input style={inS} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Seoul, ..." /></label>
        <button type="submit" style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={15} /> 병원 등록</button>
      </form>
      <Table head={["병원 ID", "카테고리", "병원명", "주소", "노출"]}>
        {rows.map((h) => (
          <tr key={h.id} style={trS}>
            <Td><span style={{ fontFamily: "monospace", fontSize: 12, color: MUTE }}>{h.id}</span></Td>
            <Td>{h.category}</Td><Td>{h.name}</Td><Td>{h.address}</Td>
            <Td>
              <button onClick={() => toggle(h.id)} style={{ border: `1px solid ${h.visible ? SUCCESS : LINE}`, background: h.visible ? "#eafaf2" : "#fff", color: h.visible ? "#1f9d6b" : MUTE, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                {h.visible ? <Eye size={13} /> : <EyeOff size={13} />} {h.visible ? "노출" : "숨김"}
              </button>
            </Td>
          </tr>
        ))}
      </Table>
    </Section>
  );
}

/* ============================== Hospital Manager ============================== */
export function HospitalApp() {
  const [tab, setTab] = useState("reservations");
  seedAdmin();
  const tabs = [
    { id: "reservations", label: "글로벌 예약", icon: Calendar },
    { id: "settlements", label: "정산 내역", icon: DollarSign },
  ];
  return (
    <Shell kind="hospital" tabs={tabs} tab={tab} setTab={setTab}>
      {tab === "reservations" && <HospitalReservations />}
      {tab === "settlements" && <HospitalSettlements />}
    </Shell>
  );
}

function HospitalReservations() {
  const [rows, setRows] = useState(() => ls.get("korecare_bookings", []));
  const [amts, setAmts] = useState({});
  const confirmed = rows.filter((b) => b.stage >= 2); // 어드민에서 예약확정된 건만 노출
  const submitAmount = (b) => {
    const amount = parseInt(amts[b.id], 10);
    if (!amount) return;
    const settlements = ls.get("korecare_settlements", []);
    settlements.push({ bookingId: b.id, hospital: b.hospital, treatment: b.treatment, patientName: b.patientName, amount, status: "정산 요청", createdAt: new Date().toISOString() });
    ls.set("korecare_settlements", settlements);
    const next = rows.map((x) => (x.id === b.id ? { ...x, settled: true } : x));
    setRows(next); ls.set("korecare_bookings", next);
    setAmts((p) => ({ ...p, [b.id]: "" }));
  };
  const inS = { width: 120, border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, outline: "none" };
  return (
    <Section title="글로벌 예약" desc="운영자 어드민에서 '예약 확정' 이상으로 변경된 예약만 노출됩니다. 금액을 입력하면 어드민 정산 내역에 반영됩니다.">
      <Table head={["환자", "시술", "옵션", "방문 희망", "확정일시", "정산 금액 입력"]}>
        {confirmed.slice().reverse().map((b) => (
          <tr key={b.id} style={trS}>
            <Td>{b.patientName}</Td><Td>{b.treatment}</Td><Td>{b.option || "—"}</Td>
            <Td>{b.visit1?.date ? `${b.visit1.date} ${b.visit1.slot}` : "—"}</Td>
            <Td>{b.confirmedAt || "—"}</Td>
            <Td>
              {b.settled ? <Badge bg="#eafaf2" fg="#1f9d6b">정산 요청됨</Badge> : (
                <span style={{ display: "inline-flex", gap: 6 }}>
                  <input type="number" placeholder="₩/$" value={amts[b.id] || ""} onChange={(e) => setAmts((p) => ({ ...p, [b.id]: e.target.value }))} style={inS} />
                  <button onClick={() => submitAmount(b)} style={{ ...btn(TEAL, "#fff"), padding: "8px 12px", fontSize: 13 }}>등록</button>
                </span>
              )}
            </Td>
          </tr>
        ))}
      </Table>
      {!confirmed.length && <Empty text="확정된 글로벌 예약이 없습니다. 운영자 어드민 → 예약 관리에서 단계를 '예약 확정'으로 변경해 보세요." />}
    </Section>
  );
}

function HospitalSettlements() {
  const rows = ls.get("korecare_settlements", []);
  return (
    <Section title="정산 내역" desc="우리 병원이 등록한 정산 요청 내역입니다.">
      <Table head={["시술", "환자", "정산 금액", "상태", "요청일"]}>
        {rows.slice().reverse().map((s, i) => (
          <tr key={i} style={trS}>
            <Td>{s.treatment}</Td><Td>{s.patientName}</Td>
            <Td><b style={{ color: TEAL }}>{money(s.amount)}</b></Td>
            <Td><Badge bg={TEAL_SOFT} fg={TEAL}>{s.status}</Badge></Td>
            <Td>{(s.createdAt || "").slice(0, 10)}</Td>
          </tr>
        ))}
      </Table>
      {!rows.length && <Empty text="정산 내역이 없습니다." />}
    </Section>
  );
}

/* ------------------------------- primitives ------------------------------- */
const card = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 };
const trS = { borderBottom: `1px solid ${LINE}` };
const selS = { border: `1px solid ${LINE}`, borderRadius: 8, padding: "6px 8px", fontSize: 13, outline: "none", background: "#fff" };
const lblS = { fontSize: 12, fontWeight: 600, color: SUB };
function Section({ title, desc, children }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 4px" }}>{title}</h1>
      {desc && <p style={{ fontSize: 13, color: SUB, margin: "0 0 18px", maxWidth: 720, lineHeight: 1.5 }}>{desc}</p>}
      {children}
    </div>
  );
}
function Table({ head, children }) {
  return (
    <div style={{ ...card, padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead><tr>{head.map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: MUTE, fontWeight: 700, fontSize: 12, borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Td({ children }) { return <td style={{ padding: "11px 14px", color: INK, verticalAlign: "middle" }}>{children}</td>; }
function Badge({ bg, fg, children }) { return <span style={{ background: bg, color: fg, padding: "3px 9px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>; }
function Empty({ text }) { return <div style={{ ...card, textAlign: "center", color: MUTE, fontSize: 13.5, padding: 28, marginTop: 12 }}>{text}</div>; }
function nowStr() { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
