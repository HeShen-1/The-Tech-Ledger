"use client";

import type { Signal } from "@/lib/types";
import { ExternalLink } from "lucide-react";

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const accentForCategory = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes("ai") || c.includes("ml")) return "#CC0000";
  if (c.includes("security")) return "#CC0000";
  if (c.includes("open source")) return "#111111";
  if (c.includes("web")) return "#111111";
  return "#111111";
};

export function SignalCard({ signal, index }: { signal: Signal; index: number }) {
  const isLead = index === 0;

  return (
    <article
      className="group relative cursor-pointer border-b border-[#E5E5E0] py-5 transition-all duration-200 hover:bg-[#F5F5F5] hover:shadow-[4px_4px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5"
      aria-labelledby={`signal-${signal.id}`}
    >
      <div className="flex items-baseline gap-3 pl-2">
        <span className="min-w-[36px] font-serif text-2xl font-black leading-none" style={{ color: index === 0 ? "#CC0000" : index < 3 ? "#111111" : "#E5E5E0" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`signal-${signal.id}`} className={`font-serif font-black leading-tight text-[#111111] ${isLead ? "text-xl lg:text-2xl" : "text-base lg:text-lg"}`}>
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-start gap-1 transition-colors duration-200 hover:text-[#CC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
            >
              {signal.title}
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
            </a>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] text-[#737373] underline-offset-2 group-hover:underline" style={{ textDecorationColor: "#CC0000" }}>
              {signal.sourceLabel}
            </span>
            <span className="font-mono text-[10px] font-medium text-[#525252]">{signal.scoreLabel}</span>
            <span className="font-mono text-[10px] text-[#737373]">&middot; {timeAgo(signal.timestamp)}</span>
            {signal.readTime && (
              <span className="font-mono text-[10px] text-[#737373]">&middot; {signal.readTime} min read</span>
            )}
            <span
              className="border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
              style={{ borderColor: accentForCategory(signal.category), color: accentForCategory(signal.category) }}
            >
              {signal.category}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
