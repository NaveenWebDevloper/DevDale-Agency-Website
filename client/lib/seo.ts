export const SITE_URL = "https://thedevdale.com";
export const BRAND_NAME = "TheDevDale";
export const DEFAULT_IMAGE = `${SITE_URL}/devdale_logo.svg`;
export const CONTACT_EMAIL = "hello@thedevdale.com";
export const CONTACT_PHONE = "+91 96754 9869";
export const WHATSAPP_URL = "https://wa.me/91967549869";
export const CALENDLY_URL = "https://calendly.com/thedevdale/strategy-call";
export const LINKEDIN_URL = "https://www.linkedin.com/in/devdale-agency?utm_source=share_via&utm_content=profile&utm_medium=member_android";
export const INSTAGRAM_URL = "https://www.instagram.com/devdaleagency?utm_source=qr&igsh=MXgxMmxwdjZuejNoMg==";
export const TWITTER_URL = "https://x.com/DaleDevAgency";

export type PageKind = "core" | "service" | "location" | "industry" | "blog" | "case-study";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOPage {
  path: string;
  kind: PageKind;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  entities: string[];
  audience: string;
  service?: string;
  city?: string;
  industry?: string;
  sections: Array<{
    heading: string;
    body: string;
    bullets: string[];
  }>;
  faqs: FAQItem[];
  related: string[];
  lastModified: string;
}

const commonFaqs: FAQItem[] = [
  {
    question: "How does TheDevDale generate qualified organic leads?",
    answer:
      "We combine technical SEO, conversion focused UX, schema markup, page speed, content clusters, and measurement so search traffic can turn into booked strategy calls.",
  },
  {
    question: "Can TheDevDale work with startups and established businesses?",
    answer:
      "Yes. We build lean launch systems for startups and scalable SEO, web, automation, and application systems for SMEs, SaaS companies, ecommerce brands, and local businesses.",
  },
  {
    question: "What stack does TheDevDale use?",
    answer:
      "Our delivery stack includes React, Next.js, Vite, Node.js, Vercel, analytics platforms, automation tools, AI APIs, and performance first frontend engineering.",
  },
];

