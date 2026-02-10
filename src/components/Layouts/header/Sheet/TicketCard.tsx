import {
  Calendar,
  CalendarIcon,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { TicketDetailModal } from "./TicketDetailModal";


export const TicketCard = ({ status }: { status: "upcoming" | "history" }) => {
  const isUpcoming = status === "upcoming";

  // Use ONLY ONE state variable
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="group relative flex w-full flex-row overflow-hidden rounded-xl border-slate-200 bg-white transition-all">
      {/* LEFT SECTION: Main Details */}
      <div className="flex flex-1 flex-col rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isUpcoming
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isUpcoming ? "Confirmed" : "Completed"}
          </span>
          <span className="text-xs font-medium text-slate-400">#TK-88210</span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
          Global Tech Summit 2026
        </h3>

        {/* Date & Location */}
        <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>March 15–17, 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>Singapore Expo, Singapore</span>
          </div>
        </div>
      </div>

      {/* TICKET DIVIDER (The "Stubs") */}
      <div className="relative flex flex-col justify-between py-3">
        {/* Top Notch */}
        <div className="absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border border-slate-200 bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05)]" />

        {/* Dashed Line */}
        <div className="h-full border-l-2 border-dashed border-primary" />

        {/* Bottom Notch */}
        <div className="absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border border-slate-200 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" />
      </div>

      {/* RIGHT SECTION: Action/QR */}
      <div
        className={`flex w-32 flex-col items-center justify-center rounded-xl border p-4 transition-colors ${
          isUpcoming ? "bg-slate-50/50" : "bg-slate-50/20 grayscale"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-1">
          {/* Simulated QR Code */}
          <div className="grid h-full w-full grid-cols-3 gap-0.5 opacity-80">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`${i % 2 === 0 ? "bg-slate-800" : "bg-slate-200"} rounded-sm`}
              />
            ))}
          </div>
        </div>
        <button onClick={handleViewDetails} className="mt-4 flex items-center text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700">
          DETAILS <ChevronRight className="ml-1 h-3 w-3" />
        </button>
      </div>
      {/* Logic to render your Modal/Sheet here */}
      <TicketDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
