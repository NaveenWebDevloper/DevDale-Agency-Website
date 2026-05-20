import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface PageSkeletonLoaderProps {
  type?: "index" | "about" | "projects" | "detail" | "pricing" | "contact" | "general";
}

export default function PageSkeletonLoader({ type: manualType }: PageSkeletonLoaderProps) {
  const [type, setType] = useState<string>("general");

  useEffect(() => {
    if (manualType) {
      setType(manualType);
      return;
    }

    const path = window.location.pathname;
    if (path === "/") setType("index");
    else if (path === "/about") setType("about");
    else if (path === "/projects") setType("projects");
    else if (path.startsWith("/work/")) setType("detail");
    else if (path === "/pricing") setType("pricing");
    else if (path === "/contact") setType("contact");
    else setType("general");
  }, [manualType]);

  // General Navbar skeleton
  const renderNavbar = () => (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 w-full">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-8 rounded-full border border-black/5 bg-white/40 backdrop-blur-md">
        {/* Logo skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-black/5 animate-pulse" />
          <div className="w-20 h-4 bg-black/5 rounded animate-pulse" />
        </div>
        {/* Nav items skeleton */}
        <div className="hidden md:flex items-center gap-6">
          <div className="w-12 h-2 bg-black/5 rounded animate-pulse" />
          <div className="w-12 h-2 bg-black/5 rounded animate-pulse" />
          <div className="w-12 h-2 bg-black/5 rounded animate-pulse" />
          <div className="w-12 h-2 bg-black/5 rounded animate-pulse" />
        </div>
        {/* CTA skeleton */}
        <div className="w-28 h-9 rounded-full bg-black/10 animate-pulse" />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case "index":
        return (
          <div className="max-w-5xl mx-auto px-6 pt-24 space-y-16">
            {/* Hero Header Skeleton */}
            <div className="space-y-6 pt-10">
              <div className="w-24 h-3 bg-black/5 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="w-3/4 h-16 md:h-24 bg-black/5 rounded-2xl animate-pulse" />
                <div className="w-1/2 h-16 md:h-24 bg-black/5 rounded-2xl animate-pulse" />
              </div>
              <div className="w-2/3 h-4 bg-black/5 rounded animate-pulse" />
              <div className="flex gap-4 pt-4">
                <div className="w-36 h-12 rounded-full bg-black/10 animate-pulse" />
                <div className="w-36 h-12 rounded-full bg-black/5 animate-pulse" />
              </div>
            </div>

            {/* Giant Hero Visual */}
            <div className="w-full aspect-[21/9] rounded-[2.5rem] bg-black/5 border border-black/5 animate-pulse" />
            
            {/* Split Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl border border-black/5 bg-gray-50/50 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse" />
                <div className="w-24 h-4 bg-black/5 rounded animate-pulse" />
                <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
              </div>
              <div className="p-8 rounded-3xl border border-black/5 bg-gray-50/50 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse" />
                <div className="w-24 h-4 bg-black/5 rounded animate-pulse" />
                <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
              </div>
              <div className="p-8 rounded-3xl border border-black/5 bg-gray-50/50 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse" />
                <div className="w-24 h-4 bg-black/5 rounded animate-pulse" />
                <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="max-w-7xl mx-auto px-6 pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pt-10">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-8">
                {/* Stamp Emblem Placeholder */}
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-black/5 flex items-center justify-center animate-spin [animation-duration:15s] opacity-30">
                  <div className="w-16 h-16 rounded-full bg-black/5" />
                </div>
                <div className="space-y-4">
                  <div className="w-20 h-3 bg-black/5 rounded animate-pulse" />
                  <div className="w-full h-12 bg-black/5 rounded-xl animate-pulse" />
                  <div className="w-4/5 h-12 bg-black/5 rounded-xl animate-pulse" />
                </div>
                <div className="w-full h-24 bg-black/5 rounded-2xl animate-pulse" />
              </div>
              
              {/* Right Column */}
              <div className="lg:col-span-7 space-y-12">
                <div className="w-full aspect-[16/9] rounded-[2.5rem] bg-black/5 animate-pulse" />
                <div className="space-y-4">
                  <div className="w-32 h-4 bg-black/5 rounded animate-pulse" />
                  <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
                  <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
                  <div className="w-3/4 h-3 bg-black/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-24 space-y-16">
            {/* Header Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pt-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="w-36 h-3 bg-black/5 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="w-2/3 h-16 bg-black/5 rounded-2xl animate-pulse" />
                  <div className="w-1/2 h-16 bg-black/5 rounded-2xl animate-pulse" />
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="p-8 rounded-[2rem] bg-gray-50 border border-black/5 space-y-4">
                  <div className="w-24 h-3 bg-black/5 rounded animate-pulse" />
                  <div className="w-36 h-8 bg-black/5 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Grid Layout Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-10 border-t border-black/5">
              {/* Sidebar Filters */}
              <div className="lg:col-span-2 space-y-6">
                <div className="w-20 h-2 bg-black/5 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="w-32 h-6 bg-black/5 rounded animate-pulse" />
                  <div className="w-28 h-6 bg-black/5 rounded animate-pulse" />
                  <div className="w-30 h-6 bg-black/5 rounded animate-pulse" />
                </div>
              </div>

              {/* Dynamic Project List */}
              <div className="lg:col-span-10 space-y-16">
                <div className="space-y-6">
                  <div className="w-full aspect-[16/9] rounded-[3.5rem] bg-black/5 animate-pulse" />
                  <div className="flex justify-between items-center">
                    <div className="w-48 h-6 bg-black/5 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-black/5 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="w-full aspect-[16/9] rounded-[3.5rem] bg-black/5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        );

      case "detail":
        return (
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-24 space-y-12">
            {/* Back Button */}
            <div className="w-28 h-8 rounded-full bg-black/5 animate-pulse pt-10" />

            {/* Title & Metadata Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="w-20 h-3 bg-black/5 rounded animate-pulse" />
                <div className="w-4/5 h-16 bg-black/5 rounded-2xl animate-pulse" />
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-12 h-2 bg-black/5 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-black/5 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-2 bg-black/5 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-black/5 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Giant Mockup Placeholder */}
            <div className="w-full aspect-[21/9] rounded-[3.5rem] bg-black/5 border border-black/5 animate-pulse" />

            {/* Content paragraph blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-10 border-t border-black/5">
              <div className="lg:col-span-4">
                <div className="w-32 h-4 bg-black/5 rounded animate-pulse" />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
                <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
                <div className="w-5/6 h-3 bg-black/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="max-w-7xl mx-auto px-6 pt-24 space-y-16">
            {/* Header */}
            <div className="text-center space-y-6 pt-10">
              <div className="w-24 h-3 bg-black/5 rounded mx-auto animate-pulse" />
              <div className="w-2/3 h-12 bg-black/5 rounded-xl mx-auto animate-pulse" />
              <div className="w-1/2 h-4 bg-black/5 rounded mx-auto animate-pulse" />
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-8 rounded-[2.5rem] border border-black/5 bg-gray-50/50 space-y-8 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-full bg-black/5" />
                    <div className="w-12 h-3 bg-black/5 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-36 h-6 bg-black/5 rounded" />
                    <div className="w-full h-3 bg-black/5 rounded" />
                  </div>
                  <div className="py-6 border-y border-black/5 space-y-3">
                    <div className="w-24 h-8 bg-black/5 rounded" />
                    <div className="w-16 h-3 bg-black/5 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-black/5 rounded" />
                    <div className="w-full h-3 bg-black/5 rounded" />
                    <div className="w-4/5 h-3 bg-black/5 rounded" />
                  </div>
                  <div className="w-full h-12 rounded-full bg-black/10" />
                </div>
              ))}
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="max-w-7xl mx-auto px-6 pt-24">
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,1fr] gap-16 lg:gap-32 items-center pt-10">
              {/* Left Column */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="w-24 h-3 bg-black/5 rounded animate-pulse" />
                  <div className="space-y-3">
                    <div className="w-3/4 h-12 bg-black/5 rounded-xl animate-pulse" />
                    <div className="w-1/2 h-12 bg-black/5 rounded-xl animate-pulse" />
                  </div>
                  <div className="w-2/3 h-4 bg-black/5 rounded animate-pulse" />
                </div>
                {/* Contact options */}
                <div className="flex gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-12 h-2 bg-black/5 rounded" />
                      <div className="w-24 h-4 bg-black/5 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-12 h-2 bg-black/5 rounded" />
                      <div className="w-24 h-4 bg-black/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Form Card */}
              <div className="p-8 md:p-12 rounded-[3.5rem] border border-black/5 bg-gray-50/50 space-y-6 animate-pulse">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="w-20 h-2 bg-black/5 rounded" />
                    <div className="w-full h-12 bg-black/5 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-20 h-2 bg-black/5 rounded" />
                    <div className="w-full h-12 bg-black/5 rounded-2xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-2 bg-black/5 rounded" />
                  <div className="w-full h-12 bg-black/5 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-2 bg-black/5 rounded" />
                  <div className="w-full h-32 bg-black/5 rounded-2xl" />
                </div>
                <div className="w-full h-14 rounded-2xl bg-black/10" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-5xl mx-auto px-6 pt-24 space-y-8">
            <div className="w-32 h-4 bg-black/5 rounded animate-pulse" />
            <div className="w-full h-12 bg-black/5 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
              <div className="w-full h-3 bg-black/5 rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-black/5 rounded animate-pulse" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col justify-between">
      {/* High-density grid background for texture */}
      <div 
        className="absolute inset-0 opacity-[0.2] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 noise opacity-[0.02] pointer-events-none" />

      <div>
        <div className="fixed top-0 left-0 w-full z-50 pt-4">
          {renderNavbar()}
        </div>
        <main className="w-full pt-16 pb-24 relative z-10 flex-grow">
          {renderContent()}
        </main>
      </div>

      {/* Minimal Footer Skeleton */}
      <div className="border-t border-black/5 py-8 max-w-5xl mx-auto w-full px-6 flex justify-between items-center">
        <div className="w-24 h-4 bg-black/5 rounded animate-pulse" />
        <div className="w-36 h-2 bg-black/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
