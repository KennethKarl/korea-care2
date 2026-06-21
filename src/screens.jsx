/* =========================================================================
   screens.jsx — 요구사항정의서 고객 웹사이트 화면 (self-contained)
   시술 리스트/상세 · 리뷰 · 비포/애프터 · 블로그 · 예약 신청 · 마이페이지(로그인)
   ========================================================================= */
import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Star, MapPin, Clock, Check, ChevronRight, Calendar,
  CheckCircle2, Stethoscope, Target, ListChecks, AlertTriangle, Tag, User, LogOut,
} from "lucide-react";

import { BLUE as TEAL, BLUE_SOFT as TEAL_SOFT, INK, SUB, MUTE, LINE, ACCENT, STAR, txt, btn, money } from "./theme.js";
import { submitReservation } from "./api.js";
import { trackEvent } from "./analytics.js";

function PageHead({ icon: Icon, kicker, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
        <Icon size={15} /> {kicker}
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 15, color: SUB, margin: 0, lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}
function Stars({ rating, size = 13 }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Star size={size} fill="#f5a623" color="#f5a623" /><b style={{ color: INK }}>{rating}</b></span>;
}
function BackBtn({ onClick, label }) {
  return <button onClick={onClick} style={{ border: "none", background: "transparent", color: SUB, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, padding: "4px 0", marginBottom: 8 }}><ArrowLeft size={15} /> {label}</button>;
}

/* ============================ 시술 리스트 ============================ */
export function TreatmentsPage({ treatments, departments, lang, t, onOpen }) {
  const [cat, setCat] = useState("all");
  // 어드민 시술 관리(노출 토글) 반영: 숨김 처리된 시술은 클라이언트에서 제외
  const [all, setAll] = useState(treatments);
  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem("korecare_treatments") || "null");
      if (o?.length) { const hidden = new Set(o.filter((x) => x.visible === false).map((x) => x.id)); setAll(treatments.filter((tr) => !hidden.has(tr.id))); }
    } catch (_) {}
  }, [treatments]);
  // categories = departments that have at least one treatment
  const cats = departments.filter((d) => all.some((tr) => tr.deptIds.includes(d.id)));
  const list = cat === "all" ? all : all.filter((tr) => tr.deptIds.includes(cat));
  const chip = (active) => ({ border: active ? `1.5px solid ${TEAL}` : `1px solid ${LINE}`, background: active ? TEAL_SOFT : "#fff", color: active ? TEAL : SUB, borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" });
  return (
    <div style={{ marginTop: 28 }}>
      <PageHead icon={Stethoscope} kicker={t.nav.treatments} title={t.treatments.title} subtitle={t.treatments.subtitle} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <button onClick={() => setCat("all")} style={chip(cat === "all")}>{t.common.allCategories}</button>
        {cats.map((d) => <button key={d.id} onClick={() => setCat(d.id)} style={chip(cat === d.id)}>{d.name}</button>)}
      </div>
      <div style={{ fontSize: 13, color: MUTE, marginBottom: 12 }}>{list.length} {t.common.matched}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {list.map((tr) => (
          <button key={tr.id} onClick={() => onOpen(tr.id)} style={{ textAlign: "left", border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden", background: "#fff", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 150, background: `#dfe6e9 url(${tr.image}) center/cover` }} />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {tr.deptIds.map((id) => { const d = departments.find((x) => x.id === id); return d ? <span key={id} style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_SOFT, padding: "2px 8px", borderRadius: 20 }}>{d.name}</span> : null; })}
              </div>
              <div style={{ fontWeight: 700, color: INK, fontSize: 16 }}>{txt(tr.name, lang)}</div>
              <div style={{ fontSize: 13, color: SUB, lineHeight: 1.45, flex: 1 }}>{txt(tr.summary, lang)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: SUB, marginTop: 4 }}>
                <Stars rating={tr.rating} /> <span style={{ color: MUTE }}>({tr.reviews})</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {txt(tr.duration, lang)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
                <span><span style={{ fontSize: 11, color: MUTE }}>{t.common.from} </span><b style={{ fontSize: 18, color: TEAL }}>{money(tr.price)}</b></span>
                {tr.covered && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: TEAL }}><Check size={12} /> {t.common.covered}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================ 시술 상세 ============================ */
export function TreatmentDetail({ treatment: tr, departments, lang, t, onBack, onBook }) {
  if (!tr) return <div style={{ marginTop: 30, color: MUTE }}>Treatment not found. <button onClick={onBack} style={{ ...btn(TEAL_SOFT, TEAL) }}>{t.common.back}</button></div>;
  const Section = ({ icon: Icon, title, children }) => (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: INK, fontSize: 15, marginBottom: 8 }}><Icon size={17} color={TEAL} /> {title}</div>
      <div style={{ fontSize: 14, color: SUB, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ marginTop: 22, maxWidth: 900 }}>
      <BackBtn onClick={onBack} label={t.common.back} />
      <div style={{ position: "relative", height: 260, borderRadius: 16, overflow: "hidden", background: `#dfe6e9 url(${tr.image}) center/cover` }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(8,20,24,.6),rgba(8,20,24,0) 70%)" }} />
        <div style={{ position: "absolute", left: 20, bottom: 18, color: "#fff" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {tr.deptIds.map((id) => { const d = departments.find((x) => x.id === id); return d ? <span key={id} style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.22)", padding: "3px 9px", borderRadius: 20 }}>{d.name}</span> : null; })}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{txt(tr.name, lang)}</div>
          <div style={{ fontSize: 13.5, opacity: .95, display: "flex", gap: 12, marginTop: 4 }}>
            <span><Star size={13} fill="#f5a623" color="#f5a623" style={{ verticalAlign: "-2px" }} /> {tr.rating} ({tr.reviews})</span>
            <span><MapPin size={13} style={{ verticalAlign: "-2px" }} /> {tr.city}</span>
            <span><Clock size={13} style={{ verticalAlign: "-2px" }} /> {txt(tr.duration, lang)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
        <div style={{ flex: 2, minWidth: 300 }}>
          <p style={{ fontSize: 15, color: SUB, lineHeight: 1.6, margin: "0 0 16px" }}>{txt(tr.summary, lang)}</p>
          <Section icon={Stethoscope} title={t.treatments.recommendedFor}>{txt(tr.recommendedFor, lang)}</Section>
          <Section icon={Target} title={t.treatments.effects}>{txt(tr.effects, lang)}</Section>
          <Section icon={Clock} title={t.treatments.duration}>{txt(tr.duration_detail, lang)}</Section>
          <Section icon={ListChecks} title={t.treatments.steps}>
            <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
              {txt(tr.steps, lang).map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Section>
          <Section icon={AlertTriangle} title={t.treatments.cautions}>{txt(tr.cautions, lang)}</Section>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, position: "sticky", top: 80 }} className="treat-aside">
            <div style={{ fontSize: 11, color: MUTE }}>{t.treatments.usPrice}</div>
            <div style={{ fontSize: 14, color: MUTE, textDecoration: "line-through" }}>{money(tr.usPrice)}</div>
            <div style={{ fontSize: 11, color: MUTE, marginTop: 8 }}>{t.treatments.price}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: TEAL }}>{money(tr.price)}</div>
            <div style={{ fontSize: 12, color: "#1f9d6b", fontWeight: 700, marginBottom: 14 }}>{t.treatments.save} {money(tr.usPrice - tr.price)}</div>
            {tr.covered && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: TEAL_SOFT, color: TEAL, padding: "6px 10px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, marginBottom: 14 }}><Check size={13} /> {t.common.covered}</div>}
            <button onClick={() => onBook(tr.id)} style={{ ...btn(TEAL, "#fff"), width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{t.common.bookNow} <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:760px){.treat-aside{position:static!important}}`}</style>
    </div>
  );
}

/* ============================ 리뷰 ============================ */
export function ReviewsPage({ reviews, lang, t }) {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  return (
    <div style={{ marginTop: 28 }}>
      <PageHead icon={Star} kicker={t.nav.reviews} title={t.reviews.title} subtitle={t.reviews.subtitle} />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 18px", marginBottom: 18 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: TEAL }}>{avg}</span>
        <span><Stars rating={""} size={15} /><div style={{ fontSize: 12.5, color: MUTE }}>{reviews.length} {t.common.reviewsLabel}</div></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, color: INK }}>{r.author} <span style={{ fontSize: 12, color: MUTE, fontWeight: 400 }}>{r.country}</span></div>
              <span>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={13} fill="#f5a623" color="#f5a623" />)}</span>
            </div>
            <div style={{ fontSize: 12.5, color: TEAL, fontWeight: 600, marginTop: 4 }}>{r.treatment} · {r.hospital}</div>
            <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6, margin: "8px 0 0" }}>“{r.text}”</p>
            <div style={{ fontSize: 11.5, color: MUTE, marginTop: 10 }}>{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ 비포 / 애프터 ============================ */
export function BeforeAfterPage({ beforeAfter, lang, t }) {
  return (
    <div style={{ marginTop: 28 }}>
      <PageHead icon={ListChecks} kicker={t.nav.beforeafter} title={t.beforeafter.title} subtitle={t.beforeafter.subtitle} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {beforeAfter.map((b) => (
          <div key={b.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
              {[["before", b.before], ["after", b.after]].map(([k, src]) => (
                <div key={k} style={{ flex: 1, position: "relative", height: 180, background: `#dfe6e9 url(${src}) center/cover` }}>
                  <span style={{ position: "absolute", top: 8, left: 8, background: k === "before" ? "rgba(8,20,24,.7)" : TEAL, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{k === "before" ? t.beforeafter.before : t.beforeafter.after}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>{b.treatment}</div>
              <div style={{ fontSize: 12.5, color: TEAL, fontWeight: 600, marginTop: 2 }}>{b.hospital} · {b.weeks}</div>
              <p style={{ fontSize: 13, color: SUB, lineHeight: 1.5, margin: "8px 0 0" }}>{txt(b.note, lang)}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: MUTE, marginTop: 16 }}>* Prototype images for demonstration. Actual results vary by patient.</p>
    </div>
  );
}

/* ============================ 블로그 ============================ */
export function BlogPage({ blogPosts, lang, t, onOpen }) {
  // 어드민 블로그 CMS 반영: korecare_blogposts 오버레이(클라이언트)
  const [posts, setPosts] = useState(blogPosts);
  useEffect(() => { try { const o = JSON.parse(localStorage.getItem("korecare_blogposts") || "null"); if (o?.length) setPosts(o); } catch (_) {} }, [blogPosts]);
  return (
    <div style={{ marginTop: 28 }}>
      <PageHead icon={Tag} kicker={t.nav.blog} title={t.blog.title} subtitle={t.blog.subtitle} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {posts.map((p) => (
          <button key={p.id} onClick={() => onOpen(p.id)} style={{ textAlign: "left", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 160, background: `#dfe6e9 url(${p.cover}) center/cover` }} />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_SOFT, padding: "2px 8px", borderRadius: 20 }}>{p.tag}</span>
                <span style={{ fontSize: 11.5, color: MUTE }}>{p.date}</span>
              </div>
              <div style={{ fontWeight: 700, color: INK, fontSize: 16, lineHeight: 1.3 }}>{txt(p.title, lang)}</div>
              <div style={{ fontSize: 13, color: SUB, lineHeight: 1.5, flex: 1 }}>{txt(p.excerpt, lang)}</div>
              <span style={{ fontSize: 13, color: TEAL, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>{t.blog.readMore} <ChevronRight size={14} /></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
export function BlogPostPage({ post, lang, t, onBack }) {
  if (!post) return <div style={{ marginTop: 30, color: MUTE }}>Post not found.</div>;
  return (
    <div style={{ marginTop: 22, maxWidth: 760 }}>
      <BackBtn onClick={onBack} label={t.blog.title} />
      <div style={{ height: 280, borderRadius: 16, background: `#dfe6e9 url(${post.cover}) center/cover`, marginBottom: 18 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_SOFT, padding: "2px 8px", borderRadius: 20 }}>{post.tag}</span>
        <span style={{ fontSize: 12, color: MUTE }}>{post.date}</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "0 0 14px", lineHeight: 1.25 }}>{txt(post.title, lang)}</h1>
      <p style={{ fontSize: 16, color: SUB, lineHeight: 1.7 }}>{txt(post.body, lang)}</p>
    </div>
  );
}

/* ============================ 예약 신청 ============================ */
export function ReservationPage({ treatments, lang, t, prefillTreatmentId, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", country: "", treatmentId: prefillTreatmentId || "", date: "", message: "" });
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    const tr = treatments.find((x) => x.id === form.treatmentId);
    const payload = {
      ...form,
      id: "bk_" + Date.now(),
      patientName: form.name,
      treatment: tr ? txt(tr.name, lang) : "",
      hospital: "",
      amount: tr?.price ?? 0,
      listPrice: tr?.usPrice ?? 0,
      visit1: { date: form.date || "", slot: "" },
      visit2: { date: "", slot: "" },
      confirmedAt: null,
      stage: 0,
      reviewed: false,
      cancelRequested: false,
      createdAt: new Date().toISOString(),
    };
    // 로컬 캐시(어드민 마이페이지 표시용) — 백엔드 미연동 시에도 UX 유지
    try {
      const key = "korecare_bookings";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push(payload);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch (_) {}
    // 세이프닥 서버로 예약 전송 (VITE_API_BASE 미설정 시 api.js 가 mock 처리)
    try { await submitReservation(payload); } catch (_) {}
    trackEvent("reservation_submit", { treatment: form.treatmentId });
    setDone(true);
    onCreated && onCreated();
    window.scrollTo({ top: 0 });
  };
  const inputS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", background: "#fff" };
  const lbl = { fontSize: 12.5, fontWeight: 600, color: SUB, marginBottom: 5, display: "block" };
  if (done) return (
    <div style={{ marginTop: 40, maxWidth: 520, margin: "40px auto 0", textAlign: "center", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 36 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: TEAL_SOFT, color: TEAL, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><CheckCircle2 size={30} /></div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 8px" }}>{t.reservation.successTitle}</h2>
      <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6 }}>{t.reservation.successBody}</p>
    </div>
  );
  return (
    <div style={{ marginTop: 28, maxWidth: 640 }}>
      <PageHead icon={Calendar} kicker={t.nav.book} title={t.reservation.title} subtitle={t.reservation.subtitle} />
      <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 22, display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="resv-row">
          <div><label style={lbl}>{t.reservation.name}</label><input required style={inputS} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label style={lbl}>{t.reservation.email}</label><input required type="email" style={inputS} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label style={lbl}>{t.reservation.country}</label><input style={inputS} value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
          <div><label style={lbl}>{t.reservation.date}</label><input type="date" style={inputS} value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
        </div>
        <div><label style={lbl}>{t.reservation.treatment}</label>
          <select style={inputS} value={form.treatmentId} onChange={(e) => set("treatmentId", e.target.value)}>
            <option value="">—</option>
            {treatments.map((tr) => <option key={tr.id} value={tr.id}>{txt(tr.name, lang)}</option>)}
          </select>
        </div>
        <div><label style={lbl}>{t.reservation.message}</label><textarea rows={4} style={{ ...inputS, resize: "vertical" }} value={form.message} onChange={(e) => set("message", e.target.value)} /></div>
        <button type="submit" style={{ ...btn(TEAL, "#fff"), width: "100%" }}>{t.reservation.submit}</button>
      </form>
      <style>{`@media(max-width:560px){.resv-row{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ============================ 마이페이지 / 로그인 ============================ */
export function MyPage({ lang, t, onBook }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("korecare_user") || "null"); } catch { return null; } });
  const [email, setEmail] = useState("");
  const login = (e) => { e.preventDefault(); const u = { email: email || "guest@korecare.example" }; localStorage.setItem("korecare_user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("korecare_user"); setUser(null); };
  const bookings = (() => { try { return JSON.parse(localStorage.getItem("korecare_bookings") || "[]"); } catch { return []; } })();
  const inputS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: INK, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 12.5, fontWeight: 600, color: SUB, marginBottom: 5, display: "block" };

  if (!user) return (
    <div style={{ marginTop: 36, maxWidth: 420, margin: "36px auto 0" }}>
      <PageHead icon={User} kicker={t.nav.login} title={t.mypage.loginTitle} subtitle={t.mypage.loginSubtitle} />
      <form onSubmit={login} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 22, display: "grid", gap: 14 }}>
        <div><label style={lbl}>{t.mypage.email}</label><input type="email" style={inputS} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></div>
        <div><label style={lbl}>{t.mypage.password}</label><input type="password" style={inputS} placeholder="••••••••" /></div>
        <button type="submit" style={{ ...btn(TEAL, "#fff"), width: "100%" }}>{t.mypage.loginBtn}</button>
        <div style={{ fontSize: 11.5, color: MUTE, textAlign: "center" }}>{t.mypage.note}</div>
      </form>
    </div>
  );
  return (
    <div style={{ marginTop: 28, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <PageHead icon={User} kicker={t.nav.mypage} title={`${t.mypage.welcome}`} subtitle={user.email} />
        <button onClick={logout} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}`, display: "inline-flex", alignItems: "center", gap: 6 }}><LogOut size={14} /> {t.mypage.logout}</button>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: "0 0 12px" }}>{t.mypage.myBookings}</h3>
      {bookings.length === 0 ? (
        <div style={{ background: "#fff", border: `1px dashed ${LINE}`, borderRadius: 12, padding: 24, textAlign: "center", color: MUTE, fontSize: 14 }}>
          {t.mypage.noBookings}
          <div style={{ marginTop: 12 }}><button onClick={onBook} style={{ ...btn(TEAL, "#fff") }}>{t.nav.book}</button></div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {bookings.slice().reverse().map((b, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: INK }}>{b.treatment || "—"}</div>
                <div style={{ fontSize: 12.5, color: SUB }}>{b.name} · {b.country || "—"} {b.date ? "· " + b.date : ""}</div>
              </div>
              <span style={{ alignSelf: "center", fontSize: 11.5, fontWeight: 700, color: "#b8860b", background: "#fff7e6", padding: "4px 10px", borderRadius: 20 }}>Pending</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
