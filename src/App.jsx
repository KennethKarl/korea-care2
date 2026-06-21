import React, { useState, useEffect } from "react";
import {
  Search, MapPin, Star, Shield, Clock, Check, Plane,
  Building2, ChevronRight, Hotel, Languages, HeartPulse,
  Stethoscope, Award, Image as ImageIcon,
  Settings, Plus, Trash2, X, Eye, Type, Move, Palette,
  ArrowLeft, Phone, Mail, Send, ChevronDown, HelpCircle,
  Calendar, Users, CheckCircle2, MessageSquare, Globe, User, Newspaper,
} from "lucide-react";
import { treatments as TREATMENTS, reviews as REVIEWS, beforeAfter as BEFORE_AFTER, blogPosts as BLOG_POSTS, faqItems as FAQ_ITEMS, i18n as I18N } from "./site-data.js";
import { TreatmentsPage, TreatmentDetail, ReviewsPage, BeforeAfterPage, BlogPage, BlogPostPage, ReservationPage, MyPage } from "./screens.jsx";
import { Outlet, useNavigate, useLocation, useParams, useSearchParams, useOutletContext } from "react-router-dom";
import { ClientOnly } from "vite-react-ssg";
import { Seo, orgJsonLd, procedureJsonLd, faqJsonLd, breadcrumbJsonLd } from "./seo.jsx";
import { initAnalytics, trackPageView, trackEvent } from "./analytics.js";
import { submitLead } from "./api.js";
import { SITE_URL } from "./config.js";
import AccountHub from "./account.jsx";
import { AdminApp, HospitalApp } from "./backoffice.jsx";
import SpecOverlay from "./spec-overlay.jsx";
import { BLUE as TEAL, BLUE_SOFT as TEAL_SOFT, BLUE_DARK, ACCENT, ACCENT_SOFT, INK, SUB, MUTE, LINE, SUCCESS, STAR, BG_SOFT, NAVY, NAVY_LINE, GREEN, GREEN_SOFT, DISPLAY, btn } from "./theme.js";

/* =========================================================================
   KoreCare — fully admin-controllable
   Everything renders from `initialContent`. A future admin panel writes to
   the same shape (load from your API instead of this constant). The built-in
   editor on the right shows the exact controls the admin will expose:
     - swap any image by URL
     - overlay text on images (position / align / color / size / weight)
     - add / edit / remove departments, hospitals, programs
   ========================================================================= */

/* 디자인 토큰은 theme.js 로 중앙화 (TEAL=BLUE, TEAL_SOFT=BLUE_SOFT 별칭) */

