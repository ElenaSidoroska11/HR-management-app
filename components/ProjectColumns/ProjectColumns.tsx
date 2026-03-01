'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import ProjectColumn from './ProjectColumn';
import { useProjects } from '@/lib/hooks/useProjects';
import { useSupervisors } from '@/lib/hooks/useSupervisors';
import { createProject } from '@/lib/firebase/firestore';
import type { Project } from '@/types/project';
import type { Supervisor as SupervisorType } from '@/types/supervisor';
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

interface Supervisor {
  id: string;
  name: string;
  projects: Project[];
}

export default function ProjectColumns() {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { supervisors: allSupervisors, loading: supervisorsLoading } = useSupervisors();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const supervisorMap = useMemo(() => {
    const map = new Map<string, SupervisorType>();
    allSupervisors.forEach((supervisor) => {
      map.set(supervisor.id, supervisor);
    });
    return map;
  }, [allSupervisors]);

  // Group projects by supervisor, using actual supervisor names from supervisors collection
  const supervisors = useMemo(() => {
    const groupedMap = new Map<string, Supervisor>();

    projects.forEach((project) => {
      const key = project.supervisorId;
      if (!groupedMap.has(key)) {
        // Get supervisor name from supervisors collection, fallback to project.supervisorName if not found
        const supervisor = supervisorMap.get(key);
        groupedMap.set(key, {
          id: project.supervisorId,
          name: supervisor?.name || project.supervisorName || 'Unknown Supervisor',
          projects: [],
        });
      }
      groupedMap.get(key)!.projects.push(project);
    });

    return Array.from(groupedMap.values());
  }, [projects, supervisorMap]);

  const loading = projectsLoading || supervisorsLoading;
  const error = projectsError;

  const handleCreateProject = async () => {
    if (!projectName.trim() || !selectedSupervisorId) {
      alert('Please fill in all fields');
      return;
    }

    const selectedSupervisor = allSupervisors.find(s => s.id === selectedSupervisorId);
    if (!selectedSupervisor) {
      alert('Please select a supervisor');
      return;
    }

    setIsCreating(true);
    try {
      await createProject({
        projectId: projectName.trim(), 
        name: projectName.trim(),
        supervisorId: selectedSupervisorId,
        supervisorName: selectedSupervisor.name,
        totalEmployees: 0,
      });

      setProjectName('');
      setSelectedSupervisorId('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

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
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
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
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
              onClick={() => {
                setShowCreateDialog(false);
                setProjectName('');
                setSelectedSupervisorId('');
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
