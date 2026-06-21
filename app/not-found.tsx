import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-28 text-center">
      <p className="mb-4 font-serif text-8xl font-black leading-none text-[#E5E5E0]">404</p>
      <p className="mb-8 font-serif text-xl italic text-[#737373]">This page does not exist.</p>
      <Link
        href="/"
        className="border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        Return Home
      </Link>
    </div>
  );
}
