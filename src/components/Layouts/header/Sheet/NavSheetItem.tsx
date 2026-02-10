"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../ui/sheet";
import { ReactNode } from "react";

interface NavSheetItemProps {
  icon: ReactNode;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}

// NavSheetItem.tsx

export default function NavSheetItem({
  icon,
  label,
  title,
  description,
  children,
}: NavSheetItemProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* We keep the trigger simple */}
        <div className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-[9px] transition-colors hover:bg-gray-2 dark:hover:bg-dark-3">
          <span className="text-gray-500">{icon}</span>
          <span className="font-medium text-[#4B5563] dark:text-dark-6">
            {label}
          </span>
        </div>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="bg-white sm:max-w-[450px]"
        // THIS IS THE FIX: Stop events from reaching the Dropdown
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
