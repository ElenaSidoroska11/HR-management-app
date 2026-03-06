'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useProjects } from './useProjects';
import {
  createAssignment,
  getAssignmentsByEmployee,
  removeAssignment,
  updateEmployee,
  createVacation,
} from '@/lib/firebase/firestore';
import { useToast } from './use-toast';
import type { Employee } from '@/types/employee';

interface UseEmployeeActionMenuProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export function useEmployeeActionMenu({
  employee,
  isOpen,
  onClose,
}: UseEmployeeActionMenuProps) {
  const { projects } = useProjects();
  const { toast } = useToast();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const currentProject = useMemo(() => {
    return employee.currentProjectId
      ? projects.find((p) => p.id === employee.currentProjectId)
      : null;
  }, [employee.currentProjectId, projects]);

  const availableProjectsForTransfer = useMemo(() => {
    return projects.filter((p) => p.id !== employee.currentProjectId);
  }, [projects, employee.currentProjectId]);

  const availableProjectsForAssignment = useMemo(() => {
    return projects.filter((p) => p.id !== employee.currentProjectId);
  }, [projects, employee.currentProjectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (
      isOpen &&
      !showAssignModal &&
      !showTransferModal &&
      !showVacationModal &&
      !showNoteModal &&
      !showRemoveConfirmDialog
    ) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    isOpen,
    onClose,
    showAssignModal,
    showTransferModal,
    showVacationModal,
    showNoteModal,
    showRemoveConfirmDialog,
  ]);

  const handleAssignToProject = async () => {
    if (!selectedProjectId) return;

    try {
      const existingAssignments = await getAssignmentsByEmployee(employee.id);
      const alreadyAssigned = existingAssignments.some(
        (assignment) =>
          assignment.projectId === selectedProjectId &&
          assignment.status === 'Active'
      );

      if (alreadyAssigned) {
        return;
      }

      await createAssignment({
        employeeId: employee.id,
        projectId: selectedProjectId,
        hours: 0,
        status: 'Active',
      } as any);

      await updateEmployee(employee.id, {
        currentProjectId: selectedProjectId,
      } as any);

      setShowAssignModal(false);
      setSelectedProjectId('');
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign employee to project. Please try again.',
      });
    }
  };

  const handleTransfer = async () => {
    if (!selectedProjectId) return;

    try {
      // Remove from current project
      const existingAssignments = await getAssignmentsByEmployee(employee.id);
      const activeAssignments = existingAssignments.filter(
        (a) => a.status === 'Active'
      );

      for (const assignment of activeAssignments) {
        await removeAssignment(assignment.id);
      }

      // Assign to new project
      await createAssignment({
        employeeId: employee.id,
        projectId: selectedProjectId,
        hours: 0,
        status: 'Active',
      } as any);

      await updateEmployee(employee.id, {
        currentProjectId: selectedProjectId,
      } as any);

      setShowTransferModal(false);
      setSelectedProjectId('');
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to transfer employee. Please try again.',
      });
    }
  };

  const handleScheduleVacation = async () => {
    if (!vacationStartDate || !vacationEndDate) return;

    try {
      await createVacation({
        employeeId: employee.id,
        startDate: new Date(vacationStartDate),
        endDate: new Date(vacationEndDate),
        status: 'Scheduled',
        createdBy: 'hr-manager', 
      } as any);

      await updateEmployee(employee.id, {
        status: 'On Vacation',
        vacationStartDate: new Date(vacationStartDate),
        vacationEndDate: new Date(vacationEndDate),
      } as any);

      setShowVacationModal(false);
      setVacationStartDate('');
      setVacationEndDate('');
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to schedule vacation. Please try again.',
      });
    }
  };

  const handleRemoveFromProject = () => {
    setShowRemoveConfirmDialog(true);
    onClose();
  };

  const handleConfirmRemove = async () => {
    try {
      const existingAssignments = await getAssignmentsByEmployee(employee.id);
      const activeAssignments = existingAssignments.filter(
        (a) => a.status === 'Active'
      );

      for (const assignment of activeAssignments) {
        await removeAssignment(assignment.id);
      }

      await updateEmployee(employee.id, {
        currentProjectId: undefined,
        status: 'Unassigned',
      } as any);

      setShowRemoveConfirmDialog(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove employee from project. Please try again.',
      });
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      const currentNotes = employee.notes || [];
      const hasExistingNotes = currentNotes.length > 0;

      if (hasExistingNotes) {
        await updateEmployee(employee.id, {
          notes: [noteText],
        } as any);
      } else {
        await updateEmployee(employee.id, {
          notes: [...currentNotes, noteText],
        } as any);
      }

      setShowNoteModal(false);
      setNoteText('');
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save note. Please try again.',
      });
    }
  };

  const handleOpenNoteModal = () => {
    // Pre-populate with existing notes if they exist
    const currentNotes = employee.notes || [];
    if (currentNotes.length > 0) {
      setNoteText(currentNotes.join('\n'));
    } else {
      setNoteText('');
    }
    setShowNoteModal(true);
    onClose();
  };

  const handleCloseAssignModal = (open: boolean) => {
    setShowAssignModal(open);
    if (!open) {
      setSelectedProjectId('');
    }
  };

  const handleCloseTransferModal = (open: boolean) => {
    setShowTransferModal(open);
    if (!open) {
      setSelectedProjectId('');
    }
  };

  const handleCloseVacationModal = (open: boolean) => {
    setShowVacationModal(open);
    if (!open) {
      setVacationStartDate('');
      setVacationEndDate('');
    }
  };

  const handleCloseNoteModal = (open: boolean) => {
    setShowNoteModal(open);
    if (!open) {
      setNoteText('');
    }
  };

  const handleOpenAssignModal = () => {
    setShowAssignModal(true);
    onClose();
  };

  const handleOpenTransferModal = () => {
    setShowTransferModal(true);
    onClose();
  };

  const handleOpenVacationModal = () => {
    setShowVacationModal(true);
    onClose();
  };

  return {
    menuRef,
    currentProject,
    availableProjectsForTransfer,
    availableProjectsForAssignment,
    showAssignModal,
    showTransferModal,
    showVacationModal,
    showNoteModal,
    showRemoveConfirmDialog,
    setShowRemoveConfirmDialog,
    selectedProjectId,
    setSelectedProjectId,
    vacationStartDate,
    setVacationStartDate,
    vacationEndDate,
    setVacationEndDate,
    noteText,
    setNoteText,
    handleAssignToProject,
    handleTransfer,
    handleScheduleVacation,
    handleRemoveFromProject,
    handleConfirmRemove,
    handleAddNote,
    handleOpenNoteModal,
    handleCloseAssignModal,
    handleCloseTransferModal,
    handleCloseVacationModal,
    handleCloseNoteModal,
    handleOpenAssignModal,
    handleOpenTransferModal,
    handleOpenVacationModal,
  };
}
