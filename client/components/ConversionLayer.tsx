import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, FileSearch, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/seo";
import { trackClarityEvent } from "@/analytics/clarity";

declare global {
  interface Window {
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
  }
}

function track(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  trackClarityEvent(event);
  window.dispatchEvent(new CustomEvent("thedevdale:event", { detail: { event, ...params } }));
}

export default function ConversionLayer() {
  const location = useLocation();

  useEffect(() => {
    track("page_view", { path: location.pathname });
    const scrollMarks = new Set<number>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const depth = Math.round((window.scrollY / max) * 100);
      [25, 50, 75, 90].forEach((mark) => {
        if (depth >= mark && !scrollMarks.has(mark)) {
          scrollMarks.add(mark);
          track("scroll_depth", { path: location.pathname, depth: mark });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[120] pointer-events-none md:left-auto md:right-6 md:w-auto">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-full border border-black/10 bg-white/90 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl pointer-events-auto md:max-w-none">
        <Link
          to="/contact#audit"
          onClick={() => track("free_audit_cta_click", { path: location.pathname })}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-4 text-xs font-black uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5"
        >
          <FileSearch size={15} />
          Free Audit
        </Link>
        <Link
          to="/book"
          onClick={() => {
            track("book_call_click", { path: location.pathname });
            track("consultation_booked", { path: location.pathname });
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-black transition-colors hover:bg-black hover:text-white"
          aria-label="Book a strategy call"
        >
          <CalendarDays size={17} />
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", { path: location.pathname })}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:-translate-y-0.5"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={17} />
        </a>
      </div>
    </div>
  );
}
