import type { RawSignal } from "./types";

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const TAVILY_KEY = process.env.TAVILY_API_KEY;
const EXA_KEY = process.env.EXA_API_KEY;
const TIMEOUT_MS = 8000;
const FIRECRAWL_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

async function fetchGitHubTrending(): Promise<RawSignal[]> {
  if (!FIRECRAWL_KEY) { console.warn("[sources] FIRECRAWL_API_KEY not set"); return []; }
  const res = await fetchWithTimeout("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://github.com/trending?since=daily",
      formats: ["markdown"],
    }),
  }, FIRECRAWL_TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Firecrawl failed:", res.status); return []; }
  const data = await res.json();
  const markdown: string = data?.data?.markdown ?? "";
  return parseTrendingMarkdown(markdown);
}

function parseTrendingMarkdown(md: string): RawSignal[] {
  const repos: RawSignal[] = [];
  // Format:
  // ## [owner / **repo**](url)
  // description line
  // Language[stars](url) [forks](url)
  // ...
  // X,XXX stars today
  const lines = md.split("\n");
  for (let i = 0; i < lines.length && repos.length < 10; i++) {
    const headingMatch = lines[i].match(/^##\s+\[(.+?)\s*\/\s*\*?\*?(.+?)\*?\*?\]\(([^)]+)\)/);
    if (!headingMatch) continue;
    const owner = headingMatch[1].trim();
    const name = headingMatch[2].replace(/\*/g, "").replace(/\\ /g, "").replace(/\s+/g, " ").trim();
    const url = headingMatch[3];
    // Find description: first non-empty, non-link line after heading
    let summary: string | undefined;
    let langIdx = i + 1;
    for (let k = i + 1; k < Math.min(i + 8, lines.length); k++) {
      const line = lines[k].trim();
      if (!line || line.startsWith("[") || line.startsWith("![")) { langIdx = k + 1; continue; }
      if (line.match(/^[A-Za-z+#.]+[\s\[]/)) break;
      if (!summary) { summary = line; }
      langIdx = k + 1;
    }
    // Find language: first line matching "LangName[number](url)"
    let language = "Unknown";
    let stars = 0;
    for (let k = langIdx; k < Math.min(i + 12, lines.length); k++) {
      const line = lines[k].trim();
      const langMatch = line.match(/^([A-Za-z+#.\s-]+?)\s*\[[\d,]+\]\(/);
      if (langMatch) {
        language = langMatch[1].trim();
        langIdx = k + 1;
        break;
      }
    }
    // Find stars today
    for (let k = langIdx; k < Math.min(i + 15, lines.length); k++) {
      const starMatch = lines[k].match(/^([\d,]+)\s+stars?\s+today/);
      if (starMatch) {
        stars = parseInt(starMatch[1].replace(/,/g, ""), 10) || 0;
        break;
      }
    }
    repos.push({
      title: `${owner}/${name}`,
      url: url || `https://github.com/${owner}/${name}`,
      source: "github" as const,
      score: stars,
      summary,
      category: language || "Unknown",
      timestamp: new Date().toISOString(),
    });
    // i advances naturally via for loop — no extra skip needed
  }
  return repos;
}

function parseStars(s: string | undefined): number {
  if (!s) return 0;
  return parseInt(s.replace(/,/g, "").replace(" stars today", "").trim(), 10) || 0;
}

async function fetchHackerNews(): Promise<RawSignal[]> {
  if (!TAVILY_KEY) { console.warn("[sources] TAVILY_API_KEY not set"); return []; }
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query: "site:news.ycombinator.com trending technology today",
      search_depth: "advanced",
      max_results: 10,
      include_answer: false,
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Tavily HN failed:", res.status); return []; }
  const data = await res.json();
  return (data?.results ?? []).map((r: any) => ({
    title: r.title ?? "Untitled",
    url: r.url ?? "",
    source: "hackernews" as const,
    score: r.score ?? 0,
    summary: r.content?.slice(0, 300) ?? null,
    category: inferCategory(r.title ?? ""),
    timestamp: new Date().toISOString(),
  }));
}

async function fetchArxiv(): Promise<RawSignal[]> {
  if (!EXA_KEY) { console.warn("[sources] EXA_API_KEY not set"); return []; }
  const res = await fetchWithTimeout("https://api.exa.ai/search", {
    method: "POST",
    headers: { "x-api-key": EXA_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "latest AI machine learning paper cs.AI cs.CL cs.LG",
      type: "auto",
      numResults: 10,
      contents: { text: { maxCharacters: 200 } },
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Exa failed:", res.status); return []; }
  const data = await res.json();
  return (data?.results ?? []).map((r: any) => ({
    title: r.title ?? "Untitled",
    url: r.url ?? "",
    source: "arxiv" as const,
    score: r.score ?? 0,
    summary: r.text?.slice(0, 300) ?? null,
    category: "AI Research",
    timestamp: new Date(r.publishedDate ?? Date.now()).toISOString(),
  }));
}

async function fetchBlogs(): Promise<RawSignal[]> {
  if (!TAVILY_KEY) { console.warn("[sources] TAVILY_API_KEY not set, skipping blogs"); return []; }
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query: "latest technology engineering blog post software development",
      search_depth: "advanced",
      max_results: 8,
      include_answer: false,
      include_domains: [
        "engineering.fb.com",
        "blog.rust-lang.org",
        "github.blog",
        "stackoverflow.blog",
        "netflixtechblog.com",
        "blog.cloudflare.com",
        "engineering.linkedin.com",
        "slack.engineering",
        "stripe.com/blog/engineering",
      ],
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Tavily blogs failed:", res.status); return []; }
  const data = await res.json();
  return (data?.results ?? []).map((r: any) => ({
    title: r.title ?? "Untitled",
    url: r.url ?? "",
    source: "blog" as const,
    score: r.score ?? 0,
    summary: r.content?.slice(0, 300) ?? null,
    category: "Engineering",
    timestamp: new Date().toISOString(),
  }));
}

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ai") || t.includes("llm") || t.includes("gpt")) return "AI/ML";
  if (t.includes("rust") || t.includes("go") || t.includes("python")) return "Languages";
  if (t.includes("react") || t.includes("js") || t.includes("css")) return "Web Dev";
  if (t.includes("security") || t.includes("vuln")) return "Security";
  if (t.includes("open source") || t.includes("oss")) return "Open Source";
  return "Tech";
}

export async function fetchAllSources(): Promise<RawSignal[]> {
  const results = await Promise.allSettled([
    fetchGitHubTrending(), fetchHackerNews(), fetchArxiv(), fetchBlogs(),
  ]);
  const all: RawSignal[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);
  return all;
}

export async function getSourceStatuses() {
  const sources = [
    { name: "GitHub Trending", fetcher: fetchGitHubTrending },
    { name: "Hacker News", fetcher: fetchHackerNews },
    { name: "arXiv Papers", fetcher: fetchArxiv },
    { name: "Tech Blogs", fetcher: fetchBlogs },
  ];
  return Promise.all(sources.map(async (s) => {
    const start = Date.now();
    try {
      const data = await s.fetcher();
      return { name: s.name, status: "ok" as const, latency: Date.now() - start, count: data.length };
    } catch (error: any) {
      return {
        name: s.name,
        status: error?.name === "AbortError" ? "timeout" as const : "error" as const,
        latency: Date.now() - start,
        count: 0,
      };
    }
  }));
}
