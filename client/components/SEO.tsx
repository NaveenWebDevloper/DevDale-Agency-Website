import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildPageSchemas } from "@/lib/schema";
import { absoluteUrl, DEFAULT_IMAGE, getPageByPath, pageBreadcrumbs, SITE_URL } from "@/lib/seo";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = document.createElement(attrs.rel ? "link" : "meta") as HTMLMetaElement | HTMLLinkElement;
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
}

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const page = getPageByPath(location.pathname);
    const canonical = absoluteUrl(page.path);
    const title = page.title.length > 60 ? page.title.slice(0, 57).trim() + "..." : page.title;

    document.documentElement.lang = "en-IN";
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: page.description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow, max-image-preview:large" });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: canonical });
    upsertMeta('link[rel="alternate"][hreflang="en-IN"]', { rel: "alternate", hreflang: "en-IN", href: canonical });
    upsertMeta('link[rel="alternate"][hreflang="en"]', { rel: "alternate", hreflang: "en", href: canonical });
    upsertMeta('link[rel="alternate"][hreflang="x-default"]', { rel: "alternate", hreflang: "x-default", href: canonical });

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: page.kind === "blog" ? "article" : "website" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "TheDevDale" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: page.description });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_IMAGE });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:url"]', { name: "twitter:url", content: canonical });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: page.description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_IMAGE });

    document.querySelectorAll('script[data-seo-schema="true"]').forEach((node) => node.remove());
    buildPageSchemas(page).forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoSchema = "true";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [location.pathname]);

  return null;
}

export function StructuredBreadcrumbs() {
  const location = useLocation();
  const crumbs = pageBreadcrumbs(location.pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/35">
      {crumbs.map((crumb, index) => (
        <span key={crumb.url} className="flex items-center gap-2">
          <a href={crumb.url.replace(SITE_URL, "") || "/"} className="hover:text-black transition-colors">
            {crumb.name}
          </a>
          {index < crumbs.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}
