/* =========================================================================
   site-data.js — 요구사항정의서(글로벌 웹사이트) 고객 화면용 mock 데이터 + i18n
   백엔드(어드민 등록/예약 DB)가 생기면 이 모듈을 API 응답으로 교체하면 된다.
   진료과(deptId)는 App.jsx initialContent.departments 의 id와 일치:
     onco(Oncology) / ortho(Orthopedics & Spine) / cardiac(Cardiac Surgery) / screen(Full Health Screening)
   시술은 deptIds(복수) 를 가질 수 있어 — 카테고리 교차 노출 규칙 구현.
   ========================================================================= */

/* ------------------------------- 시술 (treatments) ------------------------------- */
export const treatments = [
  {
    id: "proton",
    name: { en: "Proton Therapy", ko: "양성자 치료" },
    deptIds: ["onco"], hospitalId: "snc", city: "Seoul",
    price: 52000, usPrice: 145000, duration: { en: "3–5 weeks", ko: "3~5주" },
    rating: 4.9, reviews: 540, covered: true,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    summary: { en: "Precision radiation that targets tumors while sparing healthy tissue.", ko: "건강한 조직은 보호하면서 종양만 정밀 조사하는 방사선 치료." },
    recommendedFor: { en: "Patients with solid tumors near critical organs (brain, spine, lung, prostate).", ko: "뇌·척수·폐·전립선 등 주요 장기 인접 고형암 환자." },
    effects: { en: "Higher dose to the tumor with fewer side effects than conventional radiation.", ko: "기존 방사선 대비 부작용은 줄이고 종양엔 더 높은 선량 전달." },
    duration_detail: { en: "20–30 min per session, 5 sessions/week.", ko: "회당 20~30분, 주 5회." },
    steps: {
      en: ["Records review & imaging", "Treatment planning (CT/MRI simulation)", "Daily proton sessions", "Weekly oncologist review", "Post-treatment follow-up"],
      ko: ["기록 검토 및 영상 촬영", "치료 계획 수립(CT/MRI 시뮬레이션)", "매일 양성자 치료", "주간 종양내과 진료", "치료 후 추적 관찰"],
    },
    cautions: { en: "Mild fatigue and localized skin reaction possible. Pregnancy excluded.", ko: "경미한 피로·국소 피부 반응 가능. 임신부 제외." },
  },
  {
    id: "robotic-onco",
    name: { en: "Robotic Cancer Surgery", ko: "로봇 암 수술" },
    deptIds: ["onco"], hospitalId: "asan", city: "Seoul",
    price: 61000, usPrice: 168000, duration: { en: "4–6 weeks", ko: "4~6주" },
    rating: 4.9, reviews: 612, covered: true,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80",
    summary: { en: "Minimally-invasive tumor removal with robotic precision.", ko: "로봇 정밀 제어로 최소 절개 종양 제거." },
    recommendedFor: { en: "Early to mid-stage cancers suitable for minimally-invasive resection.", ko: "최소 침습 절제가 가능한 초·중기 암." },
    effects: { en: "Smaller incisions, less blood loss, faster recovery.", ko: "작은 절개·출혈 감소·빠른 회복." },
    duration_detail: { en: "3–5 hr surgery, 5–7 day hospital stay.", ko: "수술 3~5시간, 입원 5~7일." },
    steps: { en: ["Pre-op assessment", "Robotic resection", "ICU monitoring", "Ward recovery", "Discharge & aftercare plan"], ko: ["수술 전 평가", "로봇 절제술", "중환자실 관찰", "병동 회복", "퇴원 및 사후관리 계획"] },
    cautions: { en: "General anesthesia risks apply. Not for advanced metastatic disease.", ko: "전신마취 위험 적용. 진행성 전이암 제외." },
  },
  {
    id: "endoscopic-spine",
    name: { en: "Endoscopic Spine Surgery", ko: "내시경 척추 수술" },
    deptIds: ["ortho"], hospitalId: "wooridul", city: "Seoul",
    price: 28000, usPrice: 92000, duration: { en: "2–3 weeks", ko: "2~3주" },
    rating: 4.9, reviews: 720, covered: true,
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
    summary: { en: "Keyhole spine surgery through a 7mm incision.", ko: "7mm 절개로 진행하는 키홀 척추 수술." },
    recommendedFor: { en: "Herniated disc, spinal stenosis not responding to conservative care.", ko: "보존치료에 반응 없는 디스크 탈출·척추관 협착." },
    effects: { en: "Same-day walking, minimal scarring, rapid return to work.", ko: "당일 보행·흉터 최소·빠른 일상 복귀." },
    duration_detail: { en: "1–2 hr procedure, 1–2 day stay.", ko: "시술 1~2시간, 입원 1~2일." },
    steps: { en: ["MRI review", "Local/sedation anesthesia", "Endoscopic decompression", "Same-day mobilization", "Physiotherapy plan"], ko: ["MRI 판독", "국소/수면 마취", "내시경 감압술", "당일 보행", "물리치료 계획"] },
    cautions: { en: "Not suitable for severe instability requiring fusion.", ko: "유합술이 필요한 심한 불안정증엔 부적합." },
  },
  {
    id: "coronary-bypass",
    name: { en: "Coronary Bypass Program", ko: "관상동맥 우회로술" },
    deptIds: ["cardiac"], hospitalId: "samsung", city: "Seoul",
    price: 47000, usPrice: 158000, duration: { en: "3–4 weeks", ko: "3~4주" },
    rating: 4.9, reviews: 502, covered: true,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    summary: { en: "Hybrid cardiac suite bypass for blocked coronary arteries.", ko: "막힌 관상동맥을 위한 하이브리드 심장 수술." },
    recommendedFor: { en: "Multi-vessel coronary artery disease.", ko: "다혈관 관상동맥 질환." },
    effects: { en: "Restored blood flow, reduced angina, improved longevity.", ko: "혈류 회복·협심증 완화·생존율 향상." },
    duration_detail: { en: "4–6 hr surgery, 7–10 day stay.", ko: "수술 4~6시간, 입원 7~10일." },
    steps: { en: ["Cardiac workup", "Bypass surgery", "ICU recovery", "Cardiac rehab", "Aftercare coordination"], ko: ["심장 정밀검사", "우회로술", "중환자실 회복", "심장 재활", "사후관리 연계"] },
    cautions: { en: "High-risk surgery; full cardiac clearance required.", ko: "고위험 수술; 심장 적합성 평가 필수." },
  },
  {
    id: "exec-screening",
    name: { en: "Executive Deep Screening", ko: "이그제큐티브 정밀검진" },
    deptIds: ["screen", "onco"], hospitalId: "asanhp", city: "Seoul",
    price: 2200, usPrice: 8500, duration: { en: "3–5 days", ko: "3~5일" },
    rating: 4.9, reviews: 890, covered: true,
    image: "https://images.unsplash.com/photo-1631563019676-dade0dbdb8fc?w=800&q=80",
    summary: { en: "Whole-body MRI + PET-CT in a single comprehensive visit.", ko: "전신 MRI + PET-CT 종합 검진." },
    recommendedFor: { en: "Adults seeking early cancer detection and full-body baseline.", ko: "조기 암 발견·전신 기준치 확인을 원하는 성인." },
    effects: { en: "Detects cancers and chronic risks at the earliest stage.", ko: "암·만성 위험을 최조기 단계에서 발견." },
    duration_detail: { en: "1 full day of scans, results in 48 hr.", ko: "검사 1일, 결과 48시간 내." },
    steps: { en: ["Intake & bloodwork", "Whole-body MRI", "PET-CT", "Specialist consultation", "Report & care plan"], ko: ["접수 및 혈액검사", "전신 MRI", "PET-CT", "전문의 상담", "리포트 및 케어 플랜"] },
    cautions: { en: "Contrast dye used; inform staff of allergies.", ko: "조영제 사용; 알레르기 사전 고지." },
  },
  {
    id: "targeted-therapy",
    name: { en: "Targeted Therapy Track", ko: "표적 치료" },
    deptIds: ["onco"], hospitalId: "asan", city: "Seoul",
    price: 61000, usPrice: 168000, duration: { en: "4–6 weeks", ko: "4~6주" },
    rating: 4.8, reviews: 318, covered: true,
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    summary: { en: "Molecular-profile-driven therapy for specific cancer mutations.", ko: "암 변이 분석 기반 맞춤 표적 치료." },
    recommendedFor: { en: "Cancers with actionable genetic mutations.", ko: "표적 가능한 유전자 변이를 가진 암." },
    effects: { en: "Attacks cancer cells while sparing normal cells.", ko: "정상 세포는 보호하며 암세포만 공격." },
    duration_detail: { en: "Oral/IV cycles over several weeks.", ko: "수주에 걸친 경구/정맥 주기." },
    steps: { en: ["Genomic profiling", "Therapy selection", "Treatment cycles", "Response monitoring", "Maintenance plan"], ko: ["유전체 분석", "치료제 선정", "치료 주기", "반응 모니터링", "유지 계획"] },
    cautions: { en: "Effectiveness depends on mutation profile.", ko: "변이 프로파일에 따라 효과 상이." },
  },
];

