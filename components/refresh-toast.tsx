"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Newspaper } from "lucide-react";

export function RefreshToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const showRef = useRef<(msg: string) => void>();

  showRef.current = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 3500);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/trending");
        const data = await res.json();
        if (!data.cached && data.total > 0) {
          showRef.current?.(`${data.total} new signals detected`);
        }
      } catch { /* silent */ }
    }, 300_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2 border border-[#111111] bg-[#F9F9F7] px-5 py-2.5"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-[#CC0000]" strokeWidth={1.5} />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#111111]">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
