"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FilterDateProps = {
  date?: string; // stored as YYYY-MM-DD
  onChange: (date?: string) => void;
};

export default function FilterDate({ date, onChange }: FilterDateProps) {
  const [startDate, setStartDate] = useState<Date | null>(
    date ? new Date(date) : null
  );

  const handleChange = (date: Date | null) => {
    setStartDate(date);
    // Always send ISO format YYYY-MM-DD for filtering
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      onChange(`${yyyy}-${mm}-${dd}`);
    } else {
      onChange(undefined);
    }
  };

  // Display DD-MM-YYYY in the input
  const displayDate = startDate
    ? `${String(startDate.getDate()).padStart(2, "0")}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-${startDate.getFullYear()}`
    : "Filter Date";

  return (
    <div className="inline-block relative">
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        calendarClassName="rounded-lg border p-2 shadow-lg"
        placeholderText="Filter Date"
        renderCustomHeader={({
          monthDate,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="px-2 py-1 hover:bg-gray-100 rounded"
            >
              {"<"}
            </button>
            <span>
              {monthDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="px-2 py-1 hover:bg-gray-100 rounded"
            >
              {">"}
            </button>
            <button
              onClick={() => handleChange(null)}
              className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
            >
              Clear
            </button>
          </div>
        )}
        customInput={
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span>{displayDate}</span>
          </button>
        }
      />
    </div>
  );
}
