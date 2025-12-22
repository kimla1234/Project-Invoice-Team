// components/ui/column-toggle-dropdown.tsx
"use client";

import React, { useState } from "react";
import { Settings2, Check } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownClose,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

// Define a type for a column option
interface ColumnOption {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnToggleDropdownProps {
  columns: ColumnOption[];
  onToggle: (id: string) => void;
}

export function ColumnToggleDropdown({ columns, onToggle }: ColumnToggleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      {/* Button Trigger (Matches the image UI) */}
      <DropdownTrigger className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
        <Settings2 className="size-4" />
        <span>View</span>
      </DropdownTrigger>

      {/* Dropdown Content (Matches the image UI) */}
      <DropdownContent
        align="end"
        className="w-48 rounded-lg border border-gray-100 bg-white p-3 shadow-xl dark:border-dark-3 dark:bg-dark-2"
      >
        <h4 className="px-1 pb-2 text-sm font-semibold text-gray-800 dark:text-white">
          Toggle columns
        </h4>
        {columns.map((column) => (
          <DropdownClose key={column.id}>
            <button
              onClick={() => onToggle(column.id)}
              className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-dark-3"
            >
              <span>{column.label}</span>
              {/* Checkmark icon for visibility */}
              <Check className={cn("size-4 text-primary", !column.visible && "invisible")} />
            </button>
          </DropdownClose>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
