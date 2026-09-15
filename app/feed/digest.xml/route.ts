import { getAllDigests } from "@/lib/digest";

export const dynamic = "force-static";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://the-tech-ledger.vercel.app";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** YYYY-MM-DD → RFC 822（按每日 10:00 +0800 刊发） */
function rfc822(day: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return new Date().toUTCString();
  const [, y, mm, dd] = m;
  const weekday = DAYS[new Date(Date.UTC(+y, +mm - 1, +dd)).getUTCDay()];
  return `${weekday}, ${+dd} ${MONTHS[+mm - 1]} ${y} 10:00:00 +0800`;
}

export function GET() {
  const digests = getAllDigests();
  const now = new Date().toUTCString();

  const items = digests
    .flatMap((digest) =>
      digest.items.map((it) => {
        const url = `${SITE}/digest/${digest.date}/${it.n}`;
        return `    <item>
      <title>${esc(`[${digest.date}] ${it.title}`)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${rfc822(digest.date)}</pubDate>
      <description>${esc(it.summary)}</description>
      <source url="${esc(it.sourceUrl)}">${esc(it.sourceName)}</source>
    </item>`;
      }),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Tech Ledger — AI 行业日报</title>
    <link>${SITE}/news</link>
    <atom:link href="${SITE}/feed/digest.xml" rel="self" type="application/rss+xml" />
    <description>每日 AI 行业资讯日报：大模型、AI 芯片、Agent、应用落地、行业政策与投融资动态，每条附原始来源链接。</description>
    <language>zh-CN</language>
    <pubDate>${now}</pubDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
