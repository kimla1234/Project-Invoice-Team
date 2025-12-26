"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
}: DropdownSelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {selected ? selected.label : placeholder}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className=" w-[var(--radix-dropdown-menu-trigger-width)] p-2 ">
          {options.map((option) => (
            <DropdownMenuItem
              className="w-full hover:bg-slate-100 hover:rounded-md"
              key={option.value}
              onSelect={() => onChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
