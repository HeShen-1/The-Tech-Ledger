"use client";

import { motion } from "framer-motion";
import type { Signal } from "@/lib/types";
import { SignalCard } from "./signal-card";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function SignalList({ signals }: { signals: Signal[] }) {
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
      <div className="mb-6 border-b-4 border-[#111111] pb-3">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">
          Trending Signals
        </h2>
      </div>
      <motion.div variants={container} initial="hidden" animate="show">
        {signals.slice(0, 10).map((signal, i) => (
          <motion.div key={signal.id} variants={item}>
            <SignalCard signal={signal} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