const servicePages: SEOPage[] = [
  {
    path: "/services/web-design",
    kind: "service",
    title: "Website Design Agency for Conversion Focused Brands | TheDevDale",
    description:
      "TheDevDale designs premium, conversion focused websites for startups, SaaS teams, ecommerce brands, and local businesses that need trust, speed, and leads.",
    h1: "Website Design That Turns Attention Into Leads",
    eyebrow: "Website Design",
    intro:
      "Design systems, landing pages, and brand experiences built around clarity, trust, search intent, and conversion behavior.",
    primaryKeyword: "website design agency",
    secondaryKeywords: ["web design services", "UI UX design", "conversion focused website design"],
    entities: ["user experience", "conversion rate optimization", "responsive design", "brand identity"],
    audience: "Startups, SMEs, SaaS companies, ecommerce brands, and local businesses",
    service: "Website Design",
    sections: [
      {
        heading: "Design Strategy",
        body: "We map user intent, buyer objections, trust signals, content hierarchy, and calls to action before interface work begins.",
        bullets: ["UX research", "wireframes", "visual direction", "conversion journey planning"],
      },
      {
        heading: "Production Ready UI",
        body: "Every page is designed for responsive implementation, fast loading, accessibility, and clear internal linking.",
        bullets: ["Responsive layouts", "component systems", "accessible contrast", "mobile first flows"],
      },
      {
        heading: "Lead Generation",
        body: "Design decisions are tied to measurable outcomes including clicks, form starts, booked calls, and qualified inquiries.",
        bullets: ["Sticky CTAs", "audit funnels", "trust sections", "case study placement"],
      },
    ],
    faqs: commonFaqs,
    related: ["/services/web-development", "/services/seo-optimization", "/portfolio"],
    lastModified: "2026-05-21",
  },
  {
    path: "/services/web-development",
    kind: "service",
    title: "Website Development Agency for Fast, Scalable Sites | TheDevDale",
    description:
      "High performance website development with React, Next.js, Vercel, structured data, analytics, security headers, and conversion focused architecture.",
    h1: "Website Development Built For Speed, Search, And Scale",
    eyebrow: "Website Development",
    intro:
      "Modern frontend engineering for companies that need clean implementation, fast Core Web Vitals, and a site architecture that can grow.",
    primaryKeyword: "website development agency",
    secondaryKeywords: ["web development services", "Next.js development", "React development"],
    entities: ["React", "Next.js", "Vercel", "Core Web Vitals"],
    audience: "Businesses, startups, SaaS companies, and ecommerce teams",
    service: "Website Development",
    sections: [
      {
        heading: "Technical Architecture",
        body: "We structure components, routes, metadata, data models, redirects, and deployment settings for reliable long term growth.",
        bullets: ["Scalable routing", "clean components", "API integrations", "deployment automation"],
      },
      {
        heading: "Performance Engineering",
        body: "We optimize JavaScript, CSS, fonts, images, caching, and loading behavior to improve LCP, INP, and CLS.",
        bullets: ["Lazy loading", "bundle splitting", "font preloading", "asset caching"],
      },
      {
        heading: "Search Ready Builds",
        body: "Every build includes crawlable URLs, schema, canonical tags, Open Graph tags, sitemap coverage, and analytics hooks.",
        bullets: ["Metadata automation", "JSON-LD", "sitemap generation", "event tracking"],
      },
    ],
    faqs: commonFaqs,
    related: ["/services/web-design", "/services/seo-optimization", "/services/ai-development"],
    lastModified: "2026-05-21",
  },
  {
    path: "/services/seo-optimization",
    kind: "service",
    title: "SEO Optimization Services for Organic Lead Generation | TheDevDale",
    description:
      "Technical SEO, local SEO, schema markup, content strategy, page speed optimization, internal linking, and AI search optimization for lead growth.",
    h1: "SEO Optimization For Search Visibility And Qualified Leads",
    eyebrow: "SEO Optimization",
    intro:
      "Enterprise grade technical, content, local, and AI search SEO systems engineered to improve rankings, crawlability, and conversion quality.",
    primaryKeyword: "SEO optimization services",
    secondaryKeywords: ["technical SEO", "local SEO", "SEO audits", "schema markup"],
    entities: ["Google Search Console", "structured data", "indexability", "knowledge graph"],
    audience: "SaaS teams, ecommerce brands, local businesses, and service companies",
    service: "SEO Optimization",
    sections: [
      {
        heading: "Technical SEO",
        body: "We fix crawl, indexation, metadata, canonical, sitemap, robots, structured data, and performance issues that block organic growth.",
        bullets: ["Crawlability", "canonical validation", "schema deployment", "Core Web Vitals"],
      },
      {
        heading: "Content Authority",
        body: "We build keyword maps, topical clusters, NLP optimized briefs, internal links, and content calendars aligned with buyer intent.",
        bullets: ["Topic clusters", "semantic SEO", "content briefs", "internal linking"],
      },
      {
        heading: "AI Search Readiness",
        body: "We format pages for answer engines with direct answers, FAQ blocks, comparison tables, entity signals, and citation friendly content.",
        bullets: ["AI Overviews", "LLM discoverability", "entity SEO", "structured answers"],
      },
    ],
    faqs: commonFaqs,
    related: ["/blog", "/location/hyderabad", "/services/web-development"],
    lastModified: "2026-05-21",
  },
  {
    path: "/services/ai-development",
    kind: "service",
    title: "AI Application Development Agency for Business Automation | TheDevDale",
    description:
      "Custom AI applications, AI chatbots, OpenAI integrations, workflow automation, internal tools, and AI SaaS product development.",
    h1: "AI Application Development For Practical Business Automation",
    eyebrow: "AI Development",
    intro:
      "We design and build AI systems that reduce manual work, improve customer response, and create new product capabilities.",
    primaryKeyword: "AI application development",
    secondaryKeywords: ["custom AI chatbots", "OpenAI integrations", "AI workflow automation"],
    entities: ["OpenAI", "retrieval augmented generation", "automation", "AI SaaS"],
    audience: "Founders, operations teams, SaaS companies, and service businesses",
    service: "AI Application Development",
    sections: [
      {
        heading: "AI Product Strategy",
        body: "We identify workflows where AI can create measurable business value instead of adding novelty without return.",
        bullets: ["Use case mapping", "ROI planning", "data readiness", "risk controls"],
      },
      {
        heading: "Custom AI Systems",
        body: "We build chatbots, internal copilots, document intelligence, workflow systems, and AI enabled SaaS features.",
        bullets: ["AI chatbots", "RAG systems", "API integrations", "workflow automation"],
      },
      {
        heading: "Reliable Deployment",
        body: "We engineer prompt management, logging, analytics, fallbacks, privacy controls, and performance monitoring.",
        bullets: ["Observability", "guardrails", "cost controls", "user feedback loops"],
      },
    ],
    faqs: commonFaqs,
    related: ["/blog/custom-ai-chatbots", "/services/web-development", "/industries/saas"],
    lastModified: "2026-05-21",
  },
  {
    path: "/services/cross-platform-development",
    kind: "service",
    title: "Cross Platform Application Development Services | TheDevDale",
    description:
      "Cross platform app development for web, mobile, dashboards, SaaS products, ecommerce operations, and business automation workflows.",
    h1: "Cross Platform Development For Web And Mobile Growth",
    eyebrow: "Cross Platform Development",
    intro:
      "Application experiences that work across devices, teams, and customer journeys without fragmenting your product roadmap.",
    primaryKeyword: "cross platform application development",
    secondaryKeywords: ["mobile app development", "React app development", "SaaS app development"],
    entities: ["React", "mobile applications", "SaaS platforms", "API architecture"],
    audience: "Startups, SaaS companies, ecommerce operators, and internal product teams",
    service: "Cross Platform Application Development",
    sections: [
      {
        heading: "Unified Product Architecture",
        body: "We plan interfaces, APIs, data flows, and user journeys so cross platform builds stay consistent and maintainable.",
        bullets: ["Shared design systems", "API first planning", "state management", "responsive UI"],
      },
      {
        heading: "Business Application Builds",
        body: "We create customer portals, dashboards, booking systems, ecommerce tools, and automation apps.",
        bullets: ["Dashboards", "portals", "booking flows", "internal tools"],
      },
      {
        heading: "Launch And Optimization",
        body: "We measure adoption, conversion events, performance, and user friction after release.",
        bullets: ["Analytics events", "heatmaps", "conversion tracking", "iteration roadmap"],
      },
    ],
    faqs: commonFaqs,
    related: ["/services/ai-development", "/services/web-development", "/industries/ecommerce"],
    lastModified: "2026-05-21",
  },
];

