'use client';

import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { NotebookPen, Plane, Pencil } from 'lucide-react';
import type { Employee } from '@/types/employee';
import { useEmployeeAssignments } from '@/lib/hooks/useAssignments';
import { useProjects } from '@/lib/hooks/useProjects';
import EmployeeActionMenu from '@/components/EmployeeMenu/EmployeeActionMenu';
import { getPositionBgColor } from '@/lib/utils';

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onEdit }: EmployeeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { assignments } = useEmployeeAssignments(employee.id);
  const { projects } = useProjects();
  
  const calculateRemainingVacationDays = useMemo(() => {
    const vacationDaysPerYear = employee.vacationDaysPerYear || 21;
    
    if (employee.vacationStartDate && employee.vacationEndDate) {
      let startDate: Date;
      let endDate: Date;
      
      if (employee.vacationStartDate instanceof Date) {
        startDate = employee.vacationStartDate;
      } else if (employee.vacationStartDate && typeof (employee.vacationStartDate as any).toDate === 'function') {
        startDate = (employee.vacationStartDate as any).toDate();
      } else {
        startDate = new Date(employee.vacationStartDate as any);
      }
      
      if (employee.vacationEndDate instanceof Date) {
        endDate = employee.vacationEndDate;
      } else if (employee.vacationEndDate && typeof (employee.vacationEndDate as any).toDate === 'function') {
        endDate = (employee.vacationEndDate as any).toDate();
      } else {
        endDate = new Date(employee.vacationEndDate as any);
      }
      
      const timeDiff = endDate.getTime() - startDate.getTime();
      const usedDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      return vacationDaysPerYear - usedDays;
    }
    
    return vacationDaysPerYear;
  }, [employee.vacationDaysPerYear, employee.vacationStartDate, employee.vacationEndDate]);
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

  const formatDate = (date: Date | any): string => {
    if (!date) return '';
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (date && typeof date.toDate === 'function') {
      // Firestore Timestamp
      d = date.toDate();
    } else {
      d = new Date(date);
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      className={`p-3 border border-gray-200 rounded-lg transition-colors cursor-grab active:cursor-grabbing relative ${
        isDragging ? 'opacity-30' : 'opacity-100'
      } ${getPositionBgColor(employee.position)} hover:opacity-80`}
      draggable={false} 
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{employee.name}</h3>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(employee);
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 transition-colors"
                title="Edit employee name"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-sm text-gray-500">
              ({calculateRemainingVacationDays})
            </span>
          </div>
          {employee.status === 'On Vacation' && employee.vacationStartDate && employee.vacationEndDate && (
            <div className="flex items-center gap-1.5 mt-1">
              <Plane className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">
                {formatDate(employee.vacationStartDate)} - {formatDate(employee.vacationEndDate)}
              </span>
            </div>
          )}
          {assignments.length > 0 ? (
            <div className="mt-1">
              <p className="text-sm text-gray-600">
                Assigned to {assignments.length === 1 ? 'Project' : 'Projects'}:
              </p>
              <div className="mt-0.5 space-y-0.5">
                {assignments.map((assignment) => {
                  const project = projects.find((p) => p.id === assignment.projectId);
                  return (
                    <p key={assignment.id} className="text-xs text-gray-600">
                      • {project ? `${project.projectId} ${project.name}` : assignment.projectId}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-1">Unassigned</p>
          )}
          {employee.notes && employee.notes.length > 0 && (
            <div className="mt-2 space-y-1">
              {employee.notes.map((note, index) => (
                <p key={index} className="text-xs text-gray-500 italic flex">
                   <NotebookPen className="w-3.5 h-3.5 text-orange-600" /> {note}
                </p>
              ))}
            </div>
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
