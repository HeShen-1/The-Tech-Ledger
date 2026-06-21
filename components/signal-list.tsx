"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Signal } from "@/lib/types";
import { SignalCard } from "./signal-card";
import { SourceBreakdown } from "./source-breakdown";
import type { SourceStatus } from "@/lib/types";

type SourceFilter = "all" | Signal["source"];

const tabs: { key: SourceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "github", label: "GitHub" },
  { key: "hackernews", label: "Hacker News" },
  { key: "arxiv", label: "arXiv" },
  { key: "blog", label: "Tech Blogs" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function SignalList({ signals, sources }: { signals: Signal[]; sources: SourceStatus[] }) {
  const [filter, setFilter] = useState<SourceFilter>("all");
  const filtered = filter === "all" ? signals : signals.filter((s) => s.source === filter);

  if (signals.length === 0) {
    return (
      <section id="trending" className="mx-auto max-w-screen-xl px-4 py-16">
        <div className="border border-[#111111] py-16 text-center">
          <p className="font-serif text-lg italic text-[#737373]">
            No signals detected. The presses are quiet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="trending" className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Section header */}
      <div className="mb-6 border-b-4 border-[#111111] pb-3">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">
          Trending
        </h2>
      </div>

      {/* Source tabs */}
      <div className="mb-6 flex flex-wrap gap-1">
        {tabs.map((t) => {
          const active = filter === t.key;
          const count = t.key === "all" ? signals.length : signals.filter((s) => s.source === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-200 min-h-[36px] inline-flex items-center gap-1.5
                ${active
                  ? "border-[#111111] bg-[#111111] text-[#F9F9F7]"
                  : "border-[#E5E5E0] bg-transparent text-[#737373] hover:border-[#111111] hover:text-[#111111]"
                }`}
            >
              {t.label}
              <span className={active ? "text-[#CC0000]" : "text-[#737373]"}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Signal cards */}
      <motion.div variants={container} initial="hidden" animate="show" key={filter}>
        {filtered.slice(0, 10).map((signal, i) => (
          <motion.div key={signal.id} variants={item}>
            <SignalCard signal={signal} index={i} />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="border border-[#111111] py-12 text-center">
            <p className="font-serif text-base italic text-[#737373]">No signals from this source right now.</p>
          </div>
        )}
      </motion.div>

      {/* Source desk — compact summary below */}
      <div className="mt-12 border-t-4 border-[#111111] pt-6">
        <SourceBreakdown sources={sources} signals={signals} />
      </div>
    </section>
  );
}
