# SafeDoc Korea Care — 프로토타입 작성 중간 보고서 (v2)

**작성일**: 2026-06-18 · **브랜드**: KoreCare · **상태**: 프론트엔드 프로토타입(mock) 완료, 원격 배포

## 라이브 URL (검증 완료, HTTP 200)
| 사이트 | URL |
|---|---|
| 고객 — 홈/프로그램 | https://kennethkarl.github.io/korea-care/ |
| 고객 — 마이페이지(로그인) | https://kennethkarl.github.io/korea-care/mypage/ |
| 운영자 어드민 | https://kennethkarl.github.io/korea-care/admin/ |
| 병원 관리자 | https://kennethkarl.github.io/korea-care/hospital-admin/ |
| 시술 상세(딥링크 예) | https://kennethkarl.github.io/korea-care/treatment/proton/ |

> 커스텀 도메인 `global.safedoc.io`는 DNS 준비 후 전환 예정(아래 §4). 현재는 github.io 서브경로로 즉시 확인 가능.

---

## 1. SEO/GEO 반영 설계

순수 CSR(React SPA)은 크롤러·생성형 엔진이 빈 `<div id=root>`만 받는다. 이를 구조적으로 해결하기 위해 **빌드 시 라우트별 정적 HTML 사전렌더(SSG)** 로 재설계했다.

- **렌더링**: `vite-react-ssg` + `react-router-dom` → 빌드 시 **31개 라우트가 각각 완성된 HTML**로 생성(크롤러/AI가 실제 본문 텍스트 수신).
- **사이트/페이지별 고유 URL**: 모든 화면이 독립 URL — `/programs`, `/treatment/:id`, `/hospital/:deptId/:hospitalId`, `/reviews`, `/blog/:id`, `/faq` 등(인메모리 라우팅 → URL 라우팅 전환).
- **per-route 메타 + 구조화 데이터(JSON-LD)**: 페이지마다 고유 `title`·`description`·`canonical`·OpenGraph + JSON-LD(`MedicalOrganization`/`WebSite`, 시술=`MedicalProcedure`, FAQ=`FAQPage`, `BreadcrumbList`).
- **GEO(생성형 엔진) 신호**: `robots.txt`에 AI 크롤러(GPTBot·PerplexityBot·ClaudeBot·Google-Extended) 허용, `llms.txt`, `sitemap.xml`(28 URL), 시맨틱 마크업.
- **검색 분리**: 내부 화면(`/mypage`·`/admin`·`/hospital-admin`)은 `noindex` + sitemap 제외.
- **배포**: GitHub Pages 정적 호스팅(서버리스) — SSG라 서버 없이도 SEO/GEO 성립.

---

## 2. 사이트별 기능 + 테스트 방법

플랫폼은 **3개 시스템**이며, 프로토타입에서 세 시스템이 **동일 브라우저 localStorage를 공유**해 사이트 간 자동화가 실제로 동작한다(백엔드 없이 시연).

### A. 고객 웹사이트
- 홈·시술/병원 상세·리뷰·비포애프터·블로그·FAQ·회사소개·이용방법·문의·예약. EN/KO 토글.
- **로그인/회원가입**: **Google 로그인**(GIS) — `VITE_GOOGLE_CLIENT_ID` 설정 시 실제 구글 계정 로그인, 미설정 시 데모 로그인. 이메일 로그인도 병행.
- **마이페이지**: 예약내역 리스트(진행단계·확정일/미정·방문완료 시 리뷰버튼) · 예약내역 상세(**5단계 스테퍼**·옵션·**예약취소요청**) · 장바구니(정가/세이프닥 할인가·예약수) · 고객정보(여권·통역·**국적=한국→건보**) · 리뷰 작성.
- **테스트**: `/mypage` → **Continue with Google**(데모) 또는 이메일 로그인 → 데모 예약/장바구니 시드 → 탭 전환 확인.

### B. 운영자 어드민 (`/admin`) — 8개 메뉴
- 예약 관리(**단계 변경**) · 정산 관리 · 유저 관리 · 리뷰 관리 · 병원 관리(노출토글·등록) · **시술 관리**(노출토글·**시술 등록**) · **FAQ 관리**(CMS) · **블로그 관리**(CMS).
- **테스트**: `/admin`(또는 고객 푸터 "운영자 어드민") → 각 탭에서 등록/토글/삭제.

### C. 병원 관리자 (`/hospital-admin`)
- 글로벌 예약(확정건만 노출) · **금액 입력→정산** · 정산 내역.

### ⭐ End-to-End 자동화 테스트
- **예약 흐름**: 어드민 예약 '예약 확정' → 병원관리자 글로벌예약 노출 → 금액 입력·등록 → 어드민 정산 반영 → 고객 마이페이지 "Confirmed" 자동 갱신.
- **CMS 흐름**: 어드민 **블로그 관리**에서 글 등록 → 고객 `/blog`에 즉시 노출 / **FAQ 관리** 등록 → 고객 `/faq` 반영 / **시술 관리** 노출 토글 → 고객 시술 리스트 반영. *(라이브 검증 완료)*

---

## 3. 요구사항정의서 대비 구현 여부

(출처: Notion 「글로벌 웹사이트 요구사항정의서」 DB)

### 고객 웹사이트
| 화면 | 구현 |
|---|---|
| 홈 / 시술 리스트·상세 / 병원 상세 / 리뷰 / 비포·애프터 / 블로그 / FAQ | ✅ |
| 로그인·회원가입 | ✅ **Google 로그인**(GIS, env 설정 시 실연동) + 이메일 |
| 마이페이지(예약내역 리스트·상세·고객정보·장바구니·리뷰) | ✅ (mock) |
| 병원 리스트(독립 화면) | ⚠️ 홈에서 진료과→병원으로 제공(독립 리스트 별도 아님) |

