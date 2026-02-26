'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Employee } from '@/types/employee';
import { useProjects } from '@/lib/hooks/useProjects';
import {
  createAssignment,
  getAssignmentsByEmployee,
  removeAssignment,
  updateEmployee,
  createVacation,
} from '@/lib/firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeActionMenuProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function EmployeeActionMenu({
  employee,
  isOpen,
  onClose,
  position,
}: EmployeeActionMenuProps) {
  const { projects } = useProjects();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const currentProject = employee.currentProjectId
    ? projects.find((p) => p.id === employee.currentProjectId)
    : null;
  const availableProjectsForTransfer = projects.filter(
    (p) => p.id !== employee.currentProjectId
  );
  const availableProjectsForAssignment = projects.filter(
    (p) => p.id !== employee.currentProjectId
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen && !showAssignModal && !showTransferModal && !showVacationModal && !showNoteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, showAssignModal, showTransferModal, showVacationModal, showNoteModal]);

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
        alert('Employee is already assigned to this project!');
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
      console.error('Error assigning employee:', error);
      alert('Failed to assign employee to project');
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
      console.error('Error transferring employee:', error);
      alert('Failed to transfer employee');
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
        createdBy: 'hr-manager', // TODO: Get from auth
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
      console.error('Error scheduling vacation:', error);
      alert('Failed to schedule vacation');
    }
  };

  const handleRemoveFromProject = async () => {
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

      onClose();
    } catch (error) {
      console.error('Error removing from project:', error);
      alert('Failed to remove employee from project');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      const currentNotes = employee.notes || [];
      const hasExistingNotes = currentNotes.length > 0;
      
      if (hasExistingNotes) {
        // Replace all notes with the edited note
        await updateEmployee(employee.id, {
          notes: [noteText],
        } as any);
      } else {
        // Add new note
        await updateEmployee(employee.id, {
          notes: [...currentNotes, noteText],
        } as any);
      }

      setShowNoteModal(false);
      setNoteText('');
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleOpenNoteModal = () => {
    // Pre-populate with existing notes if they exist
    const currentNotes = employee.notes || [];
    if (currentNotes.length > 0) {
      // Show all notes, separated by newlines, or just the last one
      setNoteText(currentNotes.join('\n'));
    } else {
      setNoteText('');
    }
    setShowNoteModal(true);
    onClose();
  };

  const menuContent = isOpen ? (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-9999 w-48 py-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
        <button
          onClick={() => {
            setShowAssignModal(true);
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
        >
          Assign to Project
        </button>
        {employee.currentProjectId && (
          <button
            onClick={() => {
              setShowTransferModal(true);
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
          >
            Transfer
          </button>
        )}
        {employee.status !== 'On Vacation' && (
          <button
            onClick={() => {
              setShowVacationModal(true);
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
          >
            Schedule Vacation
          </button>
        )}
        <button
          onClick={handleRemoveFromProject}
          className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm"
        >
          Remove from Project
        </button>
        <button
          onClick={handleOpenNoteModal}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
        >
          {employee.notes && employee.notes.length > 0 ? 'Edit Note' : 'Add Note'}
        </button>
    </div>
  ) : null;

  return (
    <>
      {/* Menu - Rendered via Portal to escape stacking contexts */}
      {typeof window !== 'undefined' && menuContent && createPortal(menuContent, document.body)}

      {/* Assign to Project Dialog */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Assign to Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableProjectsForAssignment.map((project) => (
                  <SelectItem key={project.id} value={project.id} className="text-gray-900">
                    {project.projectId} {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedProjectId('');
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignToProject}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Assign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Transfer Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {currentProject && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Current Project
                </label>
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {currentProject.projectId} {currentProject.name}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Transfer to Project
              </label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableProjectsForTransfer.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="text-gray-900">
                      {project.projectId} {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowTransferModal(false);
                setSelectedProjectId('');
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Transfer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vacation Dialog */}
      <Dialog open={showVacationModal} onOpenChange={setShowVacationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Schedule Vacation</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Start Date
              </label>
              <input
                type="date"
                value={vacationStartDate}
                onChange={(e) => setVacationStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                End Date
              </label>
              <input
                type="date"
                value={vacationEndDate}
                onChange={(e) => setVacationEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowVacationModal(false);
                setVacationStartDate('');
                setVacationEndDate('');
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleVacation}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Schedule
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Note Dialog */}
      <Dialog open={showNoteModal} onOpenChange={(open) => {
        setShowNoteModal(open);
        if (!open) {
          setNoteText('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">
              {employee.notes && employee.notes.length > 0 ? 'Edit Note' : 'Add Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-black bg-white placeholder:text-gray-400"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowNoteModal(false);
                setNoteText('');
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {employee.notes && employee.notes.length > 0 ? 'Save Note' : 'Add Note'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
