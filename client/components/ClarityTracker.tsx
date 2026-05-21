import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackClarityEvent } from "@/analytics/clarity";

const serviceEvents: Record<string, string> = {
  "/services/ai-development": "service_ai_open",
  "/services/web-design": "service_web_open",
  "/services/web-development": "service_web_open",
  "/services/seo-optimization": "service_seo_open",
};

export default function ClarityTracker() {
  const location = useLocation();

  useEffect(() => {
    trackClarityEvent(`page_view_${location.pathname}`);

    const serviceEvent = serviceEvents[location.pathname];
    if (serviceEvent) {
      trackClarityEvent(serviceEvent);
    }

    if (location.pathname === "/pricing") {
      trackClarityEvent("pricing_view");
    }

    if (location.pathname === "/portfolio") {
      trackClarityEvent("portfolio_view");
    }

    if (location.pathname === "/case-studies") {
      trackClarityEvent("case_study_view");
    }
  }, [location]);

  return null;
}
