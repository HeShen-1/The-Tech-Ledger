export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-28">
      {/* Hero skeleton */}
      <div className="mb-16 ml-4 sm:ml-8">
        <div className="mb-6 h-3 w-48 bg-[#E5E5E0]" />
        <div className="mb-6 space-y-3">
          <div className="h-12 w-3/4 bg-[#E5E5E0]" />
          <div className="h-12 w-1/2 bg-[#E5E5E0]" />
        </div>
        <div className="h-4 w-64 bg-[#E5E5E0]" />
      </div>
      {/* Signal skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 border-b border-[#E5E5E0] py-5 pl-2">
          <div className="h-3 w-20 bg-[#E5E5E0]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-[#E5E5E0]" />
            <div className="h-3 w-1/3 bg-[#E5E5E0]" />
          </div>
        </div>
      ))}
    </div>
  );
}
