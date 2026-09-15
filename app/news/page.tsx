import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getAllDigests, digestItemHref } from "@/lib/digest";

export const metadata: Metadata = {
  title: "News — The Tech Ledger",
  description:
    "每日 AI 行业资讯日报：大模型、AI 芯片、Agent、应用落地、行业政策与投融资动态，每条附原始来源。",
};

export default function NewsPage() {
  const digests = getAllDigests();
  const latest = digests[0];
  const totalItems = digests.reduce((acc, d) => acc + d.items.length, 0);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 pb-24 pt-28">
        <div className="mb-10 ml-4 border-l-[3px] border-[#CC0000] pl-4 sm:ml-8">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
            The News
          </p>
          <h1 className="mb-3 font-serif text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
            AI 行业日报
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
            <span>每日 10:00 刊发</span>
            {digests.length > 0 && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>
                  {digests.length} 期 / {totalItems} 条
                </span>
              </>
            )}
            {latest && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>最新一期 {latest.date}</span>
              </>
            )}
            <span aria-hidden="true">&middot;</span>
            <a
              href="/feed/digest.xml"
              className="font-bold text-[#111111] underline-offset-4 transition-colors hover:text-[#CC0000] hover:underline"
              style={{ textDecorationColor: "#CC0000" }}
            >
              RSS 订阅 ↗
            </a>
          </p>
        </div>

        {digests.length === 0 ? (
          <div className="border border-[#111111] py-16 text-center">
            <p className="font-serif text-lg italic text-[#737373]">
              尚未刊发任何日报。The presses are warming up.
            </p>
          </div>
        ) : (
          digests.map((digest) => (
            <section key={digest.date} id={digest.date} className="mb-16">
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#111111] pb-2">
                <h2 className="font-serif text-2xl font-black text-[#111111]">
                  {digest.date}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                  Vol. {digest.date.replace(/-/g, ".")} — {digest.items.length}{" "}
                  条
                </span>
              </div>
              <div>
                {digest.items.map((item) => (
                  <article
                    key={item.n}
                    className="group border-b border-[#E5E5E0] py-5 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#F5F5F5] hover:shadow-[4px_4px_0px_0px_#111111]"
                  >
                    <div className="flex items-baseline gap-3 pl-2">
                      <span className="min-w-[36px] font-serif text-2xl font-black leading-none text-[#111111]">
                        {String(item.n).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-base font-black leading-tight text-[#111111] lg:text-lg">
                          <Link
                            href={digestItemHref(digest.date, item.n)}
                            className="transition-colors duration-200 hover:text-[#CC0000]"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <span className="font-mono text-[10px] text-[#737373]">
                            发布 {item.date}
                          </span>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-[#737373] underline-offset-2 hover:text-[#CC0000] hover:underline"
                            style={{ textDecorationColor: "#CC0000" }}
                          >
                            {item.sourceName} ↗
                          </a>
                        </div>
                        <p className="mt-2 font-body text-sm leading-relaxed text-[#525252] line-clamp-3">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}
