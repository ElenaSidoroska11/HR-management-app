'use client';

import EmployeeSearch from './EmployeeSearch';
import EmployeeFilters from './EmployeeFilters';
import EmployeeCard from './EmployeeCard';
import type { Employee } from '@/types/employee';

export default function EmployeeList() {
  // TODO: Will connect to Firebase later
  const employees: Employee[] = [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <EmployeeSearch />
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <EmployeeFilters />
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-4">
        {employees.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No employees found</p>
            <p className="text-sm mt-2">Employees will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

