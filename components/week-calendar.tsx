"use client";

import Link from "next/link";

export function WeekCalendar({
  week,
  dates,
}: {
  week: string;
  dates: string[];
}) {
  // Parse week string like "2026-W26" to get the starting date
  const [year, w] = week.split("-W");
  const weekNum = parseInt(w);
  // Simple week start calculation
  const jan1 = new Date(parseInt(year), 0, 1);
  const daysOffset = (weekNum - 1) * 7;
  const start = new Date(jan1.getTime() + daysOffset * 86400000);
  // Adjust to Monday
  const day = start.getDay();
  const monday = new Date(
    start.getTime() - (day === 0 ? 6 : day - 1) * 86400000,
  );

  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * 86400000);
    weekDays.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-7 border border-[#111111]">
      {weekDays.map((d, i) => {
        const hasReport = dates.includes(d);
        const isToday = d === todayStr;
        const dayNum = parseInt(d.split("-")[2]);
        return (
          <Link
            key={d}
            href={`/reports/${d}`}
            className={`border-r border-[#E5E5E0] p-3 transition-colors hover:bg-[#F5F5F5] ${i === 6 ? "border-r-0" : ""} ${isToday ? "bg-[#F5F5F5]" : ""}`}
          >
            <span className="block text-center font-mono text-[10px] font-bold uppercase text-[#737373]">
              {dayNames[i]}
            </span>
            <span
              className={`mt-1 block text-center font-mono text-sm font-bold ${isToday ? "text-[#CC0000]" : hasReport ? "text-[#111111]" : "text-[#737373]"}`}
            >
              {dayNum}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
