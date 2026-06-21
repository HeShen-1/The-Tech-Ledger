"use client";

import { useEffect, useState } from "react";
import type { Signal } from "@/lib/types";
import { SignalCard } from "./signal-card";

export function ReportPreview({ date }: { date: string }) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/${date}`)
      .then((r) => r.json())
      .then((d) => { if (d.signals) setSignals(d.signals); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-[#E5E5E0]" />
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return <p className="font-serif text-base italic text-[#737373]">No signals captured for this date.</p>;
  }

  return (
    <div>
      {signals.slice(0, 10).map((signal, i) => (
        <SignalCard key={signal.id} signal={signal} index={i} />
      ))}
    </div>
  );
}
