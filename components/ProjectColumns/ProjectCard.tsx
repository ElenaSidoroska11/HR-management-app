'use client';

import { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plane } from 'lucide-react';
import type { Project } from '@/types/project';
import { useProjectAssignments } from '@/lib/hooks/useAssignments';
import { removeAssignment, getAssignmentsByEmployee, updateEmployee, getEmployee } from '@/lib/firebase/firestore';
import { getPositionBgColor } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { employees, loading } = useProjectAssignments(project.id);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<{ id: string; name: string; assignmentId: string } | null>(null);
  
  const { setNodeRef, isOver } = useDroppable({
    id: project.id,
    data: {
      type: 'project',
      project,
    },
  });

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

  const calculateRemainingVacationDays = (employee: any): number => {
    const vacationDaysPerYear = employee.vacationDaysPerYear || 21;
    
    // If employee has current vacation dates, calculate used days from that
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
    
    // No current vacation, return full days
    return vacationDaysPerYear;
  };

  const handleRemoveClick = (employee: any) => {
    setEmployeeToRemove({
      id: employee.id,
      name: employee.name,
      assignmentId: employee.assignmentId,
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!employeeToRemove) return;

    try {
      const employee = await getEmployee(employeeToRemove.id);
      
      // Remove the assignment
      await removeAssignment(employeeToRemove.assignmentId);

      // Check remaining assignments
      const employeeAssignments = await getAssignmentsByEmployee(employeeToRemove.id);
      const activeAssignments = employeeAssignments.filter((a) => a.status === 'Active');

      // Update employee's currentProjectId and status
      if (activeAssignments.length === 0) {
        // No active assignments left
        await updateEmployee(employeeToRemove.id, {
          currentProjectId: undefined,
          status: 'Unassigned',
        } as any);
      } else if (employee?.currentProjectId === project.id) {
        // If this project was the currentProjectId, set it to the first remaining assignment
        await updateEmployee(employeeToRemove.id, {
          currentProjectId: activeAssignments[0].projectId,
        } as any);
      }

      setShowConfirmDialog(false);
      setEmployeeToRemove(null);
    } catch (error) {
      console.error('Error removing employee from project:', error);
      alert('Failed to remove employee from project');
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg p-4 border-2 shadow-sm transition-all ${
        isOver
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200'
      }`}
    >
      {/* Project Header */}
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900">
          {project.projectId} {project.name}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Total employees: {project.totalEmployees}
        </p>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-center">
          <p className="text-xs text-blue-700 font-medium">
            Drop employee here
          </p>
        </div>
      )}

      {/* Employees List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-2">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            {isOver ? '' : 'No employees assigned'}
          </p>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className={`flex items-center justify-between p-2 rounded text-sm ${getPositionBgColor(employee.position)}`}
            >
              <div className="flex-1">
                <div className="text-gray-700">
                  {employee.name} ({calculateRemainingVacationDays(employee)})
                </div>
                {employee.status === 'On Vacation' && employee.vacationStartDate && employee.vacationEndDate && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Plane className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-xs text-orange-600 font-medium">
                      {formatDate(employee.vacationStartDate)} - {formatDate(employee.vacationEndDate)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveClick(employee);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="text-lg">−</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Remove Employee from Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to remove <strong>{employeeToRemove?.name}</strong> from project{' '}
              <strong>{project.projectId} {project.name}</strong>?
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowConfirmDialog(false);
                setEmployeeToRemove(null);
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
