'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Employee } from '@/types/employee';
import { useEmployeeActionMenu } from '@/lib/hooks/useEmployeeActionMenu';
import { useDndLockWhileOpen } from '@/lib/context/dnd-lock';
import { getFloatingMenuPosition, type AnchorRect } from '@/lib/utils';
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
import { DatePicker, parseDateValue } from '@/components/ui/date-picker';
import { Button } from '../ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EmployeeActionMenuProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  anchorRect: AnchorRect | null;
}

export default function EmployeeActionMenu({
  employee,
  isOpen,
  onClose,
  anchorRect,
}: EmployeeActionMenuProps) {
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const {
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
  } = useEmployeeActionMenu({ employee, isOpen, onClose });

  useDndLockWhileOpen(isOpen);

  useLayoutEffect(() => {
    if (!isOpen || !anchorRect || !menuRef.current) return;

    const menu = menuRef.current;
    const { width, height } = menu.getBoundingClientRect();
    setMenuPosition(getFloatingMenuPosition(anchorRect, width, height));
  }, [isOpen, anchorRect, employee.currentProjectId, employee.status]);

  const menuContent = isOpen && anchorRect ? (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-9999 w-48 py-1"
      style={{
        left: `${menuPosition.left}px`,
        top: `${menuPosition.top}px`,
      }}
    >
        {!hasActiveAssignments && (
          <button
            onClick={handleOpenAssignModal}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
          >
            Assign to Project
          </button>
        )}
        {hasActiveAssignments && (
          <button
            onClick={handleOpenTransferModal}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
          >
            Transfer
          </button>
        )}
        {employee.status !== 'On Vacation' && (
          <button
            onClick={handleOpenVacationModal}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
          >
            Schedule Vacation
          </button>
        )}
        {hasActiveAssignments && (
          <button
            onClick={handleRemoveFromProject}
            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm"
          >
            Remove from Project
          </button>
        )}
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
      <Dialog open={showAssignModal} onOpenChange={handleCloseAssignModal}>
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
            <Button
              onClick={() => handleCloseAssignModal(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignToProject}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferModal} onOpenChange={handleCloseTransferModal}>
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
            <Button
              onClick={() => handleCloseTransferModal(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vacation Dialog */}
      <Dialog open={showVacationModal} onOpenChange={handleCloseVacationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Schedule Vacation</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Start Date
              </label>
              <DatePicker
                value={vacationStartDate}
                onChange={(value) => {
                  setVacationStartDate(value);
                  const start = parseDateValue(value);
                  const end = parseDateValue(vacationEndDate);
                  if (start && end && end < start) {
                    setVacationEndDate('');
                  }
                }}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                End Date
              </label>
              <DatePicker
                value={vacationEndDate}
                onChange={setVacationEndDate}
                placeholder="Select end date"
                disabled={
                  parseDateValue(vacationStartDate)
                    ? { before: parseDateValue(vacationStartDate)! }
                    : undefined
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleCloseVacationModal(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleVacation}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Note Dialog */}
      <Dialog open={showNoteModal} onOpenChange={handleCloseNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">
              {employee.notes && employee.notes.length > 0 ? 'Edit Note' : 'Add Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note..."
              className="h-24 resize-none rounded-lg border-gray-300 bg-white px-4 py-2.5 text-black placeholder:text-gray-400 focus-visible:ring-gray-500 focus-visible:ring-offset-0"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleCloseNoteModal(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {employee.notes && employee.notes.length > 0 ? 'Save Note' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove from Project Confirmation Dialog */}
      <Dialog open={showRemoveConfirmDialog} onOpenChange={setShowRemoveConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Remove Employee from Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to remove <strong>{employee.name}</strong> from project{' '}
              {currentProject && (
                <strong>
                  {currentProject.projectId} {currentProject.name}
                </strong>
              )}
              ?
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowRemoveConfirmDialog(false);
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              className="px-5 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
