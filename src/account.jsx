/* =========================================================================
   account.jsx — 마이페이지 계정 허브 (요구사항정의서 [New] 고객 화면 반영)
   탭: 예약내역(리스트/상세 스테퍼·취소요청) · 장바구니 · 고객정보 · 리뷰작성
   전부 프론트 mock(localStorage). 백엔드 연동은 docs/SERVER-REQUEST.md 범위.
   client-only (App.jsx 의 MyPageRoute 가 <ClientOnly> 로 감싼다).
   ========================================================================= */
import React, { useState, useEffect, useRef } from "react";
import {
  User, Calendar, ShoppingCart, LogOut, Trash2, Star, CheckCircle2,
  Clock, Building2, ArrowLeft, XCircle, ChevronRight,
} from "lucide-react";
import { BLUE as TEAL, BLUE_SOFT as TEAL_SOFT, ACCENT, ACCENT_SOFT, INK, SUB, MUTE, LINE, BG_SOFT, SUCCESS, STAR, btn, money } from "./theme.js";
import { trackEvent } from "./analytics.js";
import { GOOGLE_CLIENT_ID } from "./config.js";

/* ----------------------------- storage helpers ----------------------------- */
const ls = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } },
  set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (_) {} },
};

/* 예약 진행 단계 (요구사항정의서: 예약요청>조율중>예약확정>방문완료>리뷰작성) */
const STAGES = [
  { key: "requested", en: "Requested", ko: "예약 요청" },
  { key: "coordinating", en: "Coordinating", ko: "조율중" },
  { key: "confirmed", en: "Confirmed", ko: "예약 확정" },
  { key: "visited", en: "Visited", ko: "방문 완료" },
  { key: "review", en: "Reviewed", ko: "리뷰 작성" },
];

/* 데모 시드 (비어있을 때만) — [New] 기능을 바로 확인할 수 있도록 */
function seedIfEmpty() {
  if (!ls.get("korecare_bookings", null)) {
    ls.set("korecare_bookings", [
      {
        id: "bk_demo1", patientName: "Jane Doe", hospital: "Seoul National Cancer Center",
        treatment: "Proton Therapy", option: "", amount: 52000, listPrice: 145000,
        visit1: { date: "2026-07-15", slot: "AM" }, visit2: { date: "2026-07-22", slot: "PM" },
        confirmedAt: null, stage: 1, createdAt: "2026-06-10T00:00:00.000Z", reviewed: false, cancelRequested: false,
      },
      {
        id: "bk_demo2", patientName: "Jane Doe", hospital: "Asan Health Promotion Ctr.",
        treatment: "Executive Deep Screening", option: "Whole-body MRI + PET-CT", amount: 2200, listPrice: 8500,
        visit1: { date: "2026-06-02", slot: "AM" }, visit2: { date: "", slot: "" },
        confirmedAt: "2026-06-01 10:00", stage: 3, createdAt: "2026-05-20T00:00:00.000Z", reviewed: false, cancelRequested: false,
      },
    ]);
  }
  if (!ls.get("korecare_cart", null)) {
    ls.set("korecare_cart", [
      {
        id: "ct_demo1", category: "Oncology", hospital: "Asan Medical Oncology Inst.",
        hospitalIntro: "Asia's largest cancer caseload, JCI-accredited.",
        treatment: "Targeted Therapy Track", treatmentIntro: "Precision drugs matched to tumor genetics.",
        listPrice: 168000, price: 61000, qty: 1, checked: true,
      },
    ]);
  }
}