### 운영자 어드민
| 화면 | 구현 |
|---|---|
| 병원 관리·등록 / 예약·정산·유저·리뷰 관리 | ✅ |
| **시술 관리·등록** | ✅ (노출토글 + 등록) |
| **FAQ 관리 / 블로그 CMS** | ✅ (등록·삭제 → 고객 화면 자동 연동) |

### 병원 관리자
| 화면 | 구현 |
|---|---|
| 글로벌 예약 / 정산(금액 입력) | ✅ |

### 사이트 간 자동화 (12종)
| 자동화 | 구현 |
|---|---|
| 웹 예약신청 → 어드민 예약 DB | ✅ mock |
| 어드민 예약상태 변경 → 웹 예약내역 연동 | ✅ mock |
| 어드민 예약확정 → 병원관리자 글로벌예약 노출 | ✅ mock |
| 병원 금액입력 → 어드민 정산 반영 | ✅ mock |
| 웹 리뷰작성 → 어드민 리뷰관리 | ✅ mock |
| 웹 취소요청 → 어드민 예약내역 | ✅ mock |
| **어드민 FAQ 등록 → 웹 FAQ 연동** | ✅ mock(오버레이) |
| **어드민 블로그 등록 → 웹 블로그 노출** | ✅ mock(오버레이) |
| **어드민 시술 정보(노출) → 웹 연동** | ✅ mock(노출 토글) · 신규 시술 풀콘텐츠는 백엔드 |
| 웹 채팅 → 어드민 채팅접수 | ⚠️ ChannelTalk 위젯(env)만, 접수화면 없음 |
| 웹 문의 → 슬랙 알림 / 고객 이메일 발송 | ❌ 백엔드(서버 후처리) 필요 — `docs/SERVER-REQUEST.md` |

> 요약: **고객 핵심 + 운영자/병원 핵심 + CMS + 9종 자동화가 mock으로 동작**(라이브 검증). 실제 알림/이메일·채팅접수·인증/결제·실데이터 영속화는 백엔드 연동 필요(범위 명시).

---

## 4. 기술 스펙 (세이프닥 이식 가능성 포함)

| 항목 | 스펙 |
|---|---|
| 프레임워크 | React 18 + Vite + **vite-react-ssg**(SSG) + react-router-dom |
| 인증 | **Google Identity Services**(GIS) — `VITE_GOOGLE_CLIENT_ID` 기반, 미설정 시 데모 |
| 데이터 | **mock(localStorage)** — 백엔드 미연동 시 graceful fallback |
| 분석/CS | GA4·Meta Pixel·MS Clarity·ChannelTalk(전부 env, 미설정 시 no-op) |
| API 연동 | `VITE_API_BASE` fetch 클라이언트(미설정 시 mock) — 계약은 `docs/SERVER-REQUEST.md` |
| 호스팅 | GitHub Pages 정적(서버리스). `VITE_BASE`로 서브경로/루트 전환 |

**레퍼런스 대비**: safedoc.io = Next.js(SSR), global.safedoc.io = imweb(서버렌더). 정적 호스팅에서 SSR급 SEO를 위해 **SSG** 채택.

**세이프닥 이식 가능성**
- **바로 이식 가능**: 디자인 토큰/컴포넌트, SEO·GEO 구조, 고객 UI/플로우, 마이페이지 UX, **Google 로그인 UI**(client ID만 주입), 어드민/병원 화면 UI.
- **백엔드 연동 필요(즉시 불가)**: 실데이터 영속화(예약 DB·정산·유저·리뷰·CMS), 서버 인증(세션/권한), 실제 알림(슬랙·이메일), 채팅 접수. → 세이프닥 서버에 `docs/SERVER-REQUEST.md`의 엔드포인트 + CORS 제공 시 **프론트 코드 수정 없이 env 주입만으로 연결**되도록 설계.
- **제공 필요 키**: Google OAuth Client ID(origin 등록), GA4·Pixel·Clarity·ChannelTalk(선택), `VITE_API_BASE`.
- 결론: **프론트(디자인·SEO·고객/어드민 화면·로그인 UI)는 즉시 이식, 데이터·인증·알림은 API 계약대로 단계적 연동.**

---

## 5. 세이프닥 디자인 적용 / 주요 변경사항

- **디자인 시스템 전면 리브랜드**(global.safedoc.io 실측 토큰): Primary Blue **#1b59fa**, Accent Coral **#ff2552**, Ink #212121, BG #f5f7f8, 폰트 **Pretendard**. 기존 KoreCare 틸(#0b6b6b) 전면 교체, `src/theme.js` 토큰 중앙화.
- **브랜드명 `KoreCare` 유지**(영미권 Korea+Care 인식).
- **프로젝트/도메인 정비**: 식별자 `safedoc/korea-care`, 정식 도메인 `global.safedoc.io`(canonical/sitemap 반영, DNS 후 전환), 마케팅·계측 스택(GA4·Pixel·Clarity·ChannelTalk) env 슬롯 준비.

---

## 다음 단계
1. **백엔드 연동**: `docs/SERVER-REQUEST.md`를 세이프닥 개발부에 전달(API·CORS·키, Google Client ID 포함).
2. **커스텀 도메인**: SafeDoc DNS에 `global.safedoc.io` → `kennethkarl.github.io` CNAME → 빌드 `VITE_BASE=/` + CNAME 복원 → 레포 Pages 커스텀 도메인 지정.
3. **잔여 화면**: 병원 리스트 독립화면, 채팅 접수 화면, 신규 시술 풀콘텐츠 입력.
