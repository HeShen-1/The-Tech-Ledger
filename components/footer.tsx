import { Newspaper } from "lucide-react";

const sourceList = ["GitHub Trending", "Hacker News", "arXiv", "Engineering Blogs"];
const infoLinks = [
  { label: "About", href: "/about" },
  { label: "API", href: "/api/trending" },
  { label: "Vercel ▲", href: "https://vercel.com" },
];

export function Footer() {
  return (
    <footer id="about" className="border-t-4 border-[#111111] bg-[#111111]">
      <div className="mx-auto max-w-screen-xl px-4 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-4 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-[#F9F9F7]" strokeWidth={1.5} />
              <p className="font-serif text-lg font-black text-[#F9F9F7]">THE TECH LEDGER</p>
            </div>
            <p className="font-body text-sm leading-relaxed text-[#A3A3A3]">
              Real-time tech intelligence. No noise. Just signal.
              <br />
              Powered by Firecrawl, Tavily &amp; Exa.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CC0000]">
                Data Sources
              </p>
              <ul className="space-y-2">
                {sourceList.map((s) => (
                  <li key={s}>
                    <span className="font-mono text-[11px] text-[#A3A3A3]">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CC0000]">
                Info
              </p>
              <ul className="space-y-2">
                {infoLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="font-mono text-[11px] text-[#A3A3A3] transition-colors duration-200 hover:text-[#F9F9F7]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#404040] pt-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          &copy; {new Date().getFullYear()} The Tech Ledger &middot; Printed in Digital &middot; Edition Vol. I
        </div>
      </div>
    </footer>
  );
}