const locationPages: SEOPage[] = ["hyderabad", "bangalore", "chennai"].map((city) => {
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    path: `/location/${city}`,
    kind: "location" as const,
    title: `Web Development, AI Development And SEO Agency In ${cityName} | TheDevDale`,
    description: `TheDevDale helps ${cityName} businesses grow with web design, website development, SEO optimization, AI applications, automation, and performance focused digital systems.`,
    h1: `Web Development And SEO Agency In ${cityName}`,
    eyebrow: `${cityName} Digital Growth`,
    intro: `Local strategy, technical execution, and organic growth systems for businesses in ${cityName}.`,
    primaryKeyword: `web development ${cityName}`,
    secondaryKeywords: [`SEO agency ${cityName}`, `AI development ${cityName}`, `website design ${cityName}`],
    entities: [cityName, "local SEO", "Google Business Profile", "lead generation"],
    audience: `Businesses, startups, SMEs, SaaS companies, ecommerce brands, and local businesses in ${cityName}`,
    city: cityName,
    sections: [
      {
        heading: `${cityName} Local SEO`,
        body: `We optimize location pages, NAP signals, local schema, review acquisition, and service area relevance for ${cityName} search visibility.`,
        bullets: ["Google Business Profile planning", "local citations", "review generation", "city landing pages"],
      },
      {
        heading: "Web And App Delivery",
        body: "We build high performance websites, landing pages, AI tools, and cross platform apps for companies that need measurable growth.",
        bullets: ["Website design", "website development", "AI applications", "automation systems"],
      },
      {
        heading: "Lead Conversion",
        body: "Every local page includes strong CTAs, trust signals, service proof, FAQs, and tracking for form and call conversions.",
        bullets: ["Sticky CTA", "WhatsApp CTA", "free audit funnel", "conversion tracking"],
      },
    ],
    faqs: commonFaqs,
    related: ["/services/web-development", "/services/seo-optimization", "/services/ai-development"],
    lastModified: "2026-05-21",
  };
});

