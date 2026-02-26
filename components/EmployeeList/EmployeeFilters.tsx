'use client';

import type { EmployeePosition } from '@/types/employee';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeFiltersProps {
  statusFilter: string;
  positionFilter: string;
  onStatusChange: (status: string) => void;
  onPositionChange: (position: string) => void;
}

const ALL_POSITIONS: EmployeePosition[] = ['Manager', 'Foreman', 'Journeyman', 'Apprentice'];

export default function EmployeeFilters({
  statusFilter,
  positionFilter,
  onStatusChange,
  onPositionChange,
}: EmployeeFiltersProps) {

  return (
    <div className="space-y-3">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all" className="text-gray-900">All Status</SelectItem>
            <SelectItem value="Active" className="text-gray-900">Active</SelectItem>
            <SelectItem value="On Vacation" className="text-gray-900">On Vacation</SelectItem>
            <SelectItem value="Unassigned" className="text-gray-900">Unassigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Position Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <Select value={positionFilter} onValueChange={onPositionChange}>
          <SelectTrigger className="w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300">
            <SelectValue placeholder="All Positions" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all" className="text-gray-900">All Positions</SelectItem>
            {ALL_POSITIONS.map((position) => (
              <SelectItem key={position} value={position} className="text-gray-900">
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
