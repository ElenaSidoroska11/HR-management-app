'use client';

import type { EmployeePosition } from '@/types/employee';

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
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="On Vacation">On Vacation</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>

      {/* Position Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <select
          value={positionFilter}
          onChange={(e) => onPositionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Positions</option>
          {ALL_POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
