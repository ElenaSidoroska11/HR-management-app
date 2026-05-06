'use client';

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
              placeholder="Enter project name"
              className="bg-white text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="create-project-supervisor" className="text-sm font-medium text-black">
              Supervisor
            </label>
            <Select
              value={selectedSupervisorId || undefined}
              onValueChange={onSupervisorChange}
            >
              <SelectTrigger
                id="create-project-supervisor"
                className="w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300"
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
            onClick={onCreate}
            disabled={isCreating}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Creating…' : 'Create project'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
