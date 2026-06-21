# KoreCare

미국 보험 가입자를 위한 **한국 의료관광 랜딩 페이지** 프로토타입.
보험사가 시술비를 보장하고, KoreCare가 항공·비자·통역·숙소·사후관리까지 원스톱으로 관리하는 컨셉.

React 18 + Vite. 모든 콘텐츠는 `src/App.jsx`의 `initialContent` 객체에서 렌더되며,
우측 어드민 패널에서 이미지·텍스트 오버레이·진료과·병원을 라이브로 편집할 수 있다.

> ⚠️ 현재는 프론트엔드 프로토타입입니다. 어드민 편집 내용은 브라우저 메모리에만 존재하며
> 새로고침 시 초기화됩니다(저장용 백엔드 미연동).

## 개발

```bash
npm install
npm run dev      # http://localhost:5173
```

## 빌드 & 배포

```bash
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 미리보기
```

`main` 브랜치 push 시 GitHub Actions가 자동으로 빌드하여 GitHub Pages로 배포한다
(`.github/workflows/deploy.yml`). 배포 URL은 `https://global.safedoc.io` (커스텀 도메인, `public/CNAME`).
