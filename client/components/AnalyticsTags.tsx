import { useEffect } from "react";

const GA4_ID = import.meta.env.VITE_GA4_ID;
const GTM_ID = import.meta.env.VITE_GTM_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;

export default function AnalyticsTags() {
  useEffect(() => {
    if (GTM_ID && !document.querySelector(`script[data-gtm="${GTM_ID}"]`)) {
      const script = document.createElement("script");
      script.dataset.gtm = GTM_ID;
      script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;
      document.head.appendChild(script);
    }

    if (GA4_ID && !document.querySelector(`script[src*="${GA4_ID}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      document.head.appendChild(script);

      const inline = document.createElement("script");
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}',{send_page_view:false});`;
      document.head.appendChild(inline);
    }

    if (CLARITY_ID && !document.querySelector(`script[data-clarity="${CLARITY_ID}"]`)) {
      const script = document.createElement("script");
      script.dataset.clarity = CLARITY_ID;
      script.textContent = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
