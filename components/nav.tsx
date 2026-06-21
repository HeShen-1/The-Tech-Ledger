"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { LiveIndicator } from "./live-indicator";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Trending" },
  { href: "/reports", label: "Reports" },
  { href: "/api", label: "API" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("New York");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => { if (d.city) setCity(d.city); })
      .catch(() => {}); // keep default
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        backgroundColor: "#F9F9F7",
        backgroundImage: `url('/cardboard-flat.png')`,
        backgroundRepeat: "repeat",
      }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-[#111111]"
        style={{ opacity: borderOpacity }}
      />

      <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <a href="/" className="font-serif text-lg font-black tracking-tight text-[#111111]">
            THE TECH LEDGER
          </a>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="h-4 w-px bg-[#E5E5E0]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#737373]">
              Vol. 1 &nbsp;|&nbsp; {new Date().toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" })} &nbsp;|&nbsp; {city} Edition
            </span>
          </div>
          <div className="hidden gap-6 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#737373] transition-colors duration-200 hover:text-[#CC0000]"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LiveIndicator />
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#111111] bg-transparent"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#111111] md:hidden"
          style={{
            backgroundColor: "#F9F9F7",
            backgroundImage: `url('/cardboard-flat.png')`,
            backgroundRepeat: "repeat",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-t border-[#E5E5E0] px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#CC0000]"
            >
              {l.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
