// Startup validation — runs once at process start
export function validateConfig() {
  const issues: string[] = [];

  if (!process.env.REFRESH_TOKEN || process.env.REFRESH_TOKEN === "change-me-to-random-string" || process.env.REFRESH_TOKEN === "REPLACE_WITH_YOUR_REFRESH_TOKEN") {
    console.warn("[startup] REFRESH_TOKEN is using placeholder value. Set a real secret for production.");
  }
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "sk-xxx") {
    console.log("[startup] DEEPSEEK_API_KEY not set — AI summaries disabled.");
  }
  if (!process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY === "fc-xxx") {
    console.log("[startup] FIRECRAWL_API_KEY not set — GitHub Trending disabled.");
  }

  return issues;
}