/* ============================== AccountHub ============================== */
export default function AccountHub({ onBook }) {
  const [user, setUser] = useState(() => ls.get("korecare_user", null));
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState("reservations");

  useEffect(() => { if (user) seedIfEmpty(); }, [user]);

  const signIn = (u) => {
    const profile = { email: "guest@korecare.example", ...u };
    ls.set("korecare_user", profile); setUser(profile);
    trackEvent("login", { provider: u.provider || "email" });
  };
  const login = (e) => { e.preventDefault(); signIn({ email: email || "guest@korecare.example", provider: "email" }); };
  const logout = () => { localStorage.removeItem("korecare_user"); setUser(null); };

  if (!user) return <LoginGate email={email} setEmail={setEmail} onSubmit={login} onGoogle={signIn} />;

  const tabs = [
    { id: "reservations", label: "My Reservations", icon: Calendar },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <div style={{ marginTop: 28, maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: 0 }}>My Page</h1>
          <div style={{ fontSize: 13.5, color: SUB, marginTop: 2 }}>{user.email}</div>
        </div>
        <button onClick={logout} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}`, display: "inline-flex", alignItems: "center", gap: 6 }}><LogOut size={14} /> Log out</button>
      </div>

      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${LINE}`, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((tb) => {
          const on = tab === tb.id; const Icon = tb.icon;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              border: "none", borderBottom: on ? `2px solid ${TEAL}` : "2px solid transparent",
              background: "transparent", color: on ? TEAL : SUB, fontWeight: on ? 700 : 500,
              cursor: "pointer", padding: "10px 14px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 7, marginBottom: -1,
            }}><Icon size={15} /> {tb.label}</button>
          );
        })}
      </div>

      {tab === "reservations" && <ReservationsTab onBook={onBook} />}
      {tab === "cart" && <CartTab onBook={onBook} />}
      {tab === "profile" && <ProfileTab />}
    </div>
  );
}

/* ------------------------------ Login gate ------------------------------ */
function LoginGate({ email, setEmail, onSubmit, onGoogle }) {
  const inputS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "11px 12px", fontSize: 14, color: INK, outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ marginTop: 40, maxWidth: 420, margin: "40px auto 0" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}><User size={15} /> Sign in / Sign up</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>Welcome to KoreCare</h1>
      <p style={{ fontSize: 14, color: SUB, margin: "0 0 18px" }}>Continue with Google, or use email to manage reservations, cart and your profile.</p>
      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 22 }}>
        <GoogleSignIn onUser={onGoogle} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: LINE }} /><span style={{ fontSize: 12, color: MUTE }}>or</span><div style={{ flex: 1, height: 1, background: LINE }} />
        </div>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <div><label style={lblS}>Email</label><input type="email" style={inputS} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></div>
          <div><label style={lblS}>Password</label><input type="password" style={inputS} placeholder="••••••••" /></div>
          <button type="submit" style={{ ...btn(TEAL, "#fff"), width: "100%" }}>Continue with email</button>
          <div style={{ fontSize: 11.5, color: MUTE, textAlign: "center" }}>Prototype — Google uses real sign-in when configured, otherwise demo (mock).</div>
        </form>
      </div>
    </div>
  );
}

/* Google Identity Services — VITE_GOOGLE_CLIENT_ID 설정 시 실제 로그인, 미설정 시 데모 폴백 */
function decodeJwt(token) {
  try {
    const b = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(b).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
  } catch { return {}; }
}
function GoogleSignIn({ onUser }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === "undefined") return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp) => { const p = decodeJwt(resp.credential); onUser({ email: p.email, name: p.name, picture: p.picture, provider: "google" }); },
      });
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", width: 330, text: "continue_with", shape: "rectangular" });
    };
    if (window.google?.accounts?.id) render();
    else { const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true; s.onload = render; document.head.appendChild(s); }
    return () => { cancelled = true; };
  }, [onUser]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" onClick={() => onUser({ email: "jane.kim@gmail.com", name: "Jane Kim", provider: "google-demo" })}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: `1px solid ${LINE}`, background: "#fff", color: INK, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        <GoogleIcon /> Continue with Google <span style={{ fontSize: 11, color: MUTE, fontWeight: 500 }}>(demo)</span>
      </button>
    );
  }
  return <div ref={ref} style={{ display: "flex", justifyContent: "center" }} />;
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.4 0-11.8-3.8-13.7-9.4l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
const lblS = { fontSize: 12.5, fontWeight: 600, color: SUB, marginBottom: 5, display: "block" };

