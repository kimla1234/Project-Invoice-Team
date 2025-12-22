"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownClose } from "@/components/ui/dropdown"; 

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  availableRowsPerPage: number[];
}

export function PaginationControls({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  availableRowsPerPage = [8, 10, 20, 50], // Added default options here just in case
}: PaginationProps) {
  // Re-introduce local state to manage this specific dropdown
  const [isRowsPerPageOpen, setIsRowsPerPageOpen] = useState(false);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  return (
    <div className="flex items-center justify-end gap-6  dark:border-dark-3">

      {/* Rows per page selector (Now using your custom Dropdown correctly) */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 dark:text-gray-300">Rows per page</label>
        
        {/* --- Start of Dropdown implementation --- */}
        {/* Pass the required isOpen and setIsOpen props */}
        <Dropdown 
          isOpen={isRowsPerPageOpen} 
          setIsOpen={setIsRowsPerPageOpen}
        >
          <DropdownTrigger className="flex items-center justify-between px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-2 dark:border-dark-3 dark:text-white">
            {rowsPerPage}
            <ChevronDown className={cn("size-4 ml-2 transition-transform", isRowsPerPageOpen ? 'rotate-180' : '')} />
          </DropdownTrigger>

          <DropdownContent align="end" className="bottom-full right-0 mt-0 mb-1 w-20 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 z-10 dark:bg-dark-2">
            {availableRowsPerPage.map(rows => (
              <DropdownClose key={rows}> 
                {/* When an option is clicked, it closes the dropdown and updates the parent state */}
                <button
                  onClick={() => onRowsPerPageChange(rows)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"
                >
                  {rows}
                </button>
              </DropdownClose>
            ))}
          </DropdownContent>
        </Dropdown>
        {/* --- End of Dropdown implementation --- */}

      </div>

      {/* Page Info */}
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Page {currentPage} of {totalPages || 1}
      </p>

      {/* Navigation Buttons (remain the same) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={!canGoBack}
          className="p-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-3 dark:text-white"
        >
          <ChevronsLeft className="size-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoBack}
          className="p-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-3 dark:text-white"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoForward}
          className="p-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-3 dark:text-white"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoForward}
          className="p-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-3 dark:text-white"
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
