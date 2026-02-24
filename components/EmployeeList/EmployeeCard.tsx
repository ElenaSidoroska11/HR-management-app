'use client';

import type { Employee } from '@/types/employee';

interface EmployeeCardProps {
  employee: Employee;
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{employee.name}</h3>
            <span className="text-sm text-gray-500">
              ({employee.assignedHours || 0})
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {employee.currentProjectId
              ? `Assigned to Project: ${employee.currentProjectId}`
              : 'Unassigned'}
          </p>
          {employee.status === 'On Vacation' && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              On Vacation
            </p>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <span className="text-lg">+</span>
        </button>
      </div>
    </div>
  );
}

