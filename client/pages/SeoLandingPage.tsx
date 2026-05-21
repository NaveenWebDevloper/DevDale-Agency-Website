import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StructuredBreadcrumbs } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { getPageByPath, seoPages } from "@/lib/seo";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SeoLandingPage() {
  const location = useLocation();
  const page = getPageByPath(location.pathname);
  const related = page.related.map((path) => seoPages.find((item) => item.path === path)).filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar isLoaded />
      <main>
        <section className="relative overflow-hidden border-b border-black/10 bg-white px-6 pb-20 pt-32 md:px-12 md:pb-28 md:pt-44">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-8">
              <StructuredBreadcrumbs />
              <div className="space-y-5">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-black/35">{page.eyebrow}</p>
                <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter md:text-7xl lg:text-8xl">
                  {page.h1}
                </h1>
                <p className="max-w-2xl text-lg font-medium leading-relaxed text-black/55 md:text-xl">{page.intro}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-full bg-black px-7 text-xs font-black uppercase tracking-widest text-white">
                  <Link to="/contact#audit">
                    Get Free Audit <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-black/15 px-7 text-xs font-black uppercase tracking-widest">
                  <Link to="/case-studies">View Case Studies</Link>
                </Button>
              </div>
            </div>
            <aside className="grid gap-3 rounded-[2rem] border border-black/10 bg-black p-6 text-white shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">SEO Targeting</p>
              <div className="grid gap-4">
                {[page.primaryKeyword, ...page.secondaryKeywords].map((keyword) => (
                  <div key={keyword} className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold capitalize text-white/80">{keyword}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-3">
            {page.sections.map((section) => (
              <article key={section.heading} className="bg-white p-7 md:p-10">
                <h2 className="mb-4 text-2xl font-black uppercase tracking-tighter">{section.heading}</h2>
                <p className="mb-6 text-sm leading-relaxed text-black/55">{section.body}</p>
                <ul className="space-y-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm font-bold text-black/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-zinc-950 px-6 py-20 text-white md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1fr]">
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">AI Search Ready</p>
              <h2 className="text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">Direct Answers, Entities, And Proof.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {page.entities.map((entity) => (
                <div key={entity} className="border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="mb-2 text-lg font-black capitalize">{entity}</h3>
                  <p className="text-sm leading-relaxed text-white/45">
                    This page reinforces {entity} with structured data, semantic copy, internal links, and FAQ coverage.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-4xl font-black uppercase tracking-tighter">Frequently Asked Questions</h2>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group py-6">
                  <summary className="cursor-pointer list-none text-xl font-black tracking-tight">{faq.question}</summary>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-black/55">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-12">
          <div className="mx-auto max-w-7xl border-t border-black/10 pt-12">
            <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter">Internal Links</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item!.path} to={item!.path} className="group border border-black/10 p-6 transition-colors hover:bg-black hover:text-white">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] opacity-40">{item!.kind}</p>
                  <h3 className="text-xl font-black tracking-tighter">{item!.h1}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
