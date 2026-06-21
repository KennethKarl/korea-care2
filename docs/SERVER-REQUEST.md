# KoreCare — 개발부 서버 요청서

> 프런트엔드(랜딩)는 **GitHub Pages 정적 호스팅 + 빌드 시 라우트별 정적 HTML(SSG)** 로 동작합니다.
> 서버가 없어도 사이트는 뜨지만, 아래 항목이 준비되면 **폼 제출 실연동 + 마케팅 계측 + 상담 채팅**이 켜집니다.
> 프런트는 전부 env 기반이라, 값만 주시면 코드 수정 없이 연결됩니다.

- **프런트 도메인(Origin)**: `https://global.safedoc.io` (커스텀 도메인 루트 `/`)
- **연동 방식**: 정적 SPA → 세이프닥 API 로 `fetch`(CORS) 호출
- **현재 상태**: `VITE_API_BASE` 미설정 → 폼은 mock 성공 처리 중

---

## ① API 엔드포인트 (필수 — 폼 2종)

세이프닥 서버에 아래 2개 POST 엔드포인트를 열어주세요. 응답은 JSON `{ "ok": true }` 형태면 됩니다.

### 1) 상담/문의 리드 — `POST {API_BASE}/v1/leads`
Contact 폼에서 전송. 요청 바디:
```json
{
  "name": "Jane Doe",
  "email": "jane@email.com",
  "phone": "+1 555 000 0000",
  "interest": "Seoul National Cancer Center — Comprehensive Cancer Program",
  "message": "…",
  "source": "contact",
  "page": "https://global.safedoc.io/contact"
}
```

### 2) 예약 신청 — `POST {API_BASE}/v1/reservations`
Reservation 폼에서 전송. 요청 바디:
```json
{
  "name": "Jane Doe",
  "email": "jane@email.com",
  "country": "United States",
  "treatmentId": "proton",
  "treatment": "Proton Therapy",
  "date": "2026-07-15",
  "message": "…",
  "createdAt": "2026-06-18T00:00:00.000Z"
}
```

> 엔드포인트 경로(`/v1/leads`, `/v1/reservations`)나 바디 키를 바꾸고 싶으시면 알려주세요.
> 프런트 `src/api.js` 한 곳만 맞추면 됩니다.

---

## ② CORS (필수)

위 엔드포인트에 아래 Origin 의 브라우저 요청을 허용해주세요(프리플라이트 포함):
```
Access-Control-Allow-Origin: https://global.safedoc.io
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
(커스텀 도메인으로 바꾸면 Origin 도 함께 갱신 필요)

---

## ③ 봇/스팸 보호 (권장)

공개 폼이라 보호 장치가 필요합니다. 아래 중 운영 방식에 맞는 것으로:
- 엔드포인트 **rate limit**(IP/시간당), 그리고/또는
- **reCAPTCHA / Turnstile** 토큰 검증 (쓰면 site key 를 주세요 → 프런트에서 토큰 동봉)
- (선택) 공개 API key 헤더 — 주시면 `VITE_API_KEY` 로 동봉

---

## ④ 서드파티 키 (선택 — 마케팅/계측/CS)

global.safedoc.io 와 동일 계열 스택입니다. 값을 주시면 GitHub Secrets 에 넣어 빌드시 주입합니다.

| 항목 | 환경변수 | 비고 |
|---|---|---|
| GA4 측정 ID | `VITE_GA4_ID` | 예 `G-XXXXXXXXXX` (별도 속성 권장) |
| Meta Pixel ID | `VITE_META_PIXEL_ID` | 광고 리타게팅 |
| MS Clarity ID | `VITE_CLARITY_ID` | 히트맵/세션 |
| ChannelTalk plugin key | `VITE_CHANNEL_PLUGIN_KEY` | 상담 채팅 위젯 |
| (선택) Naver Map client ID | — | 병원 지도 붙일 때. `github.io` 도메인 화이트리스트 등록 필요 |

---

## ④-b 마이페이지 [New] 흐름 엔드포인트 (요구사항정의서 자동화 매핑)

현재 마이페이지(예약내역·장바구니·취소요청·리뷰·고객정보)는 전부 mock(localStorage)입니다.
요구사항정의서의 사이트 간 자동화를 켜려면 아래가 필요합니다(응답 `{ok:true}` 형태).

| 기능 (요구정의서 자동화) | 엔드포인트(제안) | 비고 |
|---|---|---|
| 웹사이트 예약신청 → 어드민 예약 DB 생성 | `POST /v1/reservations` (위 ①) | 장바구니 checkout 포함 |
| 웹사이트 취소요청 → 어드민 예약내역 연동 | `POST /v1/reservations/:id/cancel` | 취소요청 알림 |
| 어드민 예약상태 변경 → 웹 예약내역 단계 연동 | `GET /v1/reservations?me=1` | 단계: 예약요청>조율중>예약확정>방문완료>리뷰 |
| 웹사이트 리뷰작성 → 어드민 리뷰관리 연동 | `POST /v1/reviews` | 방문완료 후 활성 |
| 고객정보(프로필) 저장 | `PUT /v1/profile` | 여권사본 업로드 포함(파일) |
| 웹사이트 문의접수 → 슬랙/이메일 알림 | (서버측 후처리) | leads 수신 시 트리거 |

> 인증(로그인/회원가입/서드파티)·예약 단계 관리·정산은 백엔드가 source of truth.
> 운영자 어드민 / 병원 관리자 페이지 화면 자체는 이번 프론트 범위 밖(별도 라운드).

## ⑤ (선택) 프로그램/병원 데이터 API

지금은 시술·병원 데이터가 프런트에 하드코딩(`src/site-data.js`)되어 있습니다.
운영에서 어드민으로 관리하려면 읽기 전용 `GET {API_BASE}/v1/programs` (캐시 가능) 를 주시면
빌드시 가져와 SSG 에 반영할 수 있습니다. (당장 필수는 아님)

---

## ⑥ 키 적용 방법 (프런트 측, 참고용)

받은 값은 배포 레포(`KennethKarl/safedoc-korea-care`)의 **Settings → Secrets and variables → Actions** 에 등록하면
GitHub Actions 빌드(.github/workflows/deploy.yml)가 자동 주입합니다. 코드 수정 불필요.

---

## 요청 요약 체크리스트

- [ ] `POST /v1/leads` · `POST /v1/reservations` 오픈 (응답 `{ok:true}`)
- [ ] CORS 허용: `https://global.safedoc.io`
- [ ] 봇 보호(rate limit / captcha / API key 중 택1) 및 필요한 키 전달
- [ ] (선택) GA4 / Meta Pixel / Clarity / ChannelTalk 키 전달
- [ ] (선택) 프로그램 데이터 API 또는 어드민 영속화 범위 협의