/* ------------------------------- 리뷰 (reviews) ------------------------------- */
export const reviews = [
  { id: "r1", author: "Michael R.", country: "🇺🇸 USA", rating: 5, treatmentId: "proton", treatment: "Proton Therapy", hospital: "Seoul National Cancer Center", date: "2026-05-12", text: "From the airport pickup to my last scan, everything was handled. The proton team explained each step in English. I saved over $90,000 vs. my US quote." },
  { id: "r2", author: "Sarah L.", country: "🇬🇧 UK", rating: 5, treatmentId: "endoscopic-spine", treatment: "Endoscopic Spine Surgery", hospital: "Wooridul Spine Hospital", date: "2026-04-28", text: "Walking the same day after spine surgery felt unreal. The coordinator stayed with me through every appointment." },
  { id: "r3", author: "James T.", country: "🇦🇺 Australia", rating: 4, treatmentId: "exec-screening", treatment: "Executive Deep Screening", hospital: "Asan Health Promotion Ctr.", date: "2026-04-10", text: "Most thorough check-up I've ever had. Whole-body MRI and PET-CT in one day, results in 48 hours." },
  { id: "r4", author: "Emma K.", country: "🇨🇦 Canada", rating: 5, treatmentId: "robotic-onco", treatment: "Robotic Cancer Surgery", hospital: "Asan Medical Oncology Inst.", date: "2026-03-22", text: "The robotic surgery left tiny scars and I recovered far faster than expected. World-class care." },
  { id: "r5", author: "David M.", country: "🇺🇸 USA", rating: 5, treatmentId: "coronary-bypass", treatment: "Coronary Bypass Program", hospital: "Samsung Heart Institute", date: "2026-03-05", text: "Heart surgery abroad was scary, but the hybrid suite and cardiac rehab were beyond what I imagined. My insurer covered the procedure." },
];

