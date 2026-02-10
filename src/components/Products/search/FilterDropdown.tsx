"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import { useGetMyProductsQuery } from "@/redux/service/products";

// Define a generic Option type
interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  title: string; // The text to display (e.g., "Currency", "Status")
  options: FilterOption[]; // The list of options to display
  selectedValues: string[]; // Controlled state for selected values
  onChange: (values: string[]) => void; // Function to update state in parent
}

export default function FilterDropdown({
  title,
  options,
  selectedValues,
  onChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: products = [], isLoading } = useGetMyProductsQuery();

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const clearFilters = () => {
    onChange([]);
    setSearchTerm("");
  };

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, options]);

  

  return (
    <div className="relative  inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex  items-center  justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <div className="flex items-center   gap-2">
          <MdOutlineAddCircleOutline className="size-5 text-gray-400" />
          <span className=" w-full ">{title}</span>
        </div>

        {/* Selected badges */}
        {selectedValues.length > 0 && (
          <div className="ml-1 flex w-full h-auto flex-wrap gap-1 border-l border-gray-200 pl-2">
            {selectedValues.map((val) => (
              <span
                key={val}
                className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
              >
                {options.find((opt) => opt.value === val)?.label || val}
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(val);
                  }}
                  className="ml-1 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X className="size-3" />
                </span>
              </span>
            ))}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Filter ${title}...`}
                className="border-1 w-full rounded-lg py-1.5 pl-9 pr-4 text-sm outline-none ring-0 ring-gray-300 focus:ring-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 space-y-1 overflow-y-auto border-t border-dashed p-2 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "flex w-full items-center px-4 py-2 text-sm transition-colors",
                      isSelected
                        ? "rounded-lg bg-blue-50 font-semibold text-blue-600"
                        : "rounded-lg text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <div className="mr-3 flex size-4 items-center justify-center rounded border border-gray-300 bg-white">
                      {isSelected && (
                        <Check
                          className="size-3 text-blue-600"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-2 text-center text-xs text-gray-500">
                No results found
              </p>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 p-1">
            <button
              onClick={clearFilters}
              className="w-full rounded-md py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
