"use client";

import { motion } from "framer-motion";

const titleWords = ["What", "the", "Tech", "World", "is", "Reading"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
};

const fadeInWord = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero({ signalCount }: { signalCount: number }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <section className="newsprint-texture relative mx-auto max-w-screen-xl px-4 pb-16 pt-28 sm:pt-36">
      {/* Decorative accent line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-28 h-20 w-[3px] origin-top bg-[#CC0000] sm:top-36"
        aria-hidden="true"
      />

      <div className="ml-4 sm:ml-8">
        {/* Masthead */}
        <motion.h1
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-6 max-w-4xl font-serif text-5xl font-black leading-[0.9] tracking-tighter text-[#111111] sm:text-6xl lg:text-8xl"
        >
          {titleWords.map((word) => (
            <motion.span key={word} variants={fadeInWord} className="mr-[0.2em] inline-block">
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={fadeInWord}
            className="block italic w-fit"
            style={{ borderBottom: "4px solid #CC0000", paddingBottom: "0.02em" }}
          >
            Today
          </motion.span>
        </motion.h1>

        {/* Subtitle + Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="flex items-start gap-6 border-t border-[#111111] pt-6"
        >
          <p className="max-w-xs font-body text-sm leading-relaxed text-[#525252] sm:text-base">
            Curated from GitHub, Hacker News, and the most influential engineering blogs. Updated every 5 minutes.
          </p>
          <div className="hidden h-12 w-px bg-[#E5E5E0] sm:block" aria-hidden="true" />
          <div className="hidden sm:block">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">Tracking</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl font-black text-[#111111]"
            >
              {signalCount.toLocaleString()}
            </motion.p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">active signals</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