/* ------------------------------- 비포/애프터 (before & after) ------------------------------- */
export const beforeAfter = [
  { id: "ba1", treatmentId: "endoscopic-spine", treatment: "Endoscopic Spine Surgery", hospital: "Wooridul Spine Hospital", weeks: "6 weeks", before: "https://images.unsplash.com/photo-1559757175-080a93d6ba39?w=600&q=80", after: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", note: { en: "Returned to full mobility 6 weeks post-op.", ko: "수술 후 6주 만에 완전한 가동성 회복." } },
  { id: "ba2", treatmentId: "proton", treatment: "Proton Therapy", hospital: "Seoul National Cancer Center", weeks: "12 weeks", before: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80", after: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80", note: { en: "Tumor markers normalized after the treatment course.", ko: "치료 과정 후 종양 표지자 정상화." } },
  { id: "ba3", treatmentId: "robotic-onco", treatment: "Robotic Cancer Surgery", hospital: "Asan Medical Oncology Inst.", weeks: "8 weeks", before: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80", after: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80", note: { en: "Minimal scarring 8 weeks after robotic resection.", ko: "로봇 절제술 8주 후 흉터 최소화." } },
  { id: "ba4", treatmentId: "exec-screening", treatment: "Executive Deep Screening", hospital: "Asan Health Promotion Ctr.", weeks: "—", before: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80", after: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80", note: { en: "Early-stage finding caught and treated proactively.", ko: "초기 단계 소견을 선제적으로 발견·치료." } },
];

/* ------------------------------- 블로그 (blog) — 어드민 등록글 자동노출 mock ------------------------------- */
export const blogPosts = [
  { id: "b1", tag: "Guide", date: "2026-06-01", cover: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
    title: { en: "How much does cancer treatment in Korea cost?", ko: "한국 암 치료 비용은 얼마일까?" },
    excerpt: { en: "A breakdown of proton therapy, robotic surgery and targeted therapy prices vs. the US.", ko: "양성자·로봇수술·표적치료 비용을 미국과 비교해 정리했습니다." },
    body: { en: "Korea's top cancer centers offer JCI-accredited care at 30–65% below US list prices. Proton therapy runs about $52,000 (vs. $145,000 in the US), robotic surgery about $61,000, and executive screening from $2,200. With an insurer referral, the covered procedure cost is highlighted before you commit.", ko: "한국 주요 암센터는 JCI 인증 치료를 미국 정가 대비 30~65% 낮은 가격에 제공합니다. 양성자 치료는 약 $52,000(미국 $145,000), 로봇 수술은 약 $61,000, 이그제큐티브 검진은 $2,200부터입니다. 보험사 추천 시 보장 시술 비용이 사전에 안내됩니다." } },
  { id: "b2", tag: "Travel", date: "2026-05-20", cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    title: { en: "What KoreCare arranges for you in Korea", ko: "KoreCare가 한국에서 준비해 드리는 것" },
    excerpt: { en: "Flights, visa, interpreter, recovery stay and US aftercare — all in one team.", ko: "항공·비자·통역·회복 숙소·미국 사후관리까지 한 팀이 관리합니다." },
    body: { en: "You never coordinate a single vendor yourself. We arrange flights and visa support for you and a companion, a dedicated English interpreter at every appointment, hospital-adjacent accommodation, and follow-up coordination with your home doctor in the US.", ko: "단 하나의 업체도 직접 조율할 필요가 없습니다. 본인과 동반 1인의 항공·비자, 모든 진료에 동행하는 전담 영어 통역, 병원 인근 숙소, 미국 주치의와의 사후관리 연계까지 준비합니다." } },
  { id: "b3", tag: "Medical", date: "2026-05-08", cover: "https://images.unsplash.com/photo-1631563019676-dade0dbdb8fc?w=800&q=80",
    title: { en: "Why whole-body MRI screening matters", ko: "전신 MRI 검진이 중요한 이유" },
    excerpt: { en: "Catching disease early changes outcomes — and costs.", ko: "조기 발견은 결과와 비용을 모두 바꿉니다." },
    body: { en: "Executive deep screening combines whole-body MRI and PET-CT to detect cancers and chronic risks at the earliest stage, often before symptoms appear. A single visit produces a full-body baseline and a specialist-reviewed report within 48 hours.", ko: "이그제큐티브 정밀검진은 전신 MRI와 PET-CT를 결합해 증상이 나타나기 전 최조기 단계에서 암·만성 위험을 발견합니다. 한 번의 방문으로 전신 기준치와 48시간 내 전문의 판독 리포트를 받습니다." } },
  { id: "b4", tag: "Story", date: "2026-04-15", cover: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    title: { en: "Michael's proton therapy journey", ko: "마이클의 양성자 치료 여정" },
    excerpt: { en: "A US patient's full story, from referral to recovery.", ko: "추천부터 회복까지, 한 미국 환자의 이야기." },
    body: { en: "Referred by his insurer, Michael flew to Seoul for proton therapy. Over five weeks his coordinator managed every appointment, interpreter, and recovery stay. He saved over $90,000 versus his US quote and returned home with a coordinated aftercare plan.", ko: "보험사 추천으로 마이클은 양성자 치료를 위해 서울로 향했습니다. 5주간 전담 코디네이터가 모든 진료·통역·회복 숙소를 관리했고, 미국 견적 대비 9만 달러 이상을 절감하며 사후관리 계획과 함께 귀국했습니다." } },
];

/* ------------------------------- FAQ ------------------------------- */
/* 어드민 FAQ 관리(CMS)와 고객 FAQ 화면이 공유하는 정본. 어드민 수정 시 localStorage 오버레이로 웹 반영. */
export const faqItems = [
  { q: "Is my procedure really covered by my insurer?", a: "If you were referred to KoreCare by your insurer, the listed program is covered under that referral. We confirm your exact out-of-pocket amount after a short records review — before you commit to anything." },
  { q: "Which hospitals do you work with?", a: "Only internationally accredited (e.g. JCI) tertiary hospitals in Korea, each with a dedicated international patient center. You see the accreditation and patient ratings on every program card." },
  { q: "What exactly does KoreCare arrange?", a: "Everything outside the treatment room: care-plan matching, flights and visa support, airport pickup, a dedicated English interpreter and coordinator, hospital-adjacent recovery accommodation, and follow-up coordination with your doctor back home." },
  { q: "Can a companion travel with me?", a: "Yes. Travel and accommodation for one companion are included in the standard journey arrangement." },
  { q: "Will language be a problem?", a: "No. You are assigned an English-speaking coordinator and medical interpreter for every appointment, from consultation through discharge." },
  { q: "How long will I need to stay in Korea?", a: "It depends on the program — each card shows a typical stay (for example 3–5 weeks for oncology, a few days for screening). Your coordinator confirms the schedule once your treatment plan is set." },
  { q: "How is aftercare handled once I'm home?", a: "Before you fly home we prepare a full medical summary and coordinate follow-up directly with your US physician, so your local care continues seamlessly." },
  { q: "How do I get started?", a: "Pick a program and tap “Request this plan”, or send us a message from the Contact page. A coordinator follows up to review your records and confirm coverage." },
];

/* ------------------------------- i18n ------------------------------- */
export const i18n = {
  en: {
    nav: { treatments: "Treatments", hospitals: "Hospitals", reviews: "Reviews", beforeafter: "Before / After", blog: "Blog", faq: "FAQ", login: "Login", mypage: "My Page", book: "Book now" },
    common: { back: "Back", viewDetail: "View detail", from: "from", reviewsLabel: "reviews", covered: "Covered", bookNow: "Book this treatment", allCategories: "All", matched: "matched" },
    treatments: { title: "Treatments", subtitle: "Browse covered medical programs by specialty.", recommendedFor: "Recommended for", effects: "Expected effects", duration: "Duration", steps: "Process", cautions: "Cautions", beforeAfter: "Before / After", price: "Korea all-in", usPrice: "US cost", save: "Save" },
    reviews: { title: "Patient Reviews", subtitle: "Real stories from internationally-referred patients." },
    beforeafter: { title: "Before & After", subtitle: "Documented outcomes from our partner hospitals.", before: "Before", after: "After" },
    blog: { title: "Blog", subtitle: "Guides and stories on medical travel to Korea.", readMore: "Read more" },
    reservation: { title: "Request a Booking", subtitle: "Tell us what you need — a coordinator replies within one business day.", name: "Full name", email: "Email", country: "Country", treatment: "Treatment of interest", hospital: "Preferred hospital", date: "Preferred date", message: "Message", submit: "Submit request", successTitle: "Request received", successBody: "A KoreCare coordinator will reach out within one business day." },
    mypage: { loginTitle: "Login", loginSubtitle: "Access your bookings and medical records.", email: "Email", password: "Password", loginBtn: "Login", note: "Prototype — no real authentication. Any input logs you in.", welcome: "Welcome back", myBookings: "My bookings", noBookings: "No bookings yet.", logout: "Logout" },
  },
  ko: {
    nav: { treatments: "시술", hospitals: "병원", reviews: "리뷰", beforeafter: "비포 / 애프터", blog: "블로그", faq: "자주묻는질문", login: "로그인", mypage: "마이페이지", book: "예약하기" },
    common: { back: "뒤로", viewDetail: "상세 보기", from: "부터", reviewsLabel: "리뷰", covered: "보장", bookNow: "이 시술 예약하기", allCategories: "전체", matched: "건" },
    treatments: { title: "시술", subtitle: "진료과별 보장 시술 프로그램을 둘러보세요.", recommendedFor: "권장 대상", effects: "기대 효과", duration: "소요 시간", steps: "진행 순서", cautions: "주의 사항", beforeAfter: "비포 / 애프터", price: "한국 올인", usPrice: "미국 비용", save: "절감" },
    reviews: { title: "환자 리뷰", subtitle: "해외 추천 환자들의 실제 후기." },
    beforeafter: { title: "비포 & 애프터", subtitle: "협력 병원의 실제 치료 결과.", before: "비포", after: "애프터" },
    blog: { title: "블로그", subtitle: "한국 의료관광 가이드와 이야기.", readMore: "더 보기" },
    reservation: { title: "예약 신청", subtitle: "필요한 내용을 알려주시면 영업일 1일 내 코디네이터가 연락드립니다.", name: "이름", email: "이메일", country: "국가", treatment: "관심 시술", hospital: "희망 병원", date: "희망 날짜", message: "메시지", submit: "예약 신청", successTitle: "신청이 접수되었습니다", successBody: "영업일 1일 내 KoreCare 코디네이터가 연락드립니다." },
    mypage: { loginTitle: "로그인", loginSubtitle: "예약 내역과 진료 기록을 확인하세요.", email: "이메일", password: "비밀번호", loginBtn: "로그인", note: "프로토타입 — 실제 인증 없음. 아무 값이나 입력하면 로그인됩니다.", welcome: "다시 오신 걸 환영합니다", myBookings: "내 예약", noBookings: "아직 예약이 없습니다.", logout: "로그아웃" },
  },
};
