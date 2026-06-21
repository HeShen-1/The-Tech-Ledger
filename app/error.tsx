"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-28 text-center">
      <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
        Transmission Error
      </p>
      <h2 className="mb-4 font-serif text-4xl font-black text-[#111111]">Signal Interrupted</h2>
      <p className="mb-8 max-w-md font-body text-sm leading-relaxed text-[#525252]">
        We couldn&apos;t fetch the latest signals. This might be a temporary outage with our data sources.
      </p>
      <button
        onClick={reset}
        className="border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        Try Again
      </button>
    </div>
  );
}
