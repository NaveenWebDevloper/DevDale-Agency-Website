import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackClarityEvent } from "@/analytics/clarity";
import { Link } from "react-router-dom";

const items = [
  { name: "VGS Global", image: "/projects/vgsglobal.webp", category: "Website Development", result: "Performance focused business website" },
  { name: "Patents Planet", image: "/projects/patentsplanet.webp", category: "Technical Platform", result: "Structured service UX and lead paths" },
  { name: "Crop Planning", image: "/projects/cropplanning.webp", category: "Application Development", result: "Planning interface for operational workflows" },
];

export default function PortfolioIndex() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoaded />
      <main className="px-6 pb-28 pt-32 md:px-12 md:pt-44">
        <section className="mx-auto max-w-7xl">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.45em] text-black/30">Portfolio</p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter md:text-8xl">Selected Web And Product Work</h1>
        </section>
        <section className="mx-auto mt-20 grid max-w-7xl gap-8 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.name}
              onClick={() => trackClarityEvent("portfolio_click")}
              className="group overflow-hidden border border-black/10"
            >
              <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
                <img 
                  src={item.image} 
                  alt={`${item.name} ${item.category} portfolio project by TheDevDale`} 
                  width={400}
                  height={300}
                  loading="lazy" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="p-6">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-black/35">{item.category}</p>
                <h2 className="text-2xl font-black tracking-tighter">{item.name}</h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-black/55">{item.result}</p>
              </div>
            </article>
          ))}
        </section>
        <div className="mx-auto mt-16 max-w-7xl">
          <Link to="/contact" className="inline-flex rounded-full bg-black px-7 py-4 text-xs font-black uppercase tracking-widest text-white">
            Start a Similar Project
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