const industryPages: SEOPage[] = [
  ["saas", "SaaS", "SaaS website development and SEO growth systems for pipeline, trials, demos, onboarding, and product led conversion."],
  ["ecommerce", "Ecommerce", "Ecommerce web development, SEO, speed optimization, automation, and CRO systems for product discovery and revenue growth."],
  ["restaurants", "Restaurants", "Restaurant website design, local SEO, booking flows, menu visibility, reviews, and local discovery optimization."],
  ["real-estate", "Real Estate", "Real estate website development, local SEO, listing UX, lead funnels, automation, and neighborhood landing pages."],
].map(([slug, label, intro]) => ({
  path: `/industries/${slug}`,
  kind: "industry" as const,
  title: `${label} Web Development, SEO And Automation Services | TheDevDale`,
  description: intro,
  h1: `${label} Digital Growth Systems`,
  eyebrow: `${label} Industry SEO`,
  intro,
  primaryKeyword: `${label.toLowerCase()} web development`,
  secondaryKeywords: [`${label.toLowerCase()} SEO`, `${label.toLowerCase()} website design`, `${label.toLowerCase()} automation`],
  entities: [label, "conversion rate optimization", "technical SEO", "lead generation"],
  audience: `${label} businesses and growth teams`,
  industry: label,
  sections: [
    {
      heading: "Industry Search Intent",
      body: `We map the search journeys, trust signals, comparison terms, and conversion blockers that matter for ${label} companies.`,
      bullets: ["buyer intent mapping", "content clusters", "FAQ optimization", "comparison sections"],
    },
    {
      heading: "Conversion Architecture",
      body: "We design page structures that guide visitors from discovery to inquiry with measurable CTAs and proof.",
      bullets: ["lead magnets", "case studies", "testimonials", "multi step forms"],
    },
    {
      heading: "Scalable Delivery",
      body: "We support landing pages, automation, analytics, performance, and ongoing content expansion.",
      bullets: ["programmatic pages", "schema markup", "tracking events", "content calendar"],
    },
  ],
  faqs: commonFaqs,
  related: ["/services/web-development", "/services/seo-optimization", "/case-studies"],
  lastModified: "2026-05-21",
}));

const blogSeeds = [
  ["custom-ai-chatbots", "Custom AI Chatbots For Lead Generation And Support", "AI Development"],
  ["ai-business-automation", "AI Business Automation Workflows For Growing Companies", "AI Development"],
  ["openai-integrations", "OpenAI Integrations For Websites, Apps, And Internal Tools", "AI Development"],
  ["ai-workflow-systems", "AI Workflow Systems For Operations, Sales, And Support", "AI Development"],
  ["ai-saas-development", "AI SaaS Development: Product Strategy, UX, And Engineering", "AI Development"],
  ["technical-seo", "Technical SEO Checklist For High Performance Websites", "SEO"],
  ["local-seo", "Local SEO Strategy For Service Businesses", "SEO"],
  ["page-speed-optimization", "Page Speed Optimization For Core Web Vitals", "SEO"],
  ["seo-audits", "SEO Audits: Technical, Content, And Authority Checklist", "SEO"],
  ["schema-markup-guide", "Schema Markup Guide For Service Businesses", "SEO"],
  ["nextjs-development", "Next.js Development For SEO Friendly Business Websites", "Web Development"],
  ["cross-platform-apps", "Cross Platform Apps For Business Growth", "Web Development"],
  ["react-development", "React Development Best Practices For Marketing Sites", "Web Development"],
  ["performance-optimization", "Performance Optimization For Modern Websites", "Web Development"],
];

export const blogPages: SEOPage[] = blogSeeds.map(([slug, title, cluster]) => ({
  path: `/blog/${slug}`,
  kind: "blog",
  title: `${title} | TheDevDale Blog`,
  description: `${title}. Practical strategy from TheDevDale for web development, SEO, AI development, automation, and conversion growth.`,
  h1: title,
  eyebrow: cluster,
  intro: "A practical guide for growth teams that need search visibility, stronger conversion paths, and production ready implementation.",
  primaryKeyword: title.toLowerCase(),
  secondaryKeywords: [cluster.toLowerCase(), "organic lead generation", "technical implementation"],
  entities: [cluster, "search intent", "structured data", "conversion tracking"],
  audience: "Founders, marketers, product teams, and business owners",
  sections: [
    {
      heading: "What This Solves",
      body: "The goal is to connect search demand with a business outcome, then support that path with clear UX, fast delivery, and measurement.",
      bullets: ["search intent", "buyer questions", "technical requirements", "conversion paths"],
    },
    {
      heading: "Implementation Framework",
      body: "Start with the page goal, map entities and keywords, add structured answers, connect internal links, and track meaningful events.",
      bullets: ["keyword mapping", "schema markup", "internal linking", "analytics events"],
    },
    {
      heading: "Optimization Checklist",
      body: "Review metadata, headings, FAQ coverage, speed, schema validity, indexability, and CTA performance before publishing.",
      bullets: ["title tag", "meta description", "H1 and H2s", "Core Web Vitals"],
    },
  ],
  faqs: commonFaqs,
  related: ["/services/seo-optimization", "/services/web-development", "/contact"],
  lastModified: "2026-05-21",
}));

