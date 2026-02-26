'use client';

import { useState, useMemo } from 'react';
import EmployeeSearch from './EmployeeSearch';
import EmployeeFilters from './EmployeeFilters';
import EmployeeCard from './EmployeeCard';
import { useEmployees } from '@/lib/hooks/useEmployees';


export default function EmployeeList() {
  const { employees, loading, error } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        searchQuery === '' ||
        employee.name.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'Active') {
          matchesStatus = !!employee.currentProjectId;
        } else if (statusFilter === 'On Vacation') {
          matchesStatus = employee.status === 'On Vacation';
        } else if (statusFilter === 'Unassigned') {
          matchesStatus = !employee.currentProjectId;
        } else {
          matchesStatus = employee.status === statusFilter;
        }
      }

      const matchesPosition =
        positionFilter === 'all' || employee.position === positionFilter;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [employees, searchQuery, statusFilter, positionFilter]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <EmployeeSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <EmployeeFilters
          statusFilter={statusFilter}
          positionFilter={positionFilter}
          onStatusChange={setStatusFilter}
          onPositionChange={setPositionFilter}
        />
      </div>

      {/* Employee List */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        style={{ 
          touchAction: 'pan-y', // Only allow vertical scrolling
          overscrollBehavior: 'contain', // Prevent scroll chaining
        }}
      >
        {filteredEmployees.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No employees found</p>
            <p className="text-sm mt-2">
              {employees.length === 0
                ? 'Add employees in Firebase to see them here'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
