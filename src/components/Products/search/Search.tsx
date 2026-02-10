// app/products/search/Search.tsx (Updated)
import React from 'react';
import { Search } from 'lucide-react'; 

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className="size-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        placeholder="Search by name, description, or type"
        value={searchTerm} // Use the prop value
        onChange={(e) => onSearchChange(e.target.value)} // Call the handler
        className="
          block 
          w-full 
          rounded-lg 
          border 
          border-gray-200 
          bg-white 
          py-2.5 
          pl-11 
          pr-4 
          text-sm 
          text-gray-800 
          placeholder-gray-400
          focus:outline-none  
          focus:ring-blue-500 
          focus:border-blue-500
          dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
        "
        aria-label="Search by name, description, or type"
      />
    </div>
  );
}