export const corePages: SEOPage[] = [
  {
    path: "/",
    kind: "core",
    title: "TheDevDale | Web Development, AI Development And SEO Agency",
    description:
      "TheDevDale builds high performance websites, AI applications, cross platform apps, SEO systems, UI UX design, automation, and conversion focused digital growth engines.",
    h1: "Web Development, AI Development And SEO Agency",
    eyebrow: "Digital Growth Agency",
    intro: "Premium web design, development, AI automation, SEO, and conversion systems for ambitious businesses.",
    primaryKeyword: "web development agency",
    secondaryKeywords: ["AI development agency", "SEO agency", "website design agency"],
    entities: ["TheDevDale", "web development", "AI applications", "SEO optimization"],
    audience: "Businesses, startups, SMEs, SaaS companies, ecommerce brands, and local businesses",
    sections: [],
    faqs: commonFaqs,
    related: ["/services/web-development", "/services/seo-optimization", "/services/ai-development"],
    lastModified: "2026-05-21",
  },
  {
    path: "/about",
    kind: "core",
    title: "About TheDevDale | Web, AI And SEO Growth Engineering Team",
    description:
      "Meet TheDevDale, a performance focused digital agency building websites, AI applications, automation systems, and SEO foundations for organic lead growth.",
    h1: "About TheDevDale",
    eyebrow: "About",
    intro: "A focused team combining design taste, engineering discipline, SEO strategy, and conversion thinking.",
    primaryKeyword: "about TheDevDale",
    secondaryKeywords: ["web development team", "SEO agency team", "AI development team"],
    entities: ["TheDevDale", "technical SEO", "web engineering", "AI automation"],
    audience: "Prospective clients evaluating TheDevDale",
    sections: [],
    faqs: commonFaqs,
    related: ["/portfolio", "/case-studies", "/contact"],
    lastModified: "2026-05-21",
  },
  {
    path: "/contact",
    kind: "core",
    title: "Contact TheDevDale | Book A Web, SEO Or AI Strategy Call",
    description:
      "Contact TheDevDale for website development, SEO optimization, AI application development, automation, performance optimization, and UI UX design projects.",
    h1: "Contact TheDevDale",
    eyebrow: "Contact",
    intro: "Request a free audit, book a strategy call, or start a high intent project conversation.",
    primaryKeyword: "contact TheDevDale",
    secondaryKeywords: ["free SEO audit", "web development consultation", "AI development consultation"],
    entities: ["lead generation", "strategy call", "free audit", "project inquiry"],
    audience: "Prospects ready to start a project",
    sections: [],
    faqs: commonFaqs,
    related: ["/services/seo-optimization", "/services/web-development", "/services/ai-development"],
    lastModified: "2026-05-21",
  },
  {
    path: "/portfolio",
    kind: "core",
    title: "Portfolio | TheDevDale Web Development And Digital Product Work",
    description:
      "Explore TheDevDale portfolio projects across web development, UI UX design, AI applications, SEO optimization, and performance focused digital systems.",
    h1: "TheDevDale Portfolio",
    eyebrow: "Portfolio",
    intro: "Selected work, product builds, web systems, and performance focused digital experiences.",
    primaryKeyword: "web development portfolio",
    secondaryKeywords: ["agency portfolio", "UI UX portfolio", "website design portfolio"],
    entities: ["portfolio", "case studies", "web projects", "digital products"],
    audience: "Prospective clients reviewing proof of work",
    sections: [],
    faqs: commonFaqs,
    related: ["/case-studies", "/services/web-design", "/contact"],
    lastModified: "2026-05-21",
  },
  {
    path: "/case-studies",
    kind: "case-study",
    title: "Case Studies | TheDevDale Web, SEO, AI And Automation Results",
    description:
      "Read TheDevDale case studies showing strategy, implementation, performance improvements, SEO foundations, conversion systems, and product delivery.",
    h1: "Case Studies",
    eyebrow: "Proof",
    intro: "A results focused library for web development, SEO, AI automation, and conversion projects.",
    primaryKeyword: "web development case studies",
    secondaryKeywords: ["SEO case studies", "AI automation case studies", "CRO case studies"],
    entities: ["case studies", "performance optimization", "conversion rate optimization", "technical SEO"],
    audience: "Decision makers comparing agency capability",
    sections: [],
    faqs: commonFaqs,
    related: ["/portfolio", "/services/seo-optimization", "/contact"],
    lastModified: "2026-05-21",
  },
  {
    path: "/blog",
    kind: "blog",
    title: "Blog | Web Development, SEO, AI And Automation Guides | TheDevDale",
    description:
      "Read TheDevDale guides on AI development, technical SEO, local SEO, schema markup, Next.js development, page speed, automation, and conversion optimization.",
    h1: "Web Development, SEO And AI Growth Guides",
    eyebrow: "Blog",
    intro: "Topical authority content for organic growth, AI search visibility, and practical implementation.",
    primaryKeyword: "web development SEO blog",
    secondaryKeywords: ["AI development blog", "technical SEO blog", "page speed optimization"],
    entities: ["topical authority", "semantic SEO", "technical implementation", "AI search"],
    audience: "Founders, marketers, product teams, and business owners",
    sections: [],
    faqs: commonFaqs,
    related: ["/services/seo-optimization", "/services/ai-development", "/services/web-development"],
    lastModified: "2026-05-21",
  },
];

