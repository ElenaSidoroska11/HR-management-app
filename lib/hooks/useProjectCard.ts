'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useProjectAssignments } from './useAssignments';
import { useProjects } from './useProjects';
import { isDuplicateDisplayName } from '@/lib/utils';
import {
  removeAssignment,
  getAssignmentsByEmployee,
  updateEmployee,
  getEmployee,
  updateProject,
  deleteProject,
} from '@/lib/firebase/firestore';
import { toast } from 'sonner';
import type { Project } from '@/types/project';
import { useDndLock } from '@/lib/context/dnd-lock';

interface UseProjectCardProps {
  project: Project;
}

export function useProjectCard({ project }: UseProjectCardProps) {
  const { isLocked: isDndLocked } = useDndLock();
  const { projects } = useProjects();
  const { employees, loading } = useProjectAssignments(project.id);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<{
    id: string;
    name: string;
    assignmentId: string;
  } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(project.name);
  const [editedProjectId, setEditedProjectId] = useState(project.projectId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: project.id,
    disabled: isDndLocked,
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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateRemainingVacationDays = (employee: any): number => {
    const vacationDaysPerYear = employee.vacationDaysPerYear || 21;

    // If employee has current vacation dates, calculate used days from that
    if (employee.vacationStartDate && employee.vacationEndDate) {
      let startDate: Date;
      let endDate: Date;

      if (employee.vacationStartDate instanceof Date) {
        startDate = employee.vacationStartDate;
      } else if (
        employee.vacationStartDate &&
        typeof (employee.vacationStartDate as any).toDate === 'function'
      ) {
        startDate = (employee.vacationStartDate as any).toDate();
      } else {
        startDate = new Date(employee.vacationStartDate as any);
      }

      if (employee.vacationEndDate instanceof Date) {
        endDate = employee.vacationEndDate;
      } else if (
        employee.vacationEndDate &&
        typeof (employee.vacationEndDate as any).toDate === 'function'
      ) {
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

    const removedName = employeeToRemove.name;
    try {
      const employee = await getEmployee(employeeToRemove.id);

      // Remove the assignment
      await removeAssignment(employeeToRemove.assignmentId);

      // Check remaining assignments
      const employeeAssignments = await getAssignmentsByEmployee(
        employeeToRemove.id
      );
      const activeAssignments = employeeAssignments.filter(
        (a) => a.status === 'Active'
      );

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
      toast.success(`${removedName} removed from ${project.name}`);
    } catch {
      toast.error('Error', {
        description: 'Failed to remove employee from project. Please try again.',
      });
    }
  };

  const handleEditProject = () => {
    setEditedProjectName(project.name);
    setEditedProjectId(project.projectId);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    const nextName = editedProjectName.trim();
    const nextId = editedProjectId.trim();
    if (!nextName || !nextId) {
      return;
    }

    const nameChanged = nextName !== project.name;
    const idChanged = nextId !== project.projectId;

    if (isDuplicateDisplayName(nextName, projects.map((p) => p.name), project.name)) {
      toast.error('Name already exists', {
        description: `A project named "${nextName}" already exists.`,
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateProject(project.id, {
        name: nextName,
        projectId: nextId,
      });
      setShowEditDialog(false);

      if (nameChanged && idChanged) {
        toast.success('Project updated', {
          description: `Renamed to ${nextId} ${nextName}`,
        });
      } else if (nameChanged) {
        toast.success('Project name updated', {
          description: `New name: ${nextName}`,
        });
      } else if (idChanged) {
        toast.success('Project ID updated', {
          description: `New ID: ${nextId}`,
        });
      } else {
        toast.success('Project updated');
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to update project. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    const deletedLabel = `${project.projectId} ${project.name}`.trim();
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      setShowDeleteDialog(false);
      toast.success(`${deletedLabel} deleted`);
    } catch {
      toast.error('Error', {
        description: 'Failed to delete project. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseEditDialog = (open: boolean) => {
    setShowEditDialog(open);
    if (!open) {
      setEditedProjectName(project.name);
      setEditedProjectId(project.projectId);
    }
  };

  const handleOpenDeleteFromEdit = () => {
    setShowEditDialog(false);
    setShowDeleteDialog(true);
  };

  const handleCloseConfirmDialog = (open: boolean) => {
    setShowConfirmDialog(open);
    if (!open) {
      setEmployeeToRemove(null);
    }
  };

  return {
    employees,
    loading,
    setNodeRef,
    isOver,
    showConfirmDialog,
    showEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    editedProjectName,
    setEditedProjectName,
    editedProjectId,
    setEditedProjectId,
    isUpdating,
    isDeleting,
    employeeToRemove,
    formatDate,
    calculateRemainingVacationDays,
    handleRemoveClick,
    handleConfirmRemove,
    handleEditProject,
    handleSaveEdit,
    handleDeleteProject,
    handleCloseEditDialog,
    handleOpenDeleteFromEdit,
    handleCloseConfirmDialog,
  };
}
