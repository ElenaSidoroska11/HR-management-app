'use client';

import { Plus } from 'lucide-react';
import ProjectColumn from './ProjectColumn';
import { useProjectColumns } from '@/lib/hooks/useProjectColumns';
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

export default function ProjectColumns() {
  const {
    supervisors,
    allSupervisors,
    loading,
    error,
    showCreateDialog,
    projectName,
    setProjectName,
    selectedSupervisorId,
    setSelectedSupervisorId,
    isCreating,
    handleCreateProject,
    handleCloseCreateDialog,
  } = useProjectColumns();

  if (loading) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full p-4 flex flex-col">
        {/* Header with Add Project Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => handleCloseCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Project
          </button>
        </div>

        {/* Project Columns */}
        <div className="flex-1 overflow-hidden">
          {supervisors.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">No projects yet</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full overflow-x-auto">
              {supervisors.map((supervisor) => (
                <ProjectColumn
                  key={supervisor.id}
                  supervisor={supervisor}
                  projects={supervisor.projects}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleCloseCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black bg-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Supervisor
              </label>
              <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId}>
                <SelectTrigger className="w-full bg-white text-gray-900 border-gray-300 focus:ring-0 focus:ring-offset-0 focus:border-gray-300">
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
              onClick={() => handleCloseCreateDialog(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