export const seoPages: SEOPage[] = [...corePages, ...servicePages, ...locationPages, ...industryPages, ...blogPages];

export const programmaticLandingPages = [
  "Web Development Hyderabad",
  "Web Development Bangalore",
  "AI Development Hyderabad",
  "SEO Agency Hyderabad",
  "Cross Platform Development Hyderabad",
  "Website Design Chennai",
  "Technical SEO Bangalore",
  "AI Automation Chennai",
  "Ecommerce Web Development Hyderabad",
  "SaaS SEO Bangalore",
];

export const contentClusters = [
  {
    cluster: "AI Development",
    pillar: "/services/ai-development",
    supporting: ["Custom AI Chatbots", "AI Business Automation", "OpenAI Integrations", "AI Workflow Systems", "AI SaaS Development"],
  },
  {
    cluster: "SEO",
    pillar: "/services/seo-optimization",
    supporting: ["Technical SEO", "Local SEO", "Page Speed Optimization", "SEO Audits", "Schema Markup Guide"],
  },
  {
    cluster: "Web Development",
    pillar: "/services/web-development",
    supporting: ["Next.js Development", "Cross Platform Apps", "React Development", "Performance Optimization"],
  },
];

const articleAngles = [
  "Checklist",
  "Strategy",
  "Cost Guide",
  "Mistakes",
  "Examples",
  "Framework",
  "Playbook",
  "Comparison",
  "Roadmap",
  "Audit Guide",
];

const articleTopics = [
  "AI Chatbots",
  "AI Automation",
  "OpenAI Integrations",
  "AI SaaS",
  "Technical SEO",
  "Local SEO",
  "Schema Markup",
  "SEO Audits",
  "Page Speed",
  "Next.js Development",
];

export const seoArticleIdeas = Array.from({ length: 100 }, (_, index) => {
  const topic = articleTopics[index % articleTopics.length];
  const angle = articleAngles[Math.floor(index / articleTopics.length) % articleAngles.length];
  return `${topic} ${angle} For ${index % 2 === 0 ? "Startups" : "Growing Businesses"}`;
});

export const keywordMap = seoPages.map((page) => ({
  url: page.path,
  primaryKeyword: page.primaryKeyword,
  secondaryKeywords: page.secondaryKeywords,
  intent: page.kind === "blog" ? "Informational" : page.kind === "service" ? "Commercial" : "Transactional",
}));

export const contentCalendar = seoArticleIdeas.slice(0, 24).map((title, index) => ({
  week: index + 1,
  title,
  cluster: contentClusters[index % contentClusters.length].cluster,
  targetUrl: `/blog/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
}));

export const internalLinkMap = seoPages.map((page) => ({
  from: page.path,
  to: page.related,
  anchorText: page.related.map((path) => seoPages.find((candidate) => candidate.path === path)?.primaryKeyword ?? "related service"),
}));

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

export function getPageByPath(pathname: string) {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return seoPages.find((page) => page.path === normalized) ?? corePages[0];
}

export function pageBreadcrumbs(path: string) {
  const parts = path.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", url: SITE_URL }];
  let current = "";
  parts.forEach((part) => {
    current += `/${part}`;
    crumbs.push({
      name: part
        .split("-")
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(" "),
      url: absoluteUrl(current),
    });
  });
  return crumbs;
}
