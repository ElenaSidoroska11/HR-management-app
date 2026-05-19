'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useProjects } from './useProjects';
import { useEmployeeAssignments } from './useAssignments';
import {
  assignEmployeeToProject,
  getAssignmentsByEmployee,
  removeAssignment,
  updateEmployee,
  createVacation,
  getAssignmentsByProject,
  updateProject,
} from '@/lib/firebase/firestore';
import { toast } from 'sonner';
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
  const { assignments } = useEmployeeAssignments(employee.id);
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

  const activeAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'Active'),
    [assignments]
  );

  const assignedProjectIds = useMemo(
    () => new Set(activeAssignments.map((assignment) => assignment.projectId)),
    [activeAssignments]
  );

  const hasActiveAssignments = activeAssignments.length > 0;

  const currentProject = useMemo(() => {
    const assignment = activeAssignments[0];
    if (!assignment) return null;
    return projects.find((project) => project.id === assignment.projectId) ?? null;
  }, [activeAssignments, projects]);

  const availableProjectsForTransfer = useMemo(() => {
    return projects.filter((project) => !assignedProjectIds.has(project.id));
  }, [projects, assignedProjectIds]);

  const availableProjectsForAssignment = useMemo(() => {
    return projects.filter((project) => !assignedProjectIds.has(project.id));
  }, [projects, assignedProjectIds]);

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

    const targetProject = projects.find((p) => p.id === selectedProjectId);
    const projectName = targetProject?.name ?? 'project';

    try {
      const result = await assignEmployeeToProject(employee.id, selectedProjectId);
      if (result === 'already_assigned') {
        toast.warning(`${employee.name} is already assigned to ${projectName}`);
        return;
      }

      setShowAssignModal(false);
      setSelectedProjectId('');
      onClose();
      toast.success(`${employee.name} assigned to ${projectName}`);
    } catch {
      toast.error('Error', {
        description: 'Failed to assign employee to project. Please try again.',
      });
    }
  };

  const handleTransfer = async () => {
    if (!selectedProjectId) return;

    const targetProject = projects.find((p) => p.id === selectedProjectId);
    const projectName = targetProject?.name ?? 'new project';

    try {
      const result = await assignEmployeeToProject(employee.id, selectedProjectId);
      if (result === 'already_assigned') {
        toast.warning(`${employee.name} is already assigned to ${projectName}`);
        return;
      }

      setShowTransferModal(false);
      setSelectedProjectId('');
      onClose();
      toast.success(`${employee.name} transferred to ${projectName}`);
    } catch {
      toast.error('Error', {
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
      toast.success(`Vacation scheduled for ${employee.name}`);
    } catch {
      toast.error('Error', {
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

      const affectedProjectIds = new Set(
        activeAssignments.map((assignment) => assignment.projectId)
      );

      for (const assignment of activeAssignments) {
        await removeAssignment(assignment.id);
      }

      await updateEmployee(employee.id, {
        currentProjectId: undefined,
        status: 'Unassigned',
      } as any);

      for (const projectId of affectedProjectIds) {
        const projectAssignments = await getAssignmentsByProject(projectId);
        await updateProject(projectId, {
          totalEmployees: projectAssignments.length,
        } as any);
      }

      setShowRemoveConfirmDialog(false);
      toast.success(`${employee.name} removed from project`);
    } catch {
      toast.error('Error', {
        description: 'Failed to remove employee from project. Please try again.',
      });
    }
  };

  const handleAddNote = async () => {
    const trimmedNote = noteText.trim();
    const hasExistingNotes = (employee.notes || []).length > 0;

    if (!trimmedNote) {
      if (!hasExistingNotes) return;

      try {
        await updateEmployee(employee.id, {
          notes: undefined,
        } as Partial<Employee>);

        setShowNoteModal(false);
        setNoteText('');
        onClose();
        toast.success(`Note removed for ${employee.name}`);
      } catch {
        toast.error('Error', {
          description: 'Failed to remove note. Please try again.',
        });
      }
      return;
    }

    try {
      await updateEmployee(employee.id, {
        notes: [trimmedNote],
      } as Partial<Employee>);

      setShowNoteModal(false);
      setNoteText('');
      onClose();
      toast.success(`Note saved for ${employee.name}`);
    } catch {
      toast.error('Error', {
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
    hasActiveAssignments,
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