const initialContent = {
  brand: { name: "KoreCare", insurer: "Meridian Health Insurance" },
  hero: {
    image: {
      url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80",
      alt: "Modern hospital",
      overlays: [
        { id: "h1", text: "World-class treatment in Korea — fully managed.", x: 6, y: 32, size: 36, weight: 800, color: "#ffffff", align: "left", maxWidth: 62 },
        { id: "h2", text: "Your insurer covers the procedure. We handle everything else.", x: 6, y: 64, size: 16, weight: 500, color: "#e8f4f3", align: "left", maxWidth: 50 },
      ],
      overlayScrim: 0.45,
    },
  },
  departments: [
    {
      id: "onco", name: "Oncology", active: true,
      hospitals: [
        { id: "snc", name: "Seoul National Cancer Center", city: "Seoul", rating: 4.9, reviews: 540, accred: "JCI", program: "Comprehensive Cancer Program", weeks: "3–5 wks", us: 145000, kr: 52000, covered: true, lead: "Proton therapy & robotic surgery",
          image: { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80", alt: "Cancer center", overlays: [{ id: "o1", text: "Proton Therapy Center", x: 8, y: 78, size: 15, weight: 700, color: "#ffffff", align: "left", maxWidth: 85 }], overlayScrim: 0.4 } },
        { id: "asan", name: "Asan Medical Oncology Inst.", city: "Seoul", rating: 4.9, reviews: 612, accred: "JCI", program: "Targeted Therapy Track", weeks: "4–6 wks", us: 168000, kr: 61000, covered: true, lead: "Asia's largest cancer caseload",
          image: { url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80", alt: "Hospital building", overlays: [], overlayScrim: 0.35 } },
      ],
    },
    {
      id: "ortho", name: "Orthopedics & Spine", active: true,
      hospitals: [
        { id: "wooridul", name: "Wooridul Spine Hospital", city: "Seoul", rating: 4.9, reviews: 720, accred: "JCI", program: "Minimally-Invasive Spine", weeks: "2–3 wks", us: 92000, kr: 28000, covered: true, lead: "Endoscopic spine pioneers",
          image: { url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80", alt: "Spine clinic", overlays: [], overlayScrim: 0.35 } },
      ],
    },
    {
      id: "cardiac", name: "Cardiac Surgery", active: true,
      hospitals: [
        { id: "samsung", name: "Samsung Heart Institute", city: "Seoul", rating: 4.9, reviews: 502, accred: "JCI", program: "Coronary Bypass Program", weeks: "3–4 wks", us: 158000, kr: 47000, covered: true, lead: "Hybrid cardiac suites",
          image: { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80", alt: "Heart institute", overlays: [], overlayScrim: 0.35 } },
      ],
    },
    {
      id: "screen", name: "Full Health Screening", active: false,
      hospitals: [
        { id: "asanhp", name: "Asan Health Promotion Ctr.", city: "Seoul", rating: 4.9, reviews: 890, accred: "JCI", program: "Executive Deep Screening", weeks: "3–5 days", us: 8500, kr: 2200, covered: true, lead: "Whole-body MRI + PET-CT",
          image: { url: "https://images.unsplash.com/photo-1631563019676-dade0dbdb8fc?w=600&q=80", alt: "Screening center", overlays: [], overlayScrim: 0.35 } },
      ],
    },
  ],
};

/* ----------------------- shared: total-care steps ----------------------- */
const CARE_STEPS = [
  { icon: Stethoscope, t: "Care plan & match", tk: "케어 플랜 & 매칭", d: "We match a covered program to your records.", dk: "진료 기록에 맞는 보장 프로그램을 매칭합니다." },
  { icon: Plane, t: "Travel arranged", tk: "이동 준비", d: "Flights, visa, pickup for you and a companion.", dk: "환자와 동반자 1인의 항공, 비자, 공항 영접을 준비합니다." },
  { icon: Languages, t: "In-Korea support", tk: "한국 내 지원", d: "Dedicated English interpreter and coordinator.", dk: "전담 영어 통역사와 코디네이터가 함께합니다." },
  { icon: Hotel, t: "Recovery stay", tk: "회복 숙소", d: "Hospital-adjacent accommodation booked.", dk: "병원 인근 숙소를 예약해 드립니다." },
  { icon: HeartPulse, t: "US aftercare", tk: "미국 내 사후관리", d: "Follow-up coordinated with your home doctor.", dk: "미국 주치의와 후속 진료를 조율합니다." },
];

/* -----------------------------------------------------------------------
   LANDING — KoreCare Landing.dc 디자인 카피(영/한). 기존 lang 토글과 연동.
   디자인의 data-en/data-ko 페어를 그대로 옮긴 사전.
   ----------------------------------------------------------------------- */
const DEPT_KO = { onco: "암 치료", ortho: "정형외과 & 척추", cardiac: "심장 수술", screen: "건강검진" };
const LANDING = {
  en: {
    bannerPre: "You were referred by ", bannerPost: ". Covered programs are highlighted below.",
    heroBadge: "Covered by your plan",
    heroTitle: "World-class treatment in Korea — fully managed.",
    heroSub: "Your insurer covers the procedure. We handle everything else.",
    heroCta1: "Find programs", heroCta2: "How it works →",
    trustLabel: "ACCREDITED & VETTED", hipaa: "HIPAA-aligned data",
    statPatients: "patients managed", statRating: "avg rating", statHospitals: "partner hospitals",
    progSubMatched: "matched · sorted by your coverage", progViewAll: "View all programs →",
    covered: "✓ COVERED", usCost: "US cost", krCost: "Korea all-in", save: "Save", viewPlan: "View plan",
    journeyTitle: "One team, the whole journey", journeySub: "You never coordinate a single vendor yourself.",
    reviewsEyebrow: "Reviews", reviewsTitle: "Real experiences from US members",
    baEyebrow: "Before / After", baTitle: "Before treatment, and six months later", baBefore: "BEFORE",
    ctaTitle: "Your plan may already cover this",
    ctaSub: "We work directly with major US insurers to pre-verify costs. Check your coverage in 60 seconds.",
    ctaBtn1: "Check my coverage", ctaBtn2: "Talk to a coordinator",
    footerBlurb: "Connecting US insurance members to accredited Korean hospitals — fully managed, end to end.",
    footerPrograms: "Programs", footerCompany: "Company", footerLegal: "Legal",
    footProgItems: ["Oncology", "Orthopedics & Spine", "Cardiac", "How It Works"],
    footCompanyItems: ["About", "FAQ", "Contact Us", "Blog"],
    footLegalItems: ["Privacy Policy", "Terms of Service", "Refund Policy"],
    footNote: "© KoreCare. Prototype — not medical advice.",
    footNote2: "A coordination service — not a medical provider.",
  },
  ko: {
    bannerPre: "", bannerPost: " 의 추천을 받으셨습니다. 보장되는 프로그램이 아래에 강조 표시됩니다.",
    heroBadge: "플랜으로 보장됩니다",
    heroTitle: "세계적 수준의 치료를 한국에서 — 전 과정 관리.",
    heroSub: "보험사가 시술 비용을 보장합니다. 나머지 모든 것은 저희가 처리합니다.",
    heroCta1: "프로그램 찾기", heroCta2: "이용 방법 →",
    trustLabel: "인증 및 검증", hipaa: "HIPAA 준수 데이터",
    statPatients: "환자 관리", statRating: "평균 평점", statHospitals: "제휴 병원",
    progSubMatched: "건 매칭됨 · 회원님의 보장 기준 정렬", progViewAll: "전체 프로그램 보기 →",
    covered: "✓ 보장됨", usCost: "미국 비용", krCost: "한국 올인", save: "절감", viewPlan: "플랜 보기",
    journeyTitle: "하나의 팀이 모든 여정을 함께합니다", journeySub: "회원님이 직접 단 하나의 업체도 조율할 필요가 없습니다.",
    reviewsEyebrow: "환자 후기", reviewsTitle: "실제 미국 회원들의 경험",
    baEyebrow: "전후 사례", baTitle: "치료 전, 그리고 6개월 후", baBefore: "치료 전",
    ctaTitle: "회원님의 플랜으로 이미 보장될 수 있습니다",
    ctaSub: "대형 미국 보험사와 직접 협력하여 비용을 사전 확인합니다. 60초 만에 보장 여부를 확인하세요.",
    ctaBtn1: "보장 확인하기", ctaBtn2: "코디네이터와 상담",
    footerBlurb: "미국 보험 회원을 인증된 한국 병원과 연결하고, 전 과정을 관리합니다.",
    footerPrograms: "프로그램", footerCompany: "회사", footerLegal: "법적 고지",
    footProgItems: ["암 치료", "정형외과 & 척추", "심장", "이용 방법"],
    footCompanyItems: ["소개", "자주 묻는 질문", "문의하기", "블로그"],
    footLegalItems: ["개인정보 처리방침", "이용약관", "환불 정책"],
    footNote: "© KoreCare. 프로토타입 — 의료 자문이 아닙니다.",
    footNote2: "의료 서비스 제공 주체가 아닌 코디네이션 서비스입니다.",
  },
};

/* ---------------------- responsive helper ---------------------- */
function useIsMobile(maxWidth = 900) {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width:${maxWidth}px)`).matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width:${maxWidth}px)`);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [maxWidth]);
  return mobile;
}

/* ========================================================================
   ROUTING — react-router 데이터 라우트 (vite-react-ssg 가 라우트별 정적 HTML 생성)
   기존 페이지 컴포넌트(Hero/Results/HospitalDetail/…)는 그대로 두고, URL 라우트
   래퍼가 useParams/useSearchParams + navigate 콜백으로 연결한다.
   ======================================================================== */

// {name,...} 라우트 의도 → URL 경로 (Nav/Footer 기존 콜백 호환)
function navPath(next) {
  if (typeof next === "string") return next;
  const n = next.name;
  if (n === "home") return "/";
  if (n === "treatments") return "/programs";
  if (n === "treatment") return `/treatment/${next.treatmentId}`;
  if (n === "detail") return `/hospital/${next.deptId}/${next.hospitalId}`;
  if (n === "reviews") return "/reviews";
  if (n === "beforeafter") return "/before-after";
  if (n === "blog") return "/blog";
  if (n === "blogpost") return `/blog/${next.postId}`;
  if (n === "reservation") return next.treatmentId ? `/reservation?treatment=${next.treatmentId}` : "/reservation";
  if (n === "contact") return (next.deptId && next.hospitalId) ? `/contact?dept=${next.deptId}&hospital=${next.hospitalId}` : "/contact";
  if (n === "about") return "/about";
  if (n === "howitworks") return "/how-it-works";
  if (n === "faq") return "/faq";
  if (n === "legal") return `/legal/${next.doc}`;
  if (n === "mypage") return "/mypage";
  return "/";
}

// URL → Nav 활성표시용 route 이름
function pathToRoute(pathname) {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  if (p === "/") return { name: "home" };
  if (p.startsWith("/programs")) return { name: "treatments" };
  if (p.startsWith("/treatment")) return { name: "treatment" };
  if (p.startsWith("/hospital")) return { name: "detail" };
  if (p.startsWith("/reviews")) return { name: "reviews" };
  if (p.startsWith("/before-after")) return { name: "beforeafter" };
  if (p.startsWith("/blog")) return { name: p.split("/").length > 2 ? "blogpost" : "blog" };
  if (p.startsWith("/reservation")) return { name: "reservation" };
  if (p.startsWith("/contact")) return { name: "contact" };
  if (p.startsWith("/about")) return { name: "about" };
  if (p.startsWith("/how-it-works")) return { name: "howitworks" };
  if (p.startsWith("/faq")) return { name: "faq" };
  if (p.startsWith("/legal")) return { name: "legal" };
  if (p.startsWith("/mypage")) return { name: "mypage" };
  return { name: "home" };
}

/* ------------------------------ Layout ------------------------------ */
function Layout() {
  const isMobile = useIsMobile(900);
  const [content, setContent] = useState(initialContent);
  const [showEditor, setShowEditor] = useState(false);
  const [editorDeptId, setEditorDeptId] = useState(initialContent.departments[0].id);
  const [lang, setLang] = useState("en");
  const t = I18N[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const route = pathToRoute(location.pathname);
  const isHome = route.name === "home";
  const onNav = (next) => navigate(navPath(next));
  const goHome = () => navigate("/");

  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => {
    trackPageView(location.pathname);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div style={{ fontFamily: "Pretendard, system-ui, sans-serif", background: BG_SOFT, minHeight: "100vh", display: "flex" }}>
      <div style={{ flex: 1, minWidth: 0, overflowX: "hidden", display: "flex", flexDirection: "column" }}>
        <Nav content={content} route={route} onNav={onNav} onHome={goHome} onToggleEditor={() => setShowEditor((s) => !s)} editorOpen={showEditor} isMobile={isMobile} lang={lang} onToggleLang={() => setLang((l) => (l === "en" ? "ko" : "en"))} t={t} />
        <InsurerBanner insurer={content.brand.insurer} lang={lang} />
        {/* 홈(랜딩)은 풀블리드 — 자체 max-width/다크 섹션 관리. 그 외 페이지는 1080 컨테이너. */}
        <main style={isHome
          ? { width: "100%", flex: 1 }
          : { maxWidth: 1080, margin: "0 auto", padding: "0 20px 60px", width: "100%", boxSizing: "border-box", flex: 1 }}>
          <Outlet context={{ content, setContent, lang, t, isMobile, onNav }} />
        </main>
        <Footer brand={content.brand} onNav={onNav} onHome={goHome} lang={lang} />
      </div>

      {/* 어드민 에디터는 내부 도구 — SSG HTML 에서 제외(ClientOnly) */}
      <ClientOnly>
        {() => (showEditor ? (
          <>
            {isMobile && <div onClick={() => setShowEditor(false)} style={{ position: "fixed", inset: 0, background: "rgba(8,20,24,.45)", zIndex: 40 }} />}
            <AdminEditor content={content} setContent={setContent} activeDeptId={editorDeptId} setActiveDeptId={setEditorDeptId} onClose={() => setShowEditor(false)} isMobile={isMobile} />
          </>
        ) : null)}
      </ClientOnly>
    </div>
  );
}

/* ------------------------- page route wrappers ------------------------- */
function HomePage() {
  const { content, lang } = useOutletContext();
  const navigate = useNavigate();
  const activeDepts = content.departments.filter((d) => d.active);
  const [activeDeptId, setActiveDeptId] = useState(activeDepts[0]?.id);
  const safeDeptId = activeDepts.find((d) => d.id === activeDeptId) ? activeDeptId : activeDepts[0]?.id;
  const activeDept = activeDepts.find((d) => d.id === safeDeptId);
  return (
    <>
      <Seo path="/" jsonLd={orgJsonLd} />
      <LandingHero
        hero={content.hero} lang={lang} depts={activeDepts} activeId={safeDeptId}
        onPick={setActiveDeptId} onFind={() => navigate("/programs")} onHow={() => navigate("/how-it-works")}
      />
      <TrustStrip lang={lang} />
      <Programs dept={activeDept} lang={lang} onView={(h, d) => navigate(`/hospital/${d.id}/${h.id}`)} onViewAll={() => navigate("/programs")} />
      <Journey lang={lang} />
      <Reviews lang={lang} />
      <BeforeAfter lang={lang} />
      <CtaBand lang={lang} insurer={content.brand.insurer} onCheck={() => navigate("/reservation")} onTalk={() => navigate("/contact")} />
      {/* 기획 모드 오버레이 (홈 전용, client-only) */}
      <ClientOnly>{() => <SpecOverlay />}</ClientOnly>
    </>
  );
}

function TreatmentsRoute() {
  const { content, lang, t } = useOutletContext();
  const navigate = useNavigate();
  return (
    <>
      <Seo title="Programs & Treatments" description="Browse covered treatments in Korea — oncology, orthopedics, cardiac surgery and full health screening — matched to your US insurance referral." path="/programs" jsonLd={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Programs", path: "/programs" }])} />
      <TreatmentsPage treatments={TREATMENTS} departments={content.departments} lang={lang} t={t} onOpen={(id) => navigate(`/treatment/${id}`)} />
    </>
  );
}

function TreatmentRoute() {
  const { content, lang, t } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const tr = TREATMENTS.find((x) => x.id === id);
  const name = tr ? (tr.name?.[lang] ?? tr.name?.en ?? tr.name) : "Treatment";
  const desc = tr ? (tr.summary?.[lang] ?? tr.summary?.en) : undefined;
  const path = `/treatment/${id}`;
  return (
    <>
      <Seo title={typeof name === "string" ? name : "Treatment"} description={desc} type="article" path={path}
        jsonLd={tr ? [procedureJsonLd({ name, description: desc || name, url: SITE_URL + path }), breadcrumbJsonLd([{ name: "Programs", path: "/programs" }, { name, path }])] : undefined} />
      <TreatmentDetail treatment={tr} departments={content.departments} lang={lang} t={t} onBack={() => navigate("/programs")} onBook={(tid) => navigate(`/reservation?treatment=${tid}`)} />
    </>
  );
}

function HospitalDetailRoute() {
  const { content } = useOutletContext();
  const { deptId, hospitalId } = useParams();
  const navigate = useNavigate();
  const dept = content.departments.find((d) => d.id === deptId);
  const hospital = dept?.hospitals.find((h) => h.id === hospitalId);
  const path = `/hospital/${deptId}/${hospitalId}`;
  return (
    <>
      <Seo
        title={hospital ? `${hospital.program} — ${hospital.name}` : "Program"}
        description={hospital ? `${hospital.program} at ${hospital.name} (${hospital.city}). Korea all-in $${hospital.kr.toLocaleString()} vs US $${hospital.us.toLocaleString()} — covered, fully managed by KoreCare.` : undefined}
        path={path}
        jsonLd={hospital ? [procedureJsonLd({ name: `${hospital.program} — ${hospital.name}`, description: hospital.lead || hospital.program, url: SITE_URL + path }), breadcrumbJsonLd([{ name: "Programs", path: "/" }, { name: dept?.name || "Program", path: "/" }, { name: hospital.name, path }])] : undefined}
      />
      <HospitalDetail hospital={hospital} dept={dept} insurer={content.brand.insurer} onBack={() => navigate("/")} onContact={() => navigate(`/contact?dept=${deptId}&hospital=${hospitalId}`)} />
    </>
  );
}

function ReviewsRoute() {
  const { lang, t } = useOutletContext();
  return (<><Seo title="Patient Reviews" description="Real patient reviews of KoreCare-managed treatment journeys in Korea." path="/reviews" /><ReviewsPage reviews={REVIEWS} lang={lang} t={t} /></>);
}

function BeforeAfterRoute() {
  const { lang, t } = useOutletContext();
  return (<><Seo title="Before & After" description="Before-and-after outcomes from KoreCare partner hospitals in Korea." path="/before-after" /><BeforeAfterPage beforeAfter={BEFORE_AFTER} lang={lang} t={t} /></>);
}

function BlogRoute() {
  const { lang, t } = useOutletContext();
  const navigate = useNavigate();
  return (<><Seo title="Blog" description="Guides on medical travel to Korea — coverage, hospitals, recovery and aftercare." path="/blog" /><BlogPage blogPosts={BLOG_POSTS} lang={lang} t={t} onOpen={(id) => navigate(`/blog/${id}`)} /></>);
}

function BlogPostRoute() {
  const { lang, t } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  let post = BLOG_POSTS.find((p) => p.id === id);
  // 어드민 블로그 CMS 로 추가된 글(프리렌더 안 됨)은 클라이언트 localStorage 에서 탐색
  if (!post && typeof window !== "undefined") { try { post = JSON.parse(localStorage.getItem("korecare_blogposts") || "[]").find((p) => p.id === id); } catch (_) {} }
  const title = post ? (post.title?.[lang] ?? post.title?.en ?? post.title) : "Article";
  return (<><Seo title={typeof title === "string" ? title : "Article"} type="article" path={`/blog/${id}`} /><BlogPostPage post={post} lang={lang} t={t} onBack={() => navigate("/blog")} /></>);
}

function ReservationRoute() {
  const { lang, t } = useOutletContext();
  const [sp] = useSearchParams();
  return (<><Seo title="Book a Consultation" description="Request your treatment consultation with KoreCare — coverage confirmed after a short records review." path="/reservation" /><ReservationPage treatments={TREATMENTS} lang={lang} t={t} prefillTreatmentId={sp.get("treatment") || ""} /></>);
}

function ContactRoute() {
  const { content } = useOutletContext();
  const [sp] = useSearchParams();
  const prefillHospital = content.departments.find((d) => d.id === sp.get("dept"))?.hospitals.find((h) => h.id === sp.get("hospital"));
  return (<><Seo title="Contact a Coordinator" description="Talk to a KoreCare care coordinator — coverage check and program questions, no obligation." path="/contact" /><ContactPage depts={content.departments} prefillHospital={prefillHospital} /></>);
}

function AboutRoute() {
  const { content } = useOutletContext();
  const navigate = useNavigate();
  return (<><Seo title="About KoreCare" description="KoreCare manages medical treatment in Korea for US insurance members — the insurer covers the procedure, we handle everything around it." path="/about" /><AboutPage insurer={content.brand.insurer} onContact={() => navigate("/contact")} onPrograms={() => navigate("/")} /></>);
}

function HowItWorksRoute() {
  const navigate = useNavigate();
  return (<><Seo title="How It Works" description="From care-plan matching to US aftercare — the 5-step KoreCare journey." path="/how-it-works" /><HowItWorksPage onPrograms={() => navigate("/")} onContact={() => navigate("/contact")} /></>);
}

function FaqRoute() {
  const navigate = useNavigate();
  return (<><Seo title="FAQ" description="Answers about insurer coverage, hospitals, travel, language and aftercare for treatment in Korea." path="/faq" jsonLd={faqJsonLd(FAQ_ITEMS)} /><FAQPage onContact={() => navigate("/contact")} /></>);
}

function LegalRoute() {
  const { doc } = useParams();
  const navigate = useNavigate();
  const titles = { privacy: "Privacy Policy", terms: "Terms of Service", refund: "Refund Policy" };
  return (<><Seo title={titles[doc] || "Legal"} path={`/legal/${doc}`} noindex /><LegalPage doc={doc} onContact={() => navigate("/contact")} /></>);
}

function MyPageRoute() {
  const navigate = useNavigate();
  return (<><Seo title="My Page" path="/mypage" noindex /><ClientOnly>{() => <AccountHub onBook={() => navigate("/reservation")} />}</ClientOnly></>);
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <Seo title="Not found" noindex />
      <div style={{ marginTop: 60, textAlign: "center" }}>
        <h1 style={{ fontSize: 26, color: INK }}>Page not found</h1>
        <button onClick={() => navigate("/")} style={{ ...btn(TEAL, "#fff"), marginTop: 16 }}>Back to home</button>
      </div>
    </>
  );
}

/* 운영자 어드민 / 병원 관리자 (별도 셸, noindex, client-only mock) */
function AdminRoute() {
  return (<><Seo title="Operator Admin" path="/admin" noindex /><ClientOnly>{() => <AdminApp />}</ClientOnly></>);
}
function HospitalRoute() {
  return (<><Seo title="Hospital Manager" path="/hospital-admin" noindex /><ClientOnly>{() => <HospitalApp />}</ClientOnly></>);
}

/* ------------------------------- routes ------------------------------- */
export const routes = [
  { path: "/admin", element: <AdminRoute /> },
  { path: "/hospital-admin", element: <HospitalRoute /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "programs", element: <TreatmentsRoute /> },
      { path: "treatment/:id", element: <TreatmentRoute />, getStaticPaths: () => TREATMENTS.map((x) => `treatment/${x.id}`) },
      { path: "hospital/:deptId/:hospitalId", element: <HospitalDetailRoute />, getStaticPaths: () => initialContent.departments.flatMap((d) => d.hospitals.map((h) => `hospital/${d.id}/${h.id}`)) },
      { path: "reviews", element: <ReviewsRoute /> },
      { path: "before-after", element: <BeforeAfterRoute /> },
      { path: "blog", element: <BlogRoute /> },
      { path: "blog/:id", element: <BlogPostRoute />, getStaticPaths: () => BLOG_POSTS.map((p) => `blog/${p.id}`) },
      { path: "reservation", element: <ReservationRoute /> },
      { path: "contact", element: <ContactRoute /> },
      { path: "about", element: <AboutRoute /> },
      { path: "how-it-works", element: <HowItWorksRoute /> },
      { path: "faq", element: <FaqRoute /> },
      { path: "legal/:doc", element: <LegalRoute />, getStaticPaths: () => ["privacy", "terms", "refund"].map((d) => `legal/${d}`) },
      { path: "mypage", element: <MyPageRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

/* ------------------------------ Nav ------------------------------ */
function Nav({ content, route, onNav, onHome, onToggleEditor, editorOpen, isMobile, lang, onToggleLang, t }) {
  // primary menu = 요구사항정의서 상단 메뉴 (시술·병원·리뷰·비포/애프터·블로그·FAQ)
  const links = [
    { id: "treatments", label: t.nav.treatments, on: () => onNav({ name: "treatments" }) },
    { id: "home", label: t.nav.hospitals, on: () => onHome() },
    { id: "reviews", label: t.nav.reviews, on: () => onNav({ name: "reviews" }) },
    { id: "beforeafter", label: t.nav.beforeafter, on: () => onNav({ name: "beforeafter" }) },
    { id: "blog", label: t.nav.blog, on: () => onNav({ name: "blog" }) },
    { id: "faq", label: t.nav.faq, on: () => onNav({ name: "faq" }) },
  ];
  const LinkButtons = () => links.map((l) => {
    const active = route?.name === l.id || (l.id === "blog" && route?.name === "blogpost") || (l.id === "treatments" && route?.name === "treatment");
    return (
      <button key={l.id} onClick={l.on} style={{
        border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
        padding: "8px 10px", borderRadius: 8, fontSize: 14,
        fontWeight: active ? 700 : 500, color: active ? TEAL : SUB,
      }}>{l.label}</button>
    );
  });
  const langBtn = (
    <button onClick={onToggleLang} title="Language" style={{ border: `1px solid ${LINE}`, background: "#fff", color: SUB, cursor: "pointer", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
      <Globe size={14} /> {lang === "en" ? "EN" : "한"}
    </button>
  );
  const loginBtn = (
    <button onClick={() => onNav({ name: "mypage" })} style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, padding: "9px 14px" }}>
      <User size={15} /> {t.nav.login}
    </button>
  );
  const adminBtn = (
    <button onClick={onToggleEditor} title="Admin" style={{ border: `1px solid ${LINE}`, background: editorOpen ? TEAL : "#fff", color: editorOpen ? "#fff" : MUTE, cursor: "pointer", borderRadius: 8, padding: "8px 10px", display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
      <Settings size={15} />
    </button>
  );
  const brand = (
    <button onClick={onHome} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 20, color: TEAL, padding: 0 }}>
      <Plane size={20} /> {content.brand.name}
    </button>
  );

  return (
    <div data-spec="1-1" style={{ background: "#fff", borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, zIndex: 5 }}>
      {isMobile ? (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            {brand}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{langBtn}{loginBtn}{adminBtn}</div>
          </div>
          {/* horizontally scrollable link row */}
          <div style={{ display: "flex", gap: 2, marginTop: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", marginLeft: -4 }}>
            <LinkButtons />
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {brand}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            <LinkButtons />
            <span style={{ display: "inline-flex", gap: 6, marginLeft: 6 }}>{langBtn}{loginBtn}{adminBtn}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function InsurerBanner({ insurer, lang = "en" }) {
  const L = LANDING[lang];
  return (
    <div data-spec="1-2" style={{ background: NAVY, color: "#c7d6f5" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "9px 28px", display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", width: 18, height: 18, borderRadius: "50%", background: TEAL, color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>✓</span>
        <span>{L.bannerPre}<strong style={{ color: "#fff", fontWeight: 700 }}>{insurer}</strong>{L.bannerPost}</span>
      </div>
    </div>
  );
}

/* --------------- reusable: image with text overlays --------------- */
function OverlayImage({ image, height, radius = 16, textScale = 1 }) {
  if (!image || !image.url) {
    return (
      <div style={{ height: height === "100%" ? "100%" : height, minHeight: 120, borderRadius: radius, background: "#dfe6e9", display: "grid", placeItems: "center", color: MUTE }}>
        <ImageIcon size={28} />
      </div>
    );
  }
  const scrim = image.overlayScrim ?? 0;
  return (
    <div style={{ position: "relative", height, minHeight: 120, borderRadius: radius, overflow: "hidden", background: "#dfe6e9" }}>
      <img src={image.url} alt={image.alt || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {scrim > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(0deg, rgba(8,20,24,${scrim}) 0%, rgba(8,20,24,${scrim * 0.4}) 60%, rgba(8,20,24,0) 100%)` }} />
      )}
      {(image.overlays || []).map((o) => (
        <div key={o.id} style={{
          position: "absolute",
          left: o.align === "center" ? 0 : `${o.x}%`,
          right: o.align === "center" ? 0 : "auto",
          top: `${o.y}%`,
          transform: "translateY(-50%)",
          maxWidth: o.align === "center" ? "100%" : `${o.maxWidth || 80}%`,
          padding: o.align === "center" ? "0 6%" : 0,
          color: o.color, fontSize: Math.round(o.size * textScale), fontWeight: o.weight,
          textAlign: o.align, lineHeight: 1.15,
          textShadow: "0 1px 8px rgba(0,0,0,.35)",
          pointerEvents: "none",
        }}>
          {o.text}
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   LANDING SECTIONS — KoreCare Landing.dc 디자인 구현 (풀블리드 홈)
   기존 데이터(departments/CARE_STEPS/REVIEWS/BEFORE_AFTER) + theme 토큰 + lang 토글 연동.
   data-spec 마커는 기획 오버레이(spec-overlay.jsx)와 호환되도록 유지/확장.
   ========================================================================= */
const WRAP = { maxWidth: 1180, margin: "0 auto", padding: "0 28px" };
const deptLabel = (d, lang) => (lang === "ko" ? (DEPT_KO[d.id] || d.name) : d.name);

function LandingStyles() {
  return (
    <style>{`
      .kc-prog-grid,.kc-rev-grid,.kc-ba-grid{display:grid;gap:24px}
      .kc-prog-grid{grid-template-columns:1fr 1fr}
      .kc-rev-grid{grid-template-columns:repeat(3,1fr)}
      .kc-ba-grid{grid-template-columns:1fr 1fr}
      .kc-journey-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
      .kc-cta{display:grid;grid-template-columns:1.3fr .7fr;gap:40px;align-items:center}
      @media(max-width:920px){
        .kc-prog-grid,.kc-rev-grid,.kc-ba-grid,.kc-cta{grid-template-columns:1fr!important}
        .kc-journey-grid{grid-template-columns:repeat(2,1fr)!important}
        .kc-hero-title{font-size:38px!important}
        .kc-hero{min-height:520px!important}
      }
      @media(max-width:560px){
        .kc-wrap{padding-left:18px!important;padding-right:18px!important}
        .kc-journey-grid{grid-template-columns:1fr!important}
        .kc-hero-title{font-size:30px!important}
      }
    `}</style>
  );
}

/* ------------------------------- Hero ----------------------------- */
function LandingHero({ hero, lang, depts, activeId, onPick, onFind, onHow }) {
  const L = LANDING[lang];
  const heroImg = hero?.image?.url || "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600&q=80";
  return (
    <>
      <LandingStyles />
      <div data-spec="1-3" className="kc-hero" style={{ position: "relative", minHeight: 580, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <img src={heroImg} alt="Modern hospital" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(8,18,40,0.92) 0%, rgba(8,18,40,0.74) 42%, rgba(8,18,40,0.30) 100%)" }} />
        <div className="kc-wrap" style={{ ...WRAP, position: "relative", padding: "60px 28px", width: "100%" }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(27,89,250,0.18)", border: "1px solid rgba(122,160,255,0.4)", color: "#cfdcff", fontSize: 13, fontWeight: 700, padding: "7px 14px", borderRadius: 20, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
              {L.heroBadge}
            </div>
            <h1 className="kc-hero-title" style={{ fontFamily: DISPLAY, fontSize: 54, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>{L.heroTitle}</h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: "#cdd6e6", margin: "0 0 34px", maxWidth: 480 }}>{L.heroSub}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30, flexWrap: "wrap" }}>
              <button onClick={onFind} style={{ ...btn(TEAL, "#fff"), fontSize: 16, padding: "16px 32px", borderRadius: 11, boxShadow: "0 10px 28px rgba(27,89,250,.4)" }}>{L.heroCta1}</button>
              <button onClick={onHow} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 8px", borderBottom: "2px solid rgba(255,255,255,.45)", cursor: "pointer" }}>{L.heroCta2}</button>
            </div>
            {/* 진료과 칩 — 선택 시 아래 프로그램 목록 필터 */}
            <div data-spec="1-4" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {depts.map((d) => {
                const on = d.id === activeId;
                return (
                  <button key={d.id} onClick={() => onPick(d.id)} style={{
                    fontSize: 13.5, fontWeight: 600, color: "#fff", cursor: "pointer",
                    background: on ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)",
                    border: `1px solid rgba(255,255,255,${on ? 0.22 : 0.16})`,
                    borderRadius: 22, padding: "9px 18px",
                  }}>{deptLabel(d, lang)}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* --------------------------- Trust strip --------------------------- */
function TrustStrip({ lang }) {
  const L = LANDING[lang];
  return (
    <div style={{ background: "#f6f8fc", borderBottom: `1px solid #eef1f6` }}>
      <div className="kc-wrap" style={{ ...WRAP, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em" }}>{L.trustLabel}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: TEAL, border: `1.5px solid ${TEAL}`, borderRadius: 5, padding: "4px 10px" }}>JCI</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", border: "1.5px solid #d4dbe5", borderRadius: 5, padding: "4px 10px" }}>ISO 9001</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#475569" }}>{L.hipaa}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap" }}>
          <div><span style={{ fontSize: 19, fontWeight: 800, color: INK }}>2,400+</span> <span style={{ fontSize: 13.5, color: "#64748b" }}>{L.statPatients}</span></div>
          <div><span style={{ fontSize: 19, fontWeight: 800, color: INK }}>4.9★</span> <span style={{ fontSize: 13.5, color: "#64748b" }}>{L.statRating}</span></div>
          <div><span style={{ fontSize: 19, fontWeight: 800, color: INK }}>35+</span> <span style={{ fontSize: 13.5, color: "#64748b" }}>{L.statHospitals}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Programs ----------------------------- */
function Programs({ dept, lang, onView, onViewAll }) {
  const L = LANDING[lang];
  if (!dept) return null;
  const n = dept.hospitals.length;
  return (
    <div data-spec="1-5" className="kc-wrap" style={{ ...WRAP, padding: "72px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: INK, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{deptLabel(dept, lang)}{lang === "ko" ? " 프로그램" : " programs"}</h2>
          <p style={{ fontSize: 15.5, color: "#64748b", margin: 0 }}>{n}{lang === "ko" ? "" : " "}{L.progSubMatched}</p>
        </div>
        <button onClick={onViewAll} style={{ background: "none", border: "none", fontSize: 14.5, fontWeight: 700, color: TEAL, cursor: "pointer", padding: 0 }}>{L.progViewAll}</button>
      </div>
      <div className="kc-prog-grid">
        {dept.hospitals.map((h) => (
          <div key={h.id} style={{ background: "#fff", border: "1px solid #eaedf3", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,.05)" }}>
            <div style={{ position: "relative", height: 200 }}>
              <img src={h.image?.url || ""} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {h.covered && (
                <span style={{ position: "absolute", top: 14, left: 14, fontSize: 11, fontWeight: 800, color: "#fff", background: GREEN, borderRadius: 20, padding: "6px 13px" }}>{L.covered}</span>
              )}
              <span style={{ position: "absolute", top: 14, right: 14, fontSize: 11, fontWeight: 800, color: INK, background: "rgba(255,255,255,0.95)", borderRadius: 6, padding: "5px 9px" }}>{h.accred}</span>
            </div>
            <div style={{ padding: "24px 26px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>{h.name}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: "-0.01em" }}>{h.program}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 18, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>{h.lead}</span>
                <span>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Star size={13} fill={STAR} color={STAR} /><b style={{ color: INK }}>{h.rating}</b> ({h.reviews})</span>
                <span>·</span><span>{h.city}</span><span>·</span><span>{h.weeks}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#f6f8fc", borderRadius: 12, padding: "15px 18px", flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 11.5, color: "#94a3b8" }}>{L.usCost}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8", textDecoration: "line-through" }}>${h.us.toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11.5, color: "#94a3b8" }}>{L.krCost}</div><div style={{ fontSize: 15, fontWeight: 800, color: INK }}>${h.kr.toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11.5, color: GREEN }}>{L.save}</div><div style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>${(h.us - h.kr).toLocaleString()}</div></div>
                <button onClick={() => onView(h, dept)} style={{ marginLeft: "auto", ...btn(TEAL, "#fff"), fontSize: 14, padding: "11px 20px", borderRadius: 9 }}>{L.viewPlan}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Journey ----------------------------- */
function Journey({ lang }) {
  const L = LANDING[lang];
  return (
    <div data-spec="1-6" style={{ background: NAVY, color: "#fff" }}>
      <div className="kc-wrap" style={{ ...WRAP, padding: "76px 28px" }}>
        <div style={{ marginBottom: 48, maxWidth: 620 }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{L.journeyTitle}</h2>
          <p style={{ fontSize: 17, color: "#aebdd8", margin: 0 }}>{L.journeySub}</p>
        </div>
        <div className="kc-journey-grid">
          {CARE_STEPS.map((s, i) => {
            const last = i === CARE_STEPS.length - 1;
            const num = "0" + (i + 1);
            return (
              <div key={i}>
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: last ? "#5ce0a0" : "#5b8cff", marginBottom: 14 }}>{num}</div>
                <div style={{ width: "100%", height: 3, background: `linear-gradient(90deg, ${last ? GREEN : TEAL}, transparent)`, borderRadius: 2, marginBottom: 18 }} />
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{lang === "ko" ? s.tk : s.t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#9fb1cf" }}>{lang === "ko" ? s.dk : s.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Reviews ----------------------------- */
function Reviews({ lang }) {
  const L = LANDING[lang];
  const items = REVIEWS.slice(0, 3);
  return (
    <div data-spec="1-7" className="kc-wrap" style={{ ...WRAP, padding: "76px 28px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{L.reviewsEyebrow}</div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: INK, margin: 0, letterSpacing: "-0.02em" }}>{L.reviewsTitle}</h2>
      </div>
      <div className="kc-rev-grid">
        {items.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: "1px solid #eaedf3", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(15,23,42,.04)" }}>
            <div style={{ color: STAR, fontSize: 15, marginBottom: 16 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#1e293b", margin: "0 0 24px", fontWeight: 500 }}>“{r.text}”</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: TEAL_SOFT, color: TEAL, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{r.author.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{r.author}</div>
                <div style={{ fontSize: 12.5, color: "#64748b" }}>{r.treatment} · {r.country}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Before / After --------------------------- */
function BeforeAfter({ lang }) {
  const L = LANDING[lang];
  const items = BEFORE_AFTER.slice(0, 2);
  return (
    <div data-spec="1-8" style={{ background: "#f6f8fc", borderTop: "1px solid #eef1f6", borderBottom: "1px solid #eef1f6" }}>
      <div className="kc-wrap" style={{ ...WRAP, padding: "76px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{L.baEyebrow}</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: INK, margin: 0, letterSpacing: "-0.02em" }}>{L.baTitle}</h2>
        </div>
        <div className="kc-ba-grid">
          {items.map((ba) => (
            <div key={ba.id} style={{ background: "#fff", border: "1px solid #eaedf3", borderRadius: 16, padding: 22 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 210 }}>
                  <img src={ba.before} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.25)" }} />
                  <span style={{ position: "absolute", bottom: 10, left: 10, fontSize: 11, fontWeight: 800, color: INK, background: "#fff", padding: "4px 10px", borderRadius: 5 }}>{L.baBefore}</span>
                </div>
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 210 }}>
                  <img src={ba.after} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", bottom: 10, left: 10, fontSize: 11, fontWeight: 800, color: "#fff", background: GREEN, padding: "4px 10px", borderRadius: 5 }}>{ba.weeks}</span>
                </div>
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: INK, marginBottom: 6 }}>{ba.treatment}</div>
              <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>{ba.note?.[lang] ?? ba.note?.en}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- CTA band ----------------------------- */
function CtaBand({ lang, insurer, onCheck, onTalk }) {
  const L = LANDING[lang];
  const logos = [insurer, "BlueRidge", "Anthem-X", "UnitedFirst"];
  return (
    <div data-spec="1-9" className="kc-wrap" style={{ ...WRAP, padding: "76px 28px" }}>
      <div className="kc-cta" style={{ background: `linear-gradient(115deg, ${TEAL} 0%, ${BLUE_DARK} 100%)`, borderRadius: 24, padding: 56, overflow: "hidden", position: "relative" }}>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.02em" }}>{L.ctaTitle}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#d6e1ff", margin: "0 0 28px", maxWidth: 460 }}>{L.ctaSub}</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={onCheck} style={{ background: "#fff", color: TEAL, border: "none", fontSize: 16, fontWeight: 700, padding: "15px 30px", borderRadius: 11, cursor: "pointer" }}>{L.ctaBtn1}</button>
            <button onClick={onTalk} style={{ background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "15px 28px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>{L.ctaBtn2}</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {logos.map((name, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: 16, textAlign: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>{name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   HOSPITAL DETAIL  (shown on "View plan")
   ======================================================================== */
function HospitalDetail({ hospital, dept, insurer, onBack, onContact }) {
  if (!hospital) {
    return (
      <div style={{ marginTop: 40, textAlign: "center", color: MUTE }}>
        <p>This program is no longer available.</p>
        <button onClick={onBack} style={{ ...btn(TEAL, "#fff"), marginTop: 8 }}>Back to programs</button>
      </div>
    );
  }
  const save = hospital.us - hospital.kr;
  const savePct = hospital.us > 0 ? Math.round((save / hospital.us) * 100) : 0;
  const programIncludes = [
    "Specialist consultation & second-opinion review",
    `${dept?.name || "Treatment"} procedure at ${hospital.name}`,
    "Pre-op diagnostics and imaging",
    "Inpatient stay & nursing care",
    "Post-op check-ups before discharge",
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={onBack} style={{ border: "none", background: "transparent", cursor: "pointer", color: SUB, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, padding: "6px 0", marginBottom: 8 }}>
        <ArrowLeft size={16} /> Back to {dept?.name || "programs"}
      </button>

      <OverlayImage image={hospital.image} height={280} />

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20, alignItems: "flex-start" }}>
        {/* main column */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: 0 }}>{hospital.name}</h1>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#eef6ff", color: "#2563a8", padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              <Award size={12} /> {hospital.accred}
            </span>
            {hospital.covered && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: TEAL_SOFT, color: TEAL, padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                <Check size={12} /> Covered
              </span>
            )}
          </div>
          <div style={{ fontSize: 16, color: TEAL, fontWeight: 700, marginTop: 8 }}>{hospital.program}</div>
          {hospital.lead && <div style={{ fontSize: 14.5, color: SUB, marginTop: 4 }}>{hospital.lead}</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, fontSize: 14, color: SUB, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Star size={15} fill="#f5a623" color="#f5a623" /><b style={{ color: INK }}>{hospital.rating}</b> ({hospital.reviews} reviews)</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={15} /> {hospital.city}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={15} /> {hospital.weeks} in Korea</span>
          </div>

          <SectionDivider />

          <h3 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: "0 0 12px" }}>What this program includes</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {programIncludes.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: SUB }}>
                <CheckCircle2 size={18} color={TEAL} style={{ flexShrink: 0, marginTop: 1 }} /> {p}
              </div>
            ))}
          </div>

          <SectionDivider />

          <h3 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: "0 0 6px" }}>End-to-end, handled by KoreCare</h3>
          <p style={{ fontSize: 14, color: SUB, margin: "0 0 16px" }}>Beyond the procedure itself, your full journey is coordinated for you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="detail-care-grid">
            {CARE_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ display: "flex", gap: 12, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: TEAL_SOFT, color: TEAL, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 700, color: INK, fontSize: 13.5 }}>{s.t}</div>
                    <div style={{ fontSize: 12.5, color: SUB, lineHeight: 1.45, marginTop: 2 }}>{s.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* price / cta column */}
        <div style={{ width: 320, flexShrink: 0, position: "sticky", top: 80 }} className="detail-aside">
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 22, boxShadow: "0 6px 24px rgba(11,107,107,.08)" }}>
            <div style={{ fontSize: 12, color: MUTE }}>Typical US cost</div>
            <div style={{ fontSize: 15, color: MUTE, textDecoration: "line-through" }}>${hospital.us.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: MUTE, marginTop: 8 }}>Korea all-in price</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: TEAL, lineHeight: 1.1 }}>${hospital.kr.toLocaleString()}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eafaf2", color: "#1f9d6b", padding: "5px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700, marginTop: 10 }}>
              Save ${save.toLocaleString()} ({savePct}% less)
            </div>

            {hospital.covered && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14, fontSize: 12.5, color: SUB, background: TEAL_SOFT, borderRadius: 10, padding: "10px 12px" }}>
                <Shield size={15} color={TEAL} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Covered under your <b>{insurer}</b> referral. Final out-of-pocket confirmed after records review.</span>
              </div>
            )}

            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              <button onClick={onContact} style={{ ...btn(TEAL, "#fff"), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Send size={16} /> Request this plan
              </button>
              <button onClick={onContact} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Phone size={16} /> Talk to a coordinator
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12, color: MUTE }}>
              <Calendar size={14} /> Estimated stay: {hospital.weeks}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:760px){.detail-aside{width:100%!important;position:static!important}.detail-care-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function SectionDivider() {
  return <div style={{ height: 1, background: LINE, margin: "24px 0" }} />;
}

/* ========================================================================
   FAQ  (FAQ_ITEMS 는 site-data.js 로 이동 — 어드민 CMS 와 공유)
   ======================================================================== */

function FAQPage({ onContact }) {
  const [open, setOpen] = useState(0);
  // SSG 는 정적 FAQ_ITEMS(SEO). 클라이언트에서 어드민 CMS 오버레이(korecare_faqs) 반영.
  const [items, setItems] = useState(FAQ_ITEMS);
  useEffect(() => { try { const o = JSON.parse(localStorage.getItem("korecare_faqs") || "null"); if (o?.length) setItems(o); } catch (_) {} }, []);
  return (
    <div style={{ marginTop: 28, maxWidth: 760 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
        <HelpCircle size={15} /> Frequently asked questions
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>Everything you might be wondering</h1>
      <p style={{ fontSize: 15, color: SUB, margin: "0 0 24px" }}>Can't find your answer? Our coordinators are one message away.</p>

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ background: "#fff", border: `1px solid ${isOpen ? TEAL : LINE}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", border: "none", background: isOpen ? TEAL_SOFT : "#fff", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{item.q}</span>
                <ChevronDown size={18} color={isOpen ? TEAL : MUTE} style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {isOpen && (
                <div style={{ padding: "0 18px 16px", fontSize: 14, color: SUB, lineHeight: 1.6 }}>{item.a}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 26, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Still have a question?</div>
          <div style={{ fontSize: 13.5, color: SUB, marginTop: 2 }}>Talk to a KoreCare coordinator — no obligation.</div>
        </div>
        <button onClick={onContact} style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={16} /> Contact us
        </button>
      </div>
    </div>
  );
}

/* ========================================================================
   CONTACT
   ======================================================================== */
function ContactPage({ depts, prefillHospital }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    interest: prefillHospital ? `${prefillHospital.name} — ${prefillHospital.program}` : "",
    message: prefillHospital ? `I'd like to know more about the ${prefillHospital.program} at ${prefillHospital.name}.` : "",
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true); setErr("");
    try {
      await submitLead({ ...form, source: "contact", page: typeof window !== "undefined" ? window.location.href : "" });
      trackEvent("lead_submit", { form: "contact" });
      setSent(true);
    } catch (_) {
      setErr("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const interestOptions = [];
  depts.forEach((d) => d.hospitals.forEach((h) => interestOptions.push(`${h.name} — ${h.program}`)));

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
        <Mail size={15} /> Contact us
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>Talk to a care coordinator</h1>
      <p style={{ fontSize: 15, color: SUB, margin: "0 0 24px" }}>Tell us a little about what you need. A coordinator replies within one business day.</p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* form */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {sent ? (
            <div style={{ background: "#fff", border: `1px solid ${TEAL}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: TEAL_SOFT, color: TEAL, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: "0 0 6px" }}>Thanks, {form.name.split(" ")[0] || "there"}!</h3>
              <p style={{ fontSize: 14, color: SUB, margin: "0 0 18px", lineHeight: 1.6 }}>Your request has been received. A KoreCare coordinator will reach out to <b>{form.email}</b> within one business day.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", interest: "", message: "" }); }} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}` }}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 22 }}>
              <Field label="Full name *">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" style={contactInput} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="contact-row">
                <Field label="Email *">
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@email.com" style={contactInput} />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" style={contactInput} />
                </Field>
              </div>
              <Field label="Program of interest">
                <select value={form.interest} onChange={(e) => set("interest", e.target.value)} style={{ ...contactInput, background: "#fff" }}>
                  <option value="">— Select a program (optional) —</option>
                  {interestOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Message">
                <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={5} placeholder="Tell us about your condition, timing, or questions…" style={{ ...contactInput, resize: "vertical", fontFamily: "inherit" }} />
              </Field>
              {err && <div style={{ fontSize: 13, color: ACCENT, background: ACCENT_SOFT, borderRadius: 8, padding: "8px 12px", marginBottom: 4 }}>{err}</div>}
              <button type="submit" disabled={!valid || submitting} style={{ ...btn(valid && !submitting ? TEAL : "#cfd8dd", "#fff"), width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: valid && !submitting ? "pointer" : "not-allowed", marginTop: 4 }}>
                <Send size={16} /> {submitting ? "Sending…" : "Send request"}
              </button>
              <div style={{ fontSize: 11.5, color: MUTE, textAlign: "center", marginTop: 10 }}>By sending, you agree to be contacted about your inquiry. We never share your information.</div>
            </form>
          )}
        </div>

        {/* contact info */}
        <div style={{ width: 300, flexShrink: 0 }} className="contact-aside">
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: "0 0 14px" }}>Reach us directly</h3>
            <ContactRow icon={<Mail size={16} />} label="Email" value="care@korecare.example" />
            <ContactRow icon={<Phone size={16} />} label="Coordinator line" value="+1 (888) 555-0142" />
            <ContactRow icon={<MessageSquare size={16} />} label="Hours" value="Mon–Fri, 9am–6pm ET" />
            <ContactRow icon={<Users size={16} />} label="In Korea" value="Seoul international patient desk" last />
          </div>
          <div style={{ background: TEAL_SOFT, borderRadius: 16, padding: 18, marginTop: 12, fontSize: 13, color: TEAL, display: "flex", gap: 10 }}>
            <Shield size={18} style={{ flexShrink: 0 }} />
            <span>Referred by your insurer? Mention it and we'll fast-track your coverage check.</span>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:760px){.contact-aside{width:100%!important}.contact-row{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: SUB, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
function ContactRow({ icon, label, value, last }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: last ? 0 : 14, marginBottom: last ? 0 : 14, borderBottom: last ? "none" : `1px solid ${LINE}` }}>
      <span style={{ color: TEAL, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11.5, color: MUTE }}>{label}</div>
        <div style={{ fontSize: 14, color: INK, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
const contactInput = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 9, padding: "10px 12px", fontSize: 14, color: INK, outline: "none", boxSizing: "border-box" };

/* ------------------------------- Footer ------------------------------- */
function Footer({ brand, onNav, onHome, lang = "en" }) {
  const L = LANDING[lang];
  // 컬럼 라벨 → 실제 라우트 이동 매핑 (디자인 라벨은 LANDING 사전, 동작은 기존 라우트)
  const progNav = [() => onHome(), () => onNav({ name: "treatments" }), () => onNav({ name: "treatments" }), () => onNav({ name: "howitworks" })];
  const companyNav = [() => onNav({ name: "about" }), () => onNav({ name: "faq" }), () => onNav({ name: "contact" }), () => onNav({ name: "blog" })];
  const legalNav = [() => onNav({ name: "legal", doc: "privacy" }), () => onNav({ name: "legal", doc: "terms" }), () => onNav({ name: "legal", doc: "refund" })];
  const col = (title, items, navs) => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((label, i) => (
          <button key={i} onClick={navs[i]} style={footerLink}>{label}</button>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ background: NAVY, color: "#aebdd8", marginTop: "auto" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 28px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 32 }} className="kc-footer-grid">
        <div>
          <button onClick={onHome} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 8, background: TEAL, color: "#fff", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 15, fontWeight: 800 }}>K</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: "#fff" }}>{brand.name}</span>
          </button>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 16px", maxWidth: 280 }}>{L.footerBlurb}</p>
          <div style={{ display: "flex", gap: 10 }}>
            {["JCI", "ISO 9001", "HIPAA"].map((b) => (
              <span key={b} style={{ fontSize: 11, fontWeight: 800, color: "#fff", border: `1.5px solid ${NAVY_LINE}`, borderRadius: 5, padding: "4px 8px" }}>{b}</span>
            ))}
          </div>
        </div>
        {col(L.footerPrograms, L.footProgItems, progNav)}
        {col(L.footerCompany, L.footCompanyItems, companyNav)}
        {col(L.footerLegal, L.footLegalItems, legalNav)}
      </div>
      <div style={{ borderTop: `1px solid ${NAVY_LINE}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 28px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 12.5, color: "#7d92b8" }}>
          <span>{L.footNote}</span>
          <span style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/admin" style={{ color: "#7d92b8", textDecoration: "none" }}>운영자 어드민</a>
            <a href="/hospital-admin" style={{ color: "#7d92b8", textDecoration: "none" }}>병원 관리자</a>
            <span>{L.footNote2}</span>
          </span>
        </div>
      </div>
      <style>{`@media(max-width:760px){.kc-footer-grid{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}
const footerLink = { border: "none", background: "transparent", cursor: "pointer", color: "#aebdd8", fontSize: 13.5, padding: 0, fontWeight: 500, textAlign: "left" };

/* ========================================================================
   ABOUT  (mirrors SafeDoc "Company")
   ======================================================================== */
function AboutPage({ insurer, onContact, onPrograms }) {
  const stats = [
    { n: "500+", l: "Partner hospitals & clinics in Korea" },
    { n: "12", l: "JCI-accredited tertiary centers" },
    { n: "60%+", l: "Average savings vs. US list price" },
    { n: "24/7", l: "English coordinator support" },
  ];
  const values = [
    { icon: Shield, t: "Insurer-aligned", d: "We work directly with referrers so covered programs are clear before you commit." },
    { icon: Award, t: "Accredited only", d: "Every partner is internationally accredited (JCI) with a dedicated international patient center." },
    { icon: Users, t: "One team, end to end", d: "From records review to US aftercare, a single coordinator owns your journey." },
  ];
  return (
    <div style={{ marginTop: 28, maxWidth: 860 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
        <Building2 size={15} /> About KoreCare
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>World-class care in Korea, fully managed</h1>
      <p style={{ fontSize: 15.5, color: SUB, margin: "0 0 22px", lineHeight: 1.6 }}>
        KoreCare connects internationally-referred patients with Korea's top accredited hospitals — and manages
        every step around the procedure. Your insurer covers the treatment; we handle travel, language, recovery,
        and follow-up so you never coordinate a single vendor yourself.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="about-stats">
        {stats.map((s, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: TEAL }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: SUB, marginTop: 4, lineHeight: 1.4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <SectionDivider />

      <h3 style={{ fontSize: 18, fontWeight: 800, color: INK, margin: "0 0 14px" }}>What we stand for</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {values.map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={i} style={{ display: "flex", gap: 14, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: TEAL_SOFT, color: TEAL, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={20} /></div>
              <div>
                <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{v.t}</div>
                <div style={{ fontSize: 13.5, color: SUB, marginTop: 3, lineHeight: 1.5 }}>{v.d}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 22, background: TEAL_SOFT, borderRadius: 14, padding: 20, fontSize: 13.5, color: TEAL, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Shield size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Referred by <b>{insurer}</b>? Your covered programs are highlighted across the site — start from Programs or talk to a coordinator.</span>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button onClick={onPrograms} style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 8 }}>Browse programs <ChevronRight size={16} /></button>
        <button onClick={onContact} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}`, display: "inline-flex", alignItems: "center", gap: 8 }}>Contact us</button>
      </div>
      <style>{`@media(max-width:760px){.about-stats{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}

/* ========================================================================
   HOW IT WORKS  (mirrors SafeDoc "Service" + Transportation/Accommodation/Tour)
   ======================================================================== */
function HowItWorksPage({ onPrograms, onContact }) {
  const journey = [
    { icon: Stethoscope, t: "1 · Match & review", d: "Share your records. We match a covered program and confirm your out-of-pocket before you commit." },
    { icon: Plane, t: "2 · Transportation", d: "Flights, visa support and airport pickup arranged for you and one companion." },
    { icon: Hotel, t: "3 · Accommodation", d: "Hospital-adjacent recovery stay booked to fit your treatment schedule." },
    { icon: Languages, t: "4 · In-Korea support", d: "A dedicated English coordinator and medical interpreter join every appointment." },
    { icon: MapPin, t: "5 · Tour & recovery", d: "Optional guided tours and wellness activities during recovery downtime." },
    { icon: HeartPulse, t: "6 · US aftercare", d: "We prepare your medical summary and coordinate follow-up with your home doctor." },
  ];
  return (
    <div style={{ marginTop: 28, maxWidth: 920 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
        <Plane size={15} /> How it works
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>One team, the whole journey</h1>
      <p style={{ fontSize: 15.5, color: SUB, margin: "0 0 24px", lineHeight: 1.6 }}>
        Your insurer covers the procedure — KoreCare manages everything around it. Transportation, accommodation,
        language, tours and aftercare are all handled by a single coordinator.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="how-grid">
        {journey.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ display: "flex", gap: 14, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: TEAL_SOFT, color: TEAL, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={20} /></div>
              <div>
                <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{s.t}</div>
                <div style={{ fontSize: 13.5, color: SUB, marginTop: 3, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Ready to see covered programs?</div>
          <div style={{ fontSize: 13.5, color: SUB, marginTop: 2 }}>Browse by department and see your savings instantly.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onPrograms} style={{ ...btn(TEAL, "#fff"), display: "inline-flex", alignItems: "center", gap: 8 }}>View programs <ChevronRight size={16} /></button>
          <button onClick={onContact} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}` }}>Contact us</button>
        </div>
      </div>
      <style>{`@media(max-width:760px){.how-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ========================================================================
   LEGAL  (Privacy / Terms / Refund — mirrors SafeDoc footer)
   ======================================================================== */
const LEGAL_DOCS = {
  privacy: {
    title: "Privacy Policy",
    intro: "How KoreCare collects, uses and protects your personal and health information.",
    sections: [
      { h: "Information we collect", b: "Contact details you submit (name, email, phone) and any medical records you share to confirm program coverage. We collect only what is needed to coordinate your care." },
      { h: "How we use it", b: "To match you to covered programs, confirm out-of-pocket costs with your insurer, and arrange travel, accommodation and aftercare. We never sell your information." },
      { h: "Sharing", b: "We share relevant medical details only with the partner hospital you select and, where applicable, your referring insurer — always to deliver your care." },
      { h: "Your rights", b: "You may request access to, correction of, or deletion of your data at any time by contacting us." },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "The terms that govern your use of the KoreCare website and coordination services.",
    sections: [
      { h: "Service scope", b: "KoreCare is a care-coordination service. We arrange and manage the journey around medical treatment; we do not provide medical care ourselves and are not a substitute for professional medical advice." },
      { h: "Quotes & coverage", b: "Prices shown are estimates. Final out-of-pocket amounts are confirmed after a records review with your insurer before any commitment." },
      { h: "Bookings", b: "Travel, accommodation and treatment bookings are made on your behalf with third-party providers and partner hospitals, subject to their terms." },
      { h: "Liability", b: "This site is a prototype for demonstration. Treatment outcomes are the responsibility of the providing hospital and your medical team." },
    ],
  },
  refund: {
    title: "Refund Policy",
    intro: "When and how coordination fees and bookings can be refunded.",
    sections: [
      { h: "Coordination fees", b: "Any coordination fee is fully refundable until you confirm a program. After confirmation, refunds are prorated against services already arranged." },
      { h: "Travel & accommodation", b: "Flights and stays follow the cancellation terms of the airline and property. We help you secure flexible options where possible." },
      { h: "Treatment deposits", b: "Hospital deposits are refundable according to the partner hospital's policy, which we disclose before you pay." },
      { h: "How to request", b: "Email our coordinator line with your booking reference; refunds are processed to your original payment method." },
    ],
  },
};

function LegalPage({ doc, onContact }) {
  const d = LEGAL_DOCS[doc] || LEGAL_DOCS.privacy;
  return (
    <div style={{ marginTop: 28, maxWidth: 760 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_SOFT, color: TEAL, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
        <Shield size={15} /> Legal
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "14px 0 6px" }}>{d.title}</h1>
      <p style={{ fontSize: 15, color: SUB, margin: "0 0 22px", lineHeight: 1.6 }}>{d.intro}</p>

      <div style={{ display: "grid", gap: 14 }}>
        {d.sections.map((s, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontWeight: 700, color: INK, fontSize: 15, marginBottom: 6 }}>{s.h}</div>
            <div style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6 }}>{s.b}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, fontSize: 12.5, color: MUTE }}>
        Prototype document for demonstration — not legal advice. Questions?{" "}
        <button onClick={onContact} style={{ ...footerLink, color: TEAL, fontWeight: 600 }}>Contact us</button>.
      </div>
    </div>
  );
}

/* =========================================================================
   ADMIN EDITOR
   ========================================================================= */
function AdminEditor({ content, setContent, activeDeptId, setActiveDeptId, onClose, isMobile }) {
  const [tab, setTab] = useState("hero");

  const update = (fn) => setContent((prev) => {
    const next = structuredClone(prev);
    fn(next);
    return next;
  });

  const activeDept = content.departments.find((d) => d.id === activeDeptId) || content.departments.find((d) => d.active);

  const shellStyle = isMobile
    ? { position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 400, background: "#fff", borderLeft: `1px solid ${LINE}`, height: "100vh", overflowY: "auto", zIndex: 41, boxShadow: "-8px 0 40px rgba(8,20,24,.25)" }
    : { width: 380, flexShrink: 0, background: "#fff", borderLeft: `1px solid ${LINE}`, height: "100vh", position: "sticky", top: 0, overflowY: "auto" };
  return (
    <div style={shellStyle}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: INK }}>
          <Settings size={18} color={TEAL} /> Content admin
        </div>
        <button onClick={onClose} style={{ border: "none", background: "#f6f8f9", borderRadius: 8, padding: 6, cursor: "pointer", color: SUB }}><X size={16} /></button>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "12px 18px", borderBottom: `1px solid ${LINE}` }}>
        {[["hero", "Hero image"], ["depts", "Departments"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, border: "none", cursor: "pointer", borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600,
            background: tab === id ? TEAL_SOFT : "#f6f8f9", color: tab === id ? TEAL : SUB,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 18 }}>
        {tab === "hero" && (
          <ImageEditor
            label="Hero banner"
            image={content.hero.image}
            onChange={(img) => update((n) => { n.hero.image = img; })}
          />
        )}
        {tab === "depts" && (
          <DeptEditor content={content} update={update} activeDept={activeDept} setActiveDeptId={setActiveDeptId} />
        )}
      </div>
    </div>
  );
}

/* ---------------- image + overlay editor (shared) ---------------- */
function ImageEditor({ label, image, onChange }) {
  const setField = (k, v) => onChange({ ...image, [k]: v });
  const setOverlay = (id, k, v) => onChange({ ...image, overlays: image.overlays.map((o) => o.id === id ? { ...o, [k]: v } : o) });
  const addOverlay = () => onChange({ ...image, overlays: [...(image.overlays || []), { id: "ov" + Date.now(), text: "New text", x: 6, y: 50, size: 22, weight: 700, color: "#ffffff", align: "left", maxWidth: 70 }] });
  const removeOverlay = (id) => onChange({ ...image, overlays: image.overlays.filter((o) => o.id !== id) });

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: MUTE, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>

      <div style={{ marginBottom: 12 }}>
        <OverlayImage image={image} height={130} radius={10} />
      </div>

      <FieldLabel icon={<ImageIcon size={13} />} text="Image URL" />
      <input value={image.url} onChange={(e) => setField("url", e.target.value)} placeholder="https://… or /uploads/…" style={input} />

      <div style={{ marginTop: 8 }}>
        <FieldLabel icon={<Palette size={13} />} text={`Scrim (text shade) · ${Math.round((image.overlayScrim ?? 0) * 100)}%`} />
        <input type="range" min={0} max={0.8} step={0.05} value={image.overlayScrim ?? 0} onChange={(e) => setField("overlayScrim", parseFloat(e.target.value))} style={{ width: "100%" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 8px" }}>
        <FieldLabel icon={<Type size={13} />} text="Text overlays" noMargin />
        <button onClick={addOverlay} style={{ ...btn(TEAL_SOFT, TEAL), padding: "5px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Plus size={13} /> Add text
        </button>
      </div>

      {(image.overlays || []).length === 0 && (
        <div style={{ fontSize: 12.5, color: MUTE, padding: "8px 0" }}>No overlay text. Add one to layer text on the image.</div>
      )}

      {(image.overlays || []).map((o) => (
        <div key={o.id} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: 12, marginBottom: 10, background: "#fafbfc" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input value={o.text} onChange={(e) => setOverlay(o.id, "text", e.target.value)} style={{ ...input, marginTop: 0 }} />
            <button onClick={() => removeOverlay(o.id)} style={{ border: "none", background: "#fff", color: "#c0392b", borderRadius: 7, padding: "0 8px", cursor: "pointer" }}><Trash2 size={14} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Mini label={`X ${o.x}%`} icon={<Move size={11} />}>
              <input type="range" min={0} max={90} value={o.x} onChange={(e) => setOverlay(o.id, "x", +e.target.value)} style={{ width: "100%" }} />
            </Mini>
            <Mini label={`Y ${o.y}%`} icon={<Move size={11} />}>
              <input type="range" min={0} max={100} value={o.y} onChange={(e) => setOverlay(o.id, "y", +e.target.value)} style={{ width: "100%" }} />
            </Mini>
            <Mini label={`Size ${o.size}px`}>
              <input type="range" min={11} max={48} value={o.size} onChange={(e) => setOverlay(o.id, "size", +e.target.value)} style={{ width: "100%" }} />
            </Mini>
            <Mini label="Weight">
              <select value={o.weight} onChange={(e) => setOverlay(o.id, "weight", +e.target.value)} style={selectS}>
                <option value={400}>Regular</option><option value={500}>Medium</option>
                <option value={700}>Bold</option><option value={800}>Heavy</option>
              </select>
            </Mini>
            <Mini label="Align">
              <select value={o.align} onChange={(e) => setOverlay(o.id, "align", e.target.value)} style={selectS}>
                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
              </select>
            </Mini>
            <Mini label="Color">
              <input type="color" value={o.color} onChange={(e) => setOverlay(o.id, "color", e.target.value)} style={{ width: "100%", height: 28, border: `1px solid ${LINE}`, borderRadius: 6, background: "#fff", cursor: "pointer" }} />
            </Mini>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------- department / hospital editor ------------------- */
function DeptEditor({ content, update, activeDept, setActiveDeptId }) {
  const addDept = () => {
    const id = "dept" + Date.now();
    update((n) => { n.departments.push({ id, name: "New Department", active: true, hospitals: [] }); });
    setActiveDeptId(id);
  };
  const addHospital = (deptId) => update((n) => {
    const d = n.departments.find((x) => x.id === deptId);
    d.hospitals.push({
      id: "h" + Date.now(), name: "New Hospital", city: "Seoul", rating: 4.8, reviews: 0,
      accred: "JCI", program: "New Program", weeks: "2–3 wks", us: 100000, kr: 35000, covered: true, lead: "",
      image: { url: "", alt: "", overlays: [], overlayScrim: 0.35 },
    });
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <FieldLabel icon={<Stethoscope size={13} />} text="Departments" noMargin />
        <button onClick={addDept} style={{ ...btn(TEAL_SOFT, TEAL), padding: "5px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Plus size={13} /> Add
        </button>
      </div>

      {content.departments.map((d) => (
        <div key={d.id} style={{ border: `1px solid ${d.id === activeDept?.id ? TEAL : LINE}`, borderRadius: 10, padding: 10, marginBottom: 8, background: d.id === activeDept?.id ? TEAL_SOFT : "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input value={d.name} onChange={(e) => update((n) => { n.departments.find((x) => x.id === d.id).name = e.target.value; })} style={{ ...input, marginTop: 0, fontWeight: 600 }} />
            <button onClick={() => setActiveDeptId(d.id)} title="Preview" style={{ border: "none", background: "#fff", borderRadius: 7, padding: "0 8px", cursor: "pointer", color: TEAL }}><Eye size={14} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: SUB, cursor: "pointer" }}>
              <input type="checkbox" checked={d.active} onChange={(e) => update((n) => { n.departments.find((x) => x.id === d.id).active = e.target.checked; })} />
              Visible on site
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: MUTE }}>{d.hospitals.length} hospitals</span>
              <button onClick={() => update((n) => { n.departments = n.departments.filter((x) => x.id !== d.id); })} style={{ border: "none", background: "transparent", color: "#c0392b", cursor: "pointer", padding: 0 }}><Trash2 size={13} /></button>
            </div>
          </div>
        </div>
      ))}

      {activeDept && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <FieldLabel icon={<Building2 size={13} />} text={`Hospitals · ${activeDept.name}`} noMargin />
            <button onClick={() => addHospital(activeDept.id)} style={{ ...btn(TEAL_SOFT, TEAL), padding: "5px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Plus size={13} /> Add
            </button>
          </div>

          {activeDept.hospitals.map((h) => (
            <HospitalEditor key={h.id} hospital={h} deptId={activeDept.id} update={update} />
          ))}
          {activeDept.hospitals.length === 0 && <div style={{ fontSize: 12.5, color: MUTE }}>No hospitals yet. Add one above.</div>}
        </div>
      )}
    </div>
  );
}

function HospitalEditor({ hospital, deptId, update }) {
  const [open, setOpen] = useState(false);
  const setH = (k, v) => update((n) => {
    const h = n.departments.find((x) => x.id === deptId).hospitals.find((x) => x.id === hospital.id);
    h[k] = v;
  });
  const setImage = (img) => update((n) => {
    const h = n.departments.find((x) => x.id === deptId).hospitals.find((x) => x.id === hospital.id);
    h.image = img;
  });
  const remove = () => update((n) => {
    const d = n.departments.find((x) => x.id === deptId);
    d.hospitals = d.hospitals.filter((x) => x.id !== hospital.id);
  });

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", background: "#fafbfc" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{hospital.name}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={(e) => { e.stopPropagation(); remove(); }} style={{ border: "none", background: "transparent", color: "#c0392b", cursor: "pointer", padding: 0 }}><Trash2 size={13} /></button>
          <ChevronRight size={15} color={MUTE} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        </div>
      </div>

      {open && (
        <div style={{ padding: 12, borderTop: `1px solid ${LINE}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Labeled label="Name"><input value={hospital.name} onChange={(e) => setH("name", e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="City"><input value={hospital.city} onChange={(e) => setH("city", e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Program"><input value={hospital.program} onChange={(e) => setH("program", e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Accreditation"><input value={hospital.accred} onChange={(e) => setH("accred", e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Tagline"><input value={hospital.lead} onChange={(e) => setH("lead", e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Stay"><input value={hospital.weeks} onChange={(e) => setH("weeks", e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="US cost $"><input type="number" value={hospital.us} onChange={(e) => setH("us", +e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Korea $"><input type="number" value={hospital.kr} onChange={(e) => setH("kr", +e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Rating"><input type="number" step="0.1" value={hospital.rating} onChange={(e) => setH("rating", +e.target.value)} style={inputSm} /></Labeled>
            <Labeled label="Reviews"><input type="number" value={hospital.reviews} onChange={(e) => setH("reviews", +e.target.value)} style={inputSm} /></Labeled>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: SUB, margin: "8px 0 14px", cursor: "pointer" }}>
            <input type="checkbox" checked={hospital.covered} onChange={(e) => setH("covered", e.target.checked)} /> Covered by insurer
          </label>

          <ImageEditor label="Hospital image" image={hospital.image} onChange={setImage} />
        </div>
      )}
    </div>
  );
}

/* ------------------------- small UI atoms ------------------------- */
function FieldLabel({ icon, text, noMargin }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: SUB, marginBottom: noMargin ? 0 : 6 }}>
      <span style={{ color: TEAL }}>{icon}</span>{text}
    </div>
  );
}
function Mini({ label, icon, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: MUTE, marginBottom: 3, display: "flex", alignItems: "center", gap: 3 }}>{icon}{label}</div>
      {children}
    </div>
  );
}
function Labeled({ label, children }) {
  return <div><div style={{ fontSize: 11, color: MUTE, marginBottom: 3 }}>{label}</div>{children}</div>;
}

const input = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: INK, outline: "none", boxSizing: "border-box" };
const inputSm = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 7, padding: "6px 8px", fontSize: 12.5, color: INK, outline: "none", boxSizing: "border-box" };
const selectS = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 6, padding: "5px 6px", fontSize: 12, color: INK, background: "#fff", outline: "none" };

/* btn() 은 theme.js 로 이동 (상단 import) */
