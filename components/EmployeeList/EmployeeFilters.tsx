'use client';

import { useState } from 'react';

export default function EmployeeFilters() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  return (
    <div className="space-y-3">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on-vacation">On Vacation</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {/* Position Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Positions</option>
          <option value="foreman">Foreman</option>
          <option value="mij">MIJ</option>
          <option value="apprentice">Apprentice</option>
          <option value="journeyman">Journeyman</option>
        </select>
      </div>
    </div>
  );
}

