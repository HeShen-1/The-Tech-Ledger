"use client";

import Link from "next/link";

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  dates: string[];
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ReportCalendar({ year, month, dates }: CalendarProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay();
  const dateSet = new Set(dates);

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <h2 className="mb-4 font-serif text-2xl font-black text-[#111111]">
        {MONTHS[month]} {year}
      </h2>
      <div className="grid grid-cols-7 border border-[#111111]">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="border-b border-r border-[#E5E5E0] bg-[#F5F5F5] p-2 text-center font-mono text-[10px] font-bold uppercase text-[#737373]"
          >
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          if (d === null)
            return (
              <div
                key={`e${i}`}
                className="border-b border-r border-[#E5E5E0] p-3"
              />
            );
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const hasReport = dateSet.has(dateStr);
          return (
            <div
              key={d}
              className={`border-b border-r border-[#E5E5E0] p-2 ${i % 7 === 6 ? "border-r-0" : ""}`}
            >
              {hasReport ? (
                <Link
                  href={`/reports/${dateStr}`}
                  className="flex flex-col items-center transition-colors hover:bg-[#F5F5F5]"
                >
                  <span className="font-mono text-sm font-bold text-[#111111]">
                    {d}
                  </span>
                  <span className="mt-0.5 h-1.5 w-1.5 bg-[#CC0000]" />
                </Link>
              ) : (
                <span className="flex flex-col items-center">
                  <span className="font-mono text-sm text-[#E5E5E0]">
                    {d}
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
