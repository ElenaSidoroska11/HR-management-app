'use client';

import { Input } from '@/components/ui/input';
import { UserRoundSearch } from 'lucide-react';

interface EmployeeSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function EmployeeSearch({
  searchQuery,
  onSearchChange,
}: EmployeeSearchProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search employees..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 bg-white text-gray-900 border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:outline-none"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <UserRoundSearch className="h-5 w-5" />
      </div>
    </div>
  );
}
