import type { Metadata, Viewport } from "next";
import { ScrollProgress } from "@/components/scroll-progress";
import { RefreshToast } from "@/components/refresh-toast";
import { validateConfig } from "@/lib/startup";
import "./globals.css";

validateConfig();

export const metadata: Metadata = {
  title: "The Tech Ledger — Real-Time Tech Intelligence",
  description: "Real-time technology pulse from GitHub, Hacker News, and the open web. No noise. Just signal.",
  openGraph: {
    title: "The Tech Ledger — Real-Time Tech Intelligence",
    description: "Real-time technology pulse from GitHub, Hacker News, and the open web.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Tech Ledger",
    description: "Real-time tech intelligence. No noise. Just signal.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="min-h-screen antialiased"
        style={{
          fontFamily: "var(--font-sans)",
          backgroundColor: "#F9F9F7",
          color: "#111111",
          backgroundImage: `url('/beige-paper.png'), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23111111' fill-opacity='0.04' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat, repeat",
        }}
      >
        <ScrollProgress />
        <RefreshToast />
        {children}
      </body>
    </html>
  );
}
