'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Employee } from '@/types/employee';
import EmployeeActionMenu from '@/components/EmployeeMenu/EmployeeActionMenu';

interface EmployeeCardProps {
  employee: Employee;
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: employee.id,
    data: {
      type: 'employee',
      employee,
    },
  });

 
  const style = {
    // transform: CSS.Translate.toString(transform), 
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none', // Prevent touch scrolling during drag
      }}
      {...listeners}
      {...attributes}
      className={`p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing relative ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
      draggable={false} 
    >
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
              x: rect.left - 180, 
              y: rect.top + rect.height,
            });
            setMenuOpen(true);
          }}
          className="text-gray-400 hover:text-gray-600 p-1 relative"
        >
          <span className="text-lg">+</span>
        </button>
      </div>

     
      <EmployeeActionMenu
        employee={employee}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPosition}
      />
    </div>
  );
}
