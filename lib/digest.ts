import fs from "node:fs";
import path from "node:path";

export interface DigestItem {
  /** 期内序号，从 1 开始 */
  n: number;
  title: string;
  /** 原文发布日期 YYYY-MM-DD */
  date: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
}

export interface Digest {
  /** 期数（刊发）日期 YYYY-MM-DD */
  date: string;
  items: DigestItem[];
}

const DIGEST_DIR = path.join(process.cwd(), "content", "digest");

/** 全部期数日期，新→旧 */
export function getDigestDates(): string[] {
  try {
    return fs
      .readdirSync(DIGEST_DIR)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => f.replace(/\.json$/, ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export function getDigest(date: string): Digest | null {
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(DIGEST_DIR, `${date}.json`), "utf8"),
    ) as Digest;
    if (!raw || !Array.isArray(raw.items) || raw.items.length === 0) return null;
    return raw;
  } catch {
    return null;
  }
}

export function getAllDigests(): Digest[] {
  return getDigestDates()
    .map((d) => getDigest(d))
    .filter((d): d is Digest => d !== null);
}

export function getDigestItem(date: string, n: number): DigestItem | null {
  const digest = getDigest(date);
  if (!digest) return null;
  return digest.items.find((it) => it.n === n) ?? null;
}

export function digestItemHref(date: string, n: number): string {
  return `/digest/${date}/${n}`;
}
