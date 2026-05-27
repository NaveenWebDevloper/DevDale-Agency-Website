const siteUrl = "https://thedevdale.com";
const today = "2026-05-21";

const routes = [
  "/",
  "/about",
  "/contact",
  "/portfolio",
  "/case-studies",
  "/blog",
  "/services/web-design",
  "/services/web-development",
  "/services/seo-optimization",
  "/services/ai-development",
  "/services/cross-platform-development",
  "/location/hyderabad",
  "/location/bangalore",
  "/location/chennai",
  "/industries/saas",
  "/industries/ecommerce",
  "/industries/restaurants",
  "/blog/custom-ai-chatbots",
  "/blog/ai-business-automation",
  "/blog/openai-integrations",
  "/blog/ai-workflow-systems",
  "/blog/ai-saas-development",
  "/blog/technical-seo",
  "/blog/local-seo",
  "/blog/page-speed-optimization",
  "/blog/seo-audits",
  "/blog/schema-markup-guide",
  "/blog/nextjs-development",
  "/blog/cross-platform-apps",
  "/blog/react-development",
  "/blog/performance-optimization",
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route === "/" ? "" : route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.includes("/blog/") ? "monthly" : "weekly"}</changefreq>
    <priority>${route === "/" ? "1.0" : route.includes("/services/") ? "0.9" : "0.8"}</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${siteUrl}${route === "/" ? "" : route}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${route === "/" ? "" : route}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route === "/" ? "" : route}" />
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Host: thedevdale.com
`;

await import("node:fs/promises").then(async (fs) => {
  await fs.mkdir("public", { recursive: true });
  await fs.writeFile("public/sitemap.xml", sitemap);
  await fs.writeFile("public/robots.txt", robots);
});
