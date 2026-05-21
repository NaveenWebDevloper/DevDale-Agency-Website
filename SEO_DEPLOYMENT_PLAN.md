# TheDevDale Enterprise SEO Deployment Plan

## Production Environment
- Domain: `https://thedevdale.com`
- Hosting: Vercel
- Build command: `pnpm run build:client`
- Output directory: `dist/client`
- Required env vars: `VITE_GA4_ID`, `VITE_GTM_ID`, `VITE_CLARITY_ID`

## Launch Checklist
- Verify `robots.txt` and `sitemap.xml` at the production domain.
- Add property in Google Search Console and submit `https://thedevdale.com/sitemap.xml`.
- Add Bing Webmaster Tools and submit the same sitemap.
- Connect GA4, GTM, and Microsoft Clarity IDs in Vercel environment variables.
- Validate JSON-LD with Google Rich Results Test and Schema.org validator.
- Run Lighthouse for LCP, INP, CLS, accessibility, best practices, and SEO.
- Confirm canonical URLs resolve to `https://thedevdale.com`.
- Confirm Vercel redirects force HTTPS and non-indexable API routes remain excluded.

## Local SEO
- Optimize Google Business Profile with primary category: Website Designer or Software Company.
- Keep NAP consistent across website, GBP, Clutch, GoodFirms, DesignRush, LinkedIn, directories, and invoices.
- Publish Hyderabad, Bangalore, and Chennai pages.
- Request reviews after project milestones with service and city context.
- Build citations on IndiaMART, Justdial, Sulekha, Clutch, GoodFirms, DesignRush, and startup directories.

## Off Page SEO
- Target 20 quality backlinks per month.
- Monthly mix: 6 guest posts, 4 directory profiles, 3 partner links, 3 digital PR mentions, 2 HARO/source quotes, 2 competitor gap wins.
- Prioritize topical relevance: web development, AI automation, SaaS, ecommerce, SEO, and startup ecosystems.

## Audit System
- Weekly: sitemap, robots, 404s, broken links, index coverage, schema validity.
- Monthly: Core Web Vitals, metadata, internal links, keyword movement, conversion rate, backlink quality.
- Quarterly: content pruning, entity expansion, programmatic page expansion, competitor backlink gap analysis.
