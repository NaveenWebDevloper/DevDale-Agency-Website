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
    <div className="hidden md:block md:fixed md:bottom-32 md:left-auto md:right-8 md:w-auto z-[120] pointer-events-none">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/90 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl pointer-events-auto md:max-w-none">
        <Link
          to="/contact#audit"
          onClick={() => track("free_audit_cta_click", { path: location.pathname })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5"
        >
          <FileSearch size={13} />
          Free Audit
        </Link>
        <Link
          to="/book"
          onClick={() => {
            track("book_call_click", { path: location.pathname });
            track("consultation_booked", { path: location.pathname });
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black transition-colors hover:bg-black hover:text-white"
          aria-label="Book a strategy call"
        >
          <CalendarDays size={15} />
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", { path: location.pathname })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:-translate-y-0.5"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={15} />
        </a>
      </div>
    </div>
  );
}