/* ============================ Reservations tab ============================ */
function ReservationsTab({ onBook }) {
  const [bookings, setBookings] = useState(() => { seedIfEmpty(); return ls.get("korecare_bookings", []); });
  const [selected, setSelected] = useState(null);   // booking id for detail
  const [reviewFor, setReviewFor] = useState(null);  // booking id for review

  const save = (next) => { setBookings(next); ls.set("korecare_bookings", next); };
  const update = (id, patch) => save(bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  if (reviewFor) {
    const b = bookings.find((x) => x.id === reviewFor);
    return <WriteReview booking={b} onCancel={() => setReviewFor(null)} onDone={() => { update(reviewFor, { reviewed: true, stage: 4 }); setReviewFor(null); setSelected(null); }} />;
  }
  if (selected) {
    const b = bookings.find((x) => x.id === selected);
    return <ReservationDetail booking={b} onBack={() => setSelected(null)} onCancel={() => update(selected, { cancelRequested: true })} onReview={() => setReviewFor(selected)} />;
  }

  if (!bookings.length) return (
    <Empty icon={Calendar} text="No reservations yet." cta="Book a consultation" onCta={onBook} />
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {bookings.slice().reverse().map((b) => (
        <ReservationCard key={b.id} b={b} onOpen={() => setSelected(b.id)} onReview={() => setReviewFor(b.id)} />
      ))}
    </div>
  );
}

function StageBadge({ stage, cancelRequested }) {
  if (cancelRequested) return <Pill bg={ACCENT_SOFT} fg={ACCENT}>Cancellation requested</Pill>;
  const s = STAGES[stage] || STAGES[0];
  const done = stage >= 2;
  return <Pill bg={done ? "#eafaf2" : TEAL_SOFT} fg={done ? "#1f9d6b" : TEAL}>{s.en}</Pill>;
}

function ReservationCard({ b, onOpen, onReview }) {
  return (
    <div style={card()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div style={{ minWidth: 200, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StageBadge stage={b.stage} cancelRequested={b.cancelRequested} />
            <span style={{ fontWeight: 700, color: INK }}>{b.treatment}</span>
          </div>
          <div style={{ fontSize: 13, color: SUB, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}><Building2 size={13} /> {b.hospital}</div>
          <div style={{ fontSize: 13, color: SUB, marginTop: 3 }}>Patient: <b style={{ color: INK }}>{b.patientName}</b></div>
          <div style={{ fontSize: 13, color: SUB, marginTop: 3 }}>
            Confirmed: <b style={{ color: b.confirmedAt ? INK : MUTE }}>{b.confirmedAt || "TBD"}</b>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: MUTE, textDecoration: "line-through" }}>{money(b.listPrice)}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: TEAL }}>{money(b.amount)}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
            {b.stage >= 3 && !b.reviewed && (
              <button onClick={onReview} style={{ ...btn(ACCENT, "#fff"), padding: "8px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}><Star size={14} /> Write review</button>
            )}
            <button onClick={onOpen} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}`, padding: "8px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>Details <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationDetail({ booking: b, onBack, onCancel, onReview }) {
  if (!b) return null;
  const canCancel = b.stage < 3 && !b.cancelRequested; // 방문완료 제외 취소 가능
  return (
    <div>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back to reservations</button>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "10px 0 4px" }}>{b.treatment}</h2>
      <div style={{ fontSize: 13.5, color: SUB, marginBottom: 18, display: "inline-flex", alignItems: "center", gap: 6 }}><Building2 size={14} /> {b.hospital}</div>

      <Stepper stage={b.stage} />

      <div style={{ ...card(), marginTop: 18, display: "grid", gap: 10 }}>
        <Row label="Patient" value={b.patientName} />
        <Row label="Treatment" value={b.treatment} />
        {b.option && <Row label="Option" value={b.option} />}
        <Row label="Price" value={<><span style={{ textDecoration: "line-through", color: MUTE, marginRight: 8 }}>{money(b.listPrice)}</span><b style={{ color: TEAL }}>{money(b.amount)}</b></>} />
        <Row label="Preferred visit 1" value={b.visit1?.date ? `${b.visit1.date} · ${b.visit1.slot}` : "—"} />
        <Row label="Preferred visit 2" value={b.visit2?.date ? `${b.visit2.date} · ${b.visit2.slot}` : "—"} />
        <Row label="Confirmed date & time" value={b.confirmedAt || <span style={{ color: MUTE }}>TBD (not confirmed yet)</span>} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        {b.stage >= 3 && !b.reviewed && (
          <button onClick={onReview} style={{ ...btn(ACCENT, "#fff"), display: "inline-flex", alignItems: "center", gap: 6 }}><Star size={15} /> Write a review</button>
        )}
        {canCancel ? (
          <button onClick={onCancel} style={{ ...btn("#fff", ACCENT), border: `1px solid ${ACCENT}`, display: "inline-flex", alignItems: "center", gap: 6 }}><XCircle size={15} /> Request cancellation</button>
        ) : b.cancelRequested ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ACCENT_SOFT, color: ACCENT, padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}><XCircle size={15} /> Cancellation requested — our team will follow up.</span>
        ) : null}
      </div>
    </div>
  );
}

function Stepper({ stage }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
      {STAGES.map((s, i) => {
        const done = i < stage, current = i === stage;
        const color = done ? SUCCESS : current ? TEAL : "#cfd8dd";
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STAGES.length - 1 ? 1 : "0 0 auto", minWidth: 86 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: done || current ? color : "#fff", border: `2px solid ${color}`, color: done || current ? "#fff" : color, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800 }}>
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: current ? 800 : 600, color: current ? TEAL : SUB, whiteSpace: "nowrap" }}>{s.en}</div>
            </div>
            {i < STAGES.length - 1 && <div style={{ height: 2, background: i < stage ? SUCCESS : "#e3e8ea", flex: 1, margin: "0 4px", marginTop: -18 }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Write review ------------------------------ */
function WriteReview({ booking: b, onCancel, onDone }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const reviews = ls.get("korecare_reviews", []);
    reviews.push({ hospital: b.hospital, treatment: b.treatment, rating, text, createdAt: new Date().toISOString() });
    ls.set("korecare_reviews", reviews);
    trackEvent("review_submit", { rating });
    onDone();
  };
  if (!b) return null;
  return (
    <div style={{ maxWidth: 560 }}>
      <button onClick={onCancel} style={backBtn}><ArrowLeft size={16} /> Back</button>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "10px 0 4px" }}>Write a review</h2>
      <div style={{ fontSize: 13.5, color: SUB, marginBottom: 18 }}>{b.treatment} · {b.hospital}</div>
      <form onSubmit={submit} style={{ ...card(), display: "grid", gap: 16 }}>
        <div>
          <label style={lblS}>Rating</label>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2 }}>
                <Star size={26} fill={n <= rating ? STAR : "none"} color={n <= rating ? STAR : "#cfd8dd"} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={lblS}>Your experience</label>
          <textarea required rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="How was your treatment journey?" style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "11px 12px", fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
        </div>
        <button type="submit" style={{ ...btn(TEAL, "#fff"), width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CheckCircle2 size={16} /> Submit review</button>
      </form>
    </div>
  );
}

/* ================================ Cart tab ================================ */
function CartTab({ onBook }) {
  const [items, setItems] = useState(() => { seedIfEmpty(); return ls.get("korecare_cart", []); });
  const save = (next) => { setItems(next); ls.set("korecare_cart", next); };
  const setQty = (id, qty) => save(items.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)));
  const toggle = (id) => save(items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  const remove = (id) => save(items.filter((it) => it.id !== id));

  if (!items.length) return <Empty icon={ShoppingCart} text="Your cart is empty." cta="Browse programs" onCta={onBook} />;

  const selected = items.filter((it) => it.checked);
  const total = selected.reduce((s, it) => s + it.price * it.qty, 0);
  const totalList = selected.reduce((s, it) => s + it.listPrice * it.qty, 0);

  const checkout = () => {
    // mock: 선택 항목 → 예약내역(예약요청)으로 생성
    const bookings = ls.get("korecare_bookings", []);
    selected.forEach((it) => {
      bookings.push({
        id: "bk_" + Math.abs(hash(it.id + it.qty)), patientName: "You", hospital: it.hospital,
        treatment: it.treatment, option: "", amount: it.price * it.qty, listPrice: it.listPrice * it.qty,
        visit1: { date: "", slot: "" }, visit2: { date: "", slot: "" }, confirmedAt: null,
        stage: 0, createdAt: new Date().toISOString(), reviewed: false, cancelRequested: false,
      });
    });
    ls.set("korecare_bookings", bookings);
    save(items.filter((it) => !it.checked));
    trackEvent("cart_checkout", { count: selected.length });
    onBook && onBook();
  };

  return (
    <div>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((it) => (
          <div key={it.id} style={card()}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
              <input type="checkbox" checked={it.checked} onChange={() => toggle(it.id)} style={{ marginTop: 4, width: 18, height: 18, accentColor: TEAL }} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <Pill bg={TEAL_SOFT} fg={TEAL}>{it.category}</Pill>
                <div style={{ fontWeight: 700, color: INK, marginTop: 6 }}>{it.hospital}</div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{it.hospitalIntro}</div>
                <div style={{ fontWeight: 700, color: TEAL, marginTop: 8 }}>{it.treatment}</div>
                <div style={{ fontSize: 12.5, color: SUB, marginTop: 2 }}>{it.treatmentIntro}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: MUTE }}>List {money(it.listPrice)}</div>
                <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>SafeDoc price</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEAL }}>{money(it.price)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                  <label style={{ fontSize: 12, color: SUB }}>Qty</label>
                  <input type="number" min={1} value={it.qty} onChange={(e) => setQty(it.id, parseInt(e.target.value || "1", 10))} style={{ width: 56, border: `1px solid ${LINE}`, borderRadius: 8, padding: "6px 8px", fontSize: 14, textAlign: "center" }} />
                  <button onClick={() => remove(it.id)} title="Remove" style={{ border: `1px solid ${LINE}`, background: "#fff", color: ACCENT, borderRadius: 8, padding: 7, cursor: "pointer", display: "grid", placeItems: "center" }}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...card(), marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: MUTE, textDecoration: "line-through" }}>{money(totalList)}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: INK }}>{money(total)} <span style={{ fontSize: 13, fontWeight: 600, color: SUCCESS }}>· save {money(totalList - total)}</span></div>
          <div style={{ fontSize: 12, color: SUB }}>{selected.length} item(s) selected</div>
        </div>
        <button onClick={checkout} disabled={!selected.length} style={{ ...btn(selected.length ? TEAL : "#cfd8dd", "#fff"), display: "inline-flex", alignItems: "center", gap: 8, cursor: selected.length ? "pointer" : "not-allowed" }}>
          <CheckCircle2 size={16} /> Request reservation
        </button>
      </div>
    </div>
  );
}

/* ============================== Profile tab ============================== */
const EMPTY_PROFILE = {
  firstName: "", middleName: "", lastName: "", email: "", phone: "", dob: "", gender: "",
  interpreterLang: "", nationality: "", koreanInsured: "", passportNumber: "",
  medicalHistory: "", medications: "", allergies: "", referralCode: "",
};
function ProfileTab() {
  const [p, setP] = useState(() => ls.get("korecare_profile", EMPTY_PROFILE));
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setP((prev) => ({ ...prev, [k]: v })); setSaved(false); };
  const submit = (e) => { e.preventDefault(); ls.set("korecare_profile", p); setSaved(true); trackEvent("profile_save", {}); };
  const inputS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", background: "#fff" };

  return (
    <form onSubmit={submit} style={{ ...card(), display: "grid", gap: 16 }}>
      <div style={{ fontSize: 13, color: SUB }}>Complete your profile so coordinators can match covered programs and confirm coverage.</div>
      <Grid3>
        <Field label="First name"><input style={inputS} value={p.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
        <Field label="Middle name"><input style={inputS} value={p.middleName} onChange={(e) => set("middleName", e.target.value)} /></Field>
        <Field label="Last name"><input style={inputS} value={p.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
      </Grid3>
      <Grid3>
        <Field label="Email"><input type="email" style={inputS} value={p.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Phone"><input style={inputS} value={p.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Date of birth"><input type="date" style={inputS} value={p.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
      </Grid3>
      <Grid3>
        <Field label="Gender">
          <select style={inputS} value={p.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">—</option><option>Female</option><option>Male</option><option>Other</option>
          </select>
        </Field>
        <Field label="Interpreter language"><input style={inputS} value={p.interpreterLang} onChange={(e) => set("interpreterLang", e.target.value)} placeholder="e.g. English" /></Field>
        <Field label="Nationality">
          <select style={inputS} value={p.nationality} onChange={(e) => set("nationality", e.target.value)}>
            <option value="">—</option><option>United States</option><option>South Korea</option><option>Other</option>
          </select>
        </Field>
      </Grid3>
      {/* 국적 = 한국 → 한국건강보험 가입자 여부 (요구사항정의서) */}
      {p.nationality === "South Korea" && (
        <Field label="Korean National Health Insurance member?">
          <div style={{ display: "flex", gap: 16 }}>
            {["Yes", "No"].map((v) => (
              <label key={v} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: SUB }}>
                <input type="radio" name="koreanInsured" checked={p.koreanInsured === v} onChange={() => set("koreanInsured", v)} style={{ accentColor: TEAL }} /> {v}
              </label>
            ))}
          </div>
        </Field>
      )}
      <Grid3>
        <Field label="Passport number"><input style={inputS} value={p.passportNumber} onChange={(e) => set("passportNumber", e.target.value)} /></Field>
        <Field label="Passport copy"><input type="file" style={{ ...inputS, padding: "8px 10px" }} /></Field>
        <Field label="Referral code"><input style={inputS} value={p.referralCode} onChange={(e) => set("referralCode", e.target.value)} /></Field>
      </Grid3>
      <Field label="Medical / surgical history"><textarea rows={2} style={{ ...inputS, resize: "vertical", fontFamily: "inherit" }} value={p.medicalHistory} onChange={(e) => set("medicalHistory", e.target.value)} /></Field>
      <Grid3>
        <Field label="Current medications"><input style={inputS} value={p.medications} onChange={(e) => set("medications", e.target.value)} /></Field>
        <Field label="Allergies"><input style={inputS} value={p.allergies} onChange={(e) => set("allergies", e.target.value)} /></Field>
        <div />
      </Grid3>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" style={{ ...btn(TEAL, "#fff") }}>Save profile</button>
        {saved && <span style={{ fontSize: 13, color: SUCCESS, display: "inline-flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={15} /> Saved</span>}
      </div>
    </form>
  );
}

/* ------------------------------- primitives ------------------------------- */
const card = () => ({ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 });
const backBtn = { border: "none", background: "transparent", cursor: "pointer", color: SUB, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, padding: "4px 0" };
function Pill({ bg, fg, children }) { return <span style={{ display: "inline-flex", alignItems: "center", background: bg, color: fg, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>{children}</span>; }
function Row({ label, value }) { return <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}><span style={{ color: MUTE }}>{label}</span><span style={{ color: INK, fontWeight: 600, textAlign: "right" }}>{value}</span></div>; }
function Field({ label, children }) { return <label style={{ display: "block" }}><span style={lblS}>{label}</span>{children}</label>; }
function Grid3({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="acct-grid3">{children}<style>{`@media(max-width:640px){.acct-grid3{grid-template-columns:1fr!important}}`}</style></div>; }
function Empty({ icon: Icon, text, cta, onCta }) {
  return (
    <div style={{ background: "#fff", border: `1px dashed ${LINE}`, borderRadius: 14, padding: 36, textAlign: "center", color: MUTE }}>
      <Icon size={28} style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 14, marginBottom: 14 }}>{text}</div>
      {cta && <button onClick={onCta} style={{ ...btn(TEAL, "#fff") }}>{cta}</button>}
    </div>
  );
}
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }
