import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ExternalLink } from "lucide-react";
import { getDigestDates, getDigest, type Digest, type DigestItem } from "@/lib/digest";

interface PageProps {
  params: { date: string; n: string };
}

/** 条目在构建时全部枚举，未知路径直接 404（避免软 404 被缓存） */
export const dynamicParams = false;

function findItem(date: string, n: number): { digest: Digest; item: DigestItem } | null {
  const digest = getDigest(date);
  if (!digest) return null;
  const item = digest.items.find((it) => it.n === n);
  if (!item) return null;
  return { digest, item };
}

export function generateStaticParams() {
  return getDigestDates().flatMap((date) => {
    const digest = getDigest(date);
    if (!digest) return [];
    return digest.items.map((it) => ({ date, n: String(it.n) }));
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const found = findItem(params.date, Number(params.n));
  if (!found) return { title: "Not Found — The Tech Ledger" };
  return {
    title: `${found.item.title} — The Tech Ledger News`,
    description: found.item.summary.slice(0, 160),
  };
}

export default async function DigestItemPage({ params }: PageProps) {
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 1) notFound();
  const found = findItem(params.date, n);
  if (!found) notFound();
  const { digest, item } = found;

  const idx = digest.items.findIndex((it) => it.n === n);
  const prev = idx > 0 ? digest.items[idx - 1] : null;
  const next = idx < digest.items.length - 1 ? digest.items[idx + 1] : null;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          News — {digest.date} Edition
        </p>
        <h1 className="mb-4 font-serif text-3xl font-black leading-tight tracking-tight text-[#111111] sm:text-4xl">
          {item.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-[#111111] py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          <span>
            第 {item.n} 条 / 共 {digest.items.length} 条
          </span>
          <span aria-hidden="true">&middot;</span>
          <span>原文发布 {item.date}</span>
          <span aria-hidden="true">&middot;</span>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#111111] underline-offset-4 transition-colors hover:text-[#CC0000] hover:underline"
            style={{ textDecorationColor: "#CC0000" }}
          >
            {item.sourceName}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-8 font-body text-lg leading-loose text-[#333333]">
          {item.summary}
        </div>

        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex min-h-[44px] items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111]"
        >
          阅读原文 ↗
        </a>

        <nav className="mt-12 grid gap-px border border-[#111111] sm:grid-cols-2" aria-label="期刊内导航">
          {prev ? (
            <Link
              href={`/digest/${digest.date}/${prev.n}`}
              className="group flex min-h-[64px] flex-col justify-center gap-1 border-[#111111] px-4 py-3 transition-colors hover:bg-[#F5F5F5] sm:border-r"
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#737373]">
                ← 上一条
              </span>
              <span className="font-serif text-sm font-bold leading-snug text-[#111111] group-hover:text-[#CC0000]">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span className="flex min-h-[64px] flex-col justify-center px-4 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#A3A3A3] sm:border-r sm:border-[#E5E5E0]">
              已是本期第一条
            </span>
          )}
          {next ? (
            <Link
              href={`/digest/${digest.date}/${next.n}`}
              className="group flex min-h-[64px] flex-col justify-end gap-1 px-4 py-3 text-right transition-colors hover:bg-[#F5F5F5]"
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#737373]">
                下一条 →
              </span>
              <span className="font-serif text-sm font-bold leading-snug text-[#111111] group-hover:text-[#CC0000]">
                {next.title}
              </span>
            </Link>
          ) : (
            <span className="flex min-h-[64px] flex-col justify-center px-4 py-3 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#A3A3A3]">
              已是本期最后一条
            </span>
          )}
        </nav>

        <Link
          href="/news"
          className="mt-8 inline-flex min-h-[44px] items-center border border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#111111] transition-all duration-200 hover:bg-[#111111] hover:text-[#F9F9F7]"
        >
          ← 返回 {digest.date} 期目录
        </Link>
      </main>
      <Footer />
    </>
  );
}
