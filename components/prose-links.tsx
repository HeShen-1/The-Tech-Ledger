import Link from "next/link";
import type { ReactNode } from "react";

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

/**
 * 渲染纯文本段落，把其中 [标题](URL) 形式的 markdown 链接转为可点击链接：
 * 站内路径（/digest/...）走 next/link，外链新窗口打开。
 */
export function ProseLinks({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  LINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, label, href] = m;
    const cls =
      "font-medium text-[#CC0000] underline decoration-[#CC0000]/40 underline-offset-4 transition-colors hover:decoration-[#CC0000]";
    nodes.push(
      href.startsWith("/") ? (
        <Link key={key++} href={href} className={cls}>
          {label}
        </Link>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
        </a>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
