"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { SourceStatus } from "@/lib/types";
import { Activity } from "lucide-react";

function StatusDot({ status }: { status: SourceStatus["status"] }) {
  const bg = status === "ok" ? "#22C55E" : status === "timeout" ? "#F59E0B" : "#EF4444";
  return <span className="inline-block h-2 w-2 flex-shrink-0" style={{ backgroundColor: bg }} aria-label={status} />;
}

export function SourceBreakdown({ sources }: { sources: SourceStatus[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  return (
    <div ref={ref}>
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#737373]" strokeWidth={1.5} />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">Source Desk</h3>
      </div>

      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((source, i) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`border-[#111111] bg-[#F9F9F7] p-4 transition-all duration-200 hover:bg-[#F5F5F5]
              ${i % 2 === 0 ? "sm:border-r" : ""}
              ${i !== 3 ? "lg:border-r" : ""}
              border-b sm:border-b border-t border-l
              ${i === 0 ? "sm:border-l" : ""}
            `}
          >
            <span className="font-serif text-sm font-bold text-[#111111]">{source.name}</span>
            <div className="mt-2 h-6 w-full origin-bottom bg-[#E5E5E0]">
              <div
                className="h-full bg-[#111111] transition-transform duration-500"
                style={{ transform: `scaleX(${inView ? source.count / maxCount : 0})`, transformOrigin: "left" }}
              />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-mono text-[10px] text-[#525252]">{source.latency}ms</span>
              <span className="flex items-center gap-1.5">
                <StatusDot status={source.status} />
                <span className="font-serif text-lg font-black text-[#111111]">{source.count}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
