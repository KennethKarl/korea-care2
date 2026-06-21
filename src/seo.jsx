/* =========================================================================
   seo.jsx — per-route 메타 + JSON-LD (SEO·GEO 노출용)
   vite-react-ssg 의 <Head> 로 빌드 시 정적 HTML <head> 에 주입된다.
   GEO(생성형 엔진) 노출: 구조화 데이터(JSON-LD) + 명확한 메타가 핵심 신호.
   ========================================================================= */
import { Head } from "vite-react-ssg";
import { SITE_URL } from "./config.js";

const DEFAULT_DESC =
  "KoreCare coordinates world-class medical treatment in Korea for US insurance members — your insurer covers the procedure, and we manage travel, visa, interpretation, recovery stay and aftercare end to end.";

export function Seo({ title, description = DEFAULT_DESC, path = "/", type = "website", jsonLd, noindex }) {
  const url = SITE_URL + (path === "/" ? "/" : path);
  const fullTitle = title ? `${title} | KoreCare` : "KoreCare — Medical Treatment in Korea, Fully Managed";
  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="KoreCare" />
      <meta name="twitter:card" content="summary_large_image" />
      {graphs.map((g, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(g)}</script>
      ))}
    </Head>
  );
}

/* ----------------------------- JSON-LD builders ----------------------------- */

// 홈: 조직 + 사이트 (MedicalBusiness/Organization + WebSite)
export const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "MedicalBusiness"],
      "@id": SITE_URL + "/#org",
      name: "KoreCare",
      url: SITE_URL + "/",
      description: DEFAULT_DESC,
      areaServed: ["United States", "South Korea"],
      medicalSpecialty: ["Oncologic", "Orthopedic", "Cardiovascular", "PreventiveMedicine"],
      knowsAbout: [
        "Medical tourism in Korea",
        "Insurance-covered overseas treatment",
        "Health checkup in Korea",
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL + "/",
      name: "KoreCare",
      publisher: { "@id": SITE_URL + "/#org" },
      inLanguage: "en",
    },
  ],
};

// 시술 상세: MedicalProcedure
export function procedureJsonLd({ name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name,
    description,
    url,
    provider: { "@id": SITE_URL + "/#org" },
  };
}

// FAQ: FAQPage
export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

// 빵부스러기: BreadcrumbList
export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}
