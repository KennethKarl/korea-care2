import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App.jsx";
import "./index.css";

// vite-react-ssg: 빌드 시 라우트별 정적 HTML 생성, 클라이언트에서 하이드레이션.
// basename 은 vite `base`(= import.meta.env.BASE_URL, 커스텀 도메인 루트 "/") 를 따른다.
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL });
