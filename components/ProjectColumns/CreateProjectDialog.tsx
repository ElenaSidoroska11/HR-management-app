'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Supervisor } from '@/types/supervisor';

export interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  selectedSupervisorId: string;
  onSupervisorChange: (value: string) => void;
  allSupervisors: Supervisor[];
  isCreating: boolean;
  onCreate: () => void;
}

export default function CreateProjectDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  selectedSupervisorId,
  onSupervisorChange,
  allSupervisors,
  isCreating,
  onCreate,
}: CreateProjectDialogProps) {
  const [nameTouched, setNameTouched] = useState(false);
  const [supervisorTouched, setSupervisorTouched] = useState(false);

  const trimmedProjectName = projectName.trim();
  const projectNameError =
    nameTouched && !trimmedProjectName ? 'Project name is required.' : '';
  const supervisorError =
    supervisorTouched && !selectedSupervisorId ? 'Supervisor is required.' : '';

  useEffect(() => {
    if (!open) {
      setNameTouched(false);
      setSupervisorTouched(false);
    }
  }, [open]);

  const handleCreate = () => {
    setNameTouched(true);
    setSupervisorTouched(true);
    if (!trimmedProjectName || !selectedSupervisorId) {
      return;
    }
    onCreate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black">Create new project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="create-project-name" className="text-sm font-medium text-black">
              Project name
            </label>
            <Input
              id="create-project-name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="Enter project name"
              aria-invalid={!!projectNameError}
              aria-describedby={projectNameError ? 'create-project-name-error' : undefined}
              className={`bg-white text-gray-900 ${projectNameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {projectNameError && (
              <p id="create-project-name-error" className="text-xs text-red-600">
                {projectNameError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="create-project-supervisor" className="text-sm font-medium text-black">
              Supervisor
            </label>
            <Select
              value={selectedSupervisorId || undefined}
              onValueChange={(value) => {
                onSupervisorChange(value);
                setSupervisorTouched(true);
              }}
            >
              <SelectTrigger
                id="create-project-supervisor"
                onBlur={() => setSupervisorTouched(true)}
                aria-invalid={!!supervisorError}
                aria-describedby={supervisorError ? 'create-project-supervisor-error' : undefined}
                className={`w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 ${
                  supervisorError ? 'border-red-500 focus:border-red-500' : ''
                }`}
              >
                <SelectValue placeholder="Select a supervisor" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {allSupervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id} className="text-gray-900">
                    {supervisor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {supervisorError && (
              <p id="create-project-supervisor-error" className="text-xs text-red-600">
                {supervisorError}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="px-5 py-2.5 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {isCreating ? 'Creating…' : 'Create project'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
