import React from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Download,
  Share2,
  ChevronLeft,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailModal = ({ isOpen, onClose }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <button
                onClick={onClose}
                className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              >
                <ChevronLeft size={20} />
              </button>
              <h4 className="font-bold text-gray-800">E-Ticket</h4>
              <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                <Download size={20} />
              </button>
            </div>

            {/* QR Section */}
            <div className="flex flex-col items-center px-8 pb-6 pt-4">
              <h3 className="mb-1 text-xl font-bold text-gray-900">
                Scan This QR
              </h3>
              <p className="mb-6 text-[11px] tracking-wide text-gray-400">
                POINT THIS QR TO THE SCANNER
              </p>

              <div className="relative rounded-[2rem] border border-gray-100 bg-gray-50 p-5">
                <div className="relative h-44 w-44 overflow-hidden rounded-xl border bg-white p-2 shadow-sm">
                  {/* Purple QR Top */}
                  <div className="absolute left-0 top-0 flex h-1/2 w-full flex-wrap gap-1 bg-indigo-50 p-2">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-sm ${i % 3 === 0 ? "bg-indigo-600" : "bg-transparent"}`}
                      />
                    ))}
                  </div>
                  {/* Black QR Bottom */}
                  <div className="absolute bottom-0 left-0 flex h-1/2 w-full flex-wrap gap-1 bg-white p-2">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-sm ${i % 2 === 0 ? "bg-black" : "bg-transparent"}`}
                      />
                    ))}
                  </div>
                  {/* Moving Scan Line */}
                  <motion.div
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-0 z-10 h-[2px] w-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                  />
                </div>
              </div>
            </div>

            {/* Divider Notches */}
            <div className="relative flex h-4 items-center">
              <div className="absolute left-[-12px] h-6 w-6 rounded-full bg-black/60" />
              <div className="mx-6 w-full border-t-2 border-dashed border-gray-100" />
              <div className="absolute right-[-12px] h-6 w-6 rounded-full bg-black/60" />
            </div>

            {/* Details Section */}
            {/* Details Section */}
            <div className="px-8 pb-8 pt-6">
              {/* Event Name */}
              <div className="mb-8 text-center">
                <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">
                  Event
                </span>
                <h2 className="mt-3 text-2xl font-black leading-tight text-gray-900">
                  CALUM SCOTT <br />
                  <span className="text-indigo-600">'BRIDGES'</span> ASIA TOUR
                </h2>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                {/* Start Date */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Start Date
                  </p>
                  <p className="flex items-center gap-2 text-sm font-extrabold text-gray-800">
                    <Calendar size={14} className="text-indigo-500" />
                    27 DEC 2022
                  </p>
                </div>

                {/* Booking Date */}
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Booking Date
                  </p>
                  <p className="flex items-center justify-end gap-2 text-sm font-extrabold text-gray-800">
                    <Clock size={14} className="text-indigo-500" />
                    15 DEC 2022
                  </p>
                </div>

                {/* Divider */}
                <div className="col-span-2 border-t border-dashed border-gray-100 pt-4" />

                {/* Location */}
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Location
                  </p>
                  <p className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <MapPin size={15} className="text-red-500" />
                    JIEXPO KEMAYORAN, JAKARTA
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="col-span-2 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      Total Price
                    </p>
                    <p className="text-xl font-black text-indigo-600">
                      $120.00
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-[10px] font-bold uppercase text-green-700">
                      Paid
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
