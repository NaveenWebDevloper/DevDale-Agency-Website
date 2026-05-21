import {
  absoluteUrl,
  BRAND_NAME,
  CALENDLY_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEFAULT_IMAGE,
  pageBreadcrumbs,
  SEOPage,
  SITE_URL,
  WHATSAPP_URL,
} from "./seo";

const baseOrganization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BRAND_NAME,
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  sameAs: ["https://www.linkedin.com/company/thedevdale", "https://github.com/thedevdale"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE,
      url: CALENDLY_URL,
      availableLanguage: ["en-IN", "en"],
    },
  ],
};

export function buildPageSchemas(page: SEOPage) {
  const pageUrl = absoluteUrl(page.path);
  const breadcrumbs = pageBreadcrumbs(page.path);
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BRAND_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      ...baseOrganization,
      description:
        "TheDevDale is a web design, web development, AI application development, SEO optimization, UI UX, automation, and performance optimization agency.",
      knowsAbout: page.entities,
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: BRAND_NAME,
      url: SITE_URL,
      image: DEFAULT_IMAGE,
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
      areaServed: ["Hyderabad", "Bangalore", "Chennai", "India", "United States"],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: page.entities.map((name) => ({ "@type": "Thing", name })),
      primaryImageOfPage: { "@type": "ImageObject", url: DEFAULT_IMAGE },
      dateModified: page.lastModified,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: { "@id": `${SITE_URL}/#organization` },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      author: { "@type": "Organization", name: "Founder Client" },
      reviewBody: "TheDevDale combines strategy, design, engineering, SEO, and conversion thinking into one delivery system.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Dale",
      jobTitle: "Founder and Backend Engineer",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      knowsAbout: ["Backend engineering", "web development", "automation", "AI applications"],
    },
  ];

  if (page.kind === "service") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.service,
      serviceType: page.service,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: ["India", "United States", "Hyderabad", "Bangalore", "Chennai"],
      audience: { "@type": "Audience", audienceType: page.audience },
      description: page.description,
      url: pageUrl,
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: `${pageUrl}#audit`,
      },
    });
  }

  if (page.kind === "blog") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.h1,
      description: page.description,
      image: DEFAULT_IMAGE,
      datePublished: page.lastModified,
      dateModified: page.lastModified,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
    });
  }

  if (page.kind === "core" && page.path === "/portfolio") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "TheDevDale Portfolio",
      url: pageUrl,
      hasPart: ["VGS Global", "Patents Planet", "Crop Planning"].map((name) => ({
        "@type": "CreativeWork",
        name,
        creator: { "@id": `${SITE_URL}/#organization` },
      })),
    });
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Action",
    name: "Book a strategy call",
    target: CALENDLY_URL,
    agent: { "@id": `${SITE_URL}/#organization` },
    object: { "@type": "WebPage", url: pageUrl },
    instrument: WHATSAPP_URL,
  });

  return schemas;
}
