import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPages, contentCalendar, contentClusters, internalLinkMap, keywordMap, seoArticleIdeas } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoaded />
      <main className="px-6 pb-28 pt-32 md:px-12 md:pt-44">
        <section className="mx-auto max-w-7xl">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.45em] text-black/30">Content SEO System</p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter md:text-8xl">
            Web Development, SEO And AI Growth Guides
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-black/55">
            Topical authority clusters, keyword mapping, internal links, and AI search ready content for organic lead generation.
          </p>
        </section>

        <section className="mx-auto mt-20 grid max-w-7xl gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-3">
          {contentClusters.map((cluster) => (
            <article key={cluster.cluster} className="bg-white p-7">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{cluster.cluster}</h2>
              <Link to={cluster.pillar} className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                Pillar Page <ArrowUpRight size={14} />
              </Link>
              <ul className="mt-7 space-y-3">
                {cluster.supporting.map((item) => (
                  <li key={item} className="text-sm font-bold text-black/60">{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-20 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogPages.map((page) => (
            <Link key={page.path} to={page.path} className="group border border-black/10 p-6 transition-colors hover:bg-black hover:text-white">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] opacity-35">{page.eyebrow}</p>
              <h2 className="text-2xl font-black tracking-tighter">{page.h1}</h2>
              <p className="mt-4 text-sm leading-relaxed opacity-60">{page.description}</p>
            </Link>
          ))}
        </section>

        <section className="mx-auto mt-24 max-w-7xl">
          <h2 className="mb-8 text-4xl font-black uppercase tracking-tighter">100 SEO Article Ideas</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {seoArticleIdeas.map((idea, index) => (
              <div key={idea} className="border border-black/10 p-4 text-sm font-bold text-black/65">
                <span className="mr-2 text-black/25">{String(index + 1).padStart(3, "0")}</span>
                {idea}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-24 grid max-w-7xl gap-8 lg:grid-cols-3">
          <DataPanel title="Keyword Map" rows={keywordMap.slice(0, 12).map((item) => `${item.url}: ${item.primaryKeyword}`)} />
          <DataPanel title="Content Calendar" rows={contentCalendar.slice(0, 12).map((item) => `Week ${item.week}: ${item.title}`)} />
          <DataPanel title="Internal Linking Map" rows={internalLinkMap.slice(0, 12).map((item) => `${item.from} -> ${item.to.join(", ")}`)} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function DataPanel({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="border border-black/10 p-6">
      <h2 className="mb-5 text-2xl font-black uppercase tracking-tighter">{title}</h2>
      <div className="space-y-3">
        {rows.map((row) => (
          <p key={row} className="border-b border-black/10 pb-3 text-xs font-bold leading-relaxed text-black/55 last:border-b-0">
            {row}
          </p>
        ))}
      </div>
    </div>
  );
}
