'use client';

import { useMemo, useState } from 'react';
import { useProjects } from './useProjects';
import { useSupervisors } from './useSupervisors';
import { createProject } from '@/lib/firebase/firestore';
import { isDuplicateDisplayName } from '@/lib/utils';
import { toast } from 'sonner';
import type { Project } from '@/types/project';
import type { Supervisor as SupervisorType } from '@/types/supervisor';

interface Supervisor {
  id: string;
  name: string;
  projects: Project[];
}

export function useProjectColumns() {
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
      return;
    }

    const selectedSupervisor = allSupervisors.find((s) => s.id === selectedSupervisorId);
    if (!selectedSupervisor) {
      return;
    }

    const trimmedName = projectName.trim();

    if (isDuplicateDisplayName(trimmedName, projects.map((p) => p.name))) {
      toast.error('Name already exists', {
        description: `A project named "${trimmedName}" already exists.`,
      });
      return;
    }

    setIsCreating(true);
    try {
      await createProject({
        projectId: trimmedName,
        name: trimmedName,
        supervisorId: selectedSupervisorId,
        supervisorName: selectedSupervisor.name,
        totalEmployees: 0,
      });

      setProjectName('');
      setSelectedSupervisorId('');
      setShowCreateDialog(false);
      toast.success(`Project "${trimmedName}" created`);
    } catch {
      toast.error('Error', {
        description: 'Failed to create project. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseCreateDialog = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setProjectName('');
      setSelectedSupervisorId('');
    }
  };

  return {
    supervisors,
    allSupervisors,
    loading,
    error,
    showCreateDialog,
    setShowCreateDialog,
    projectName,
    setProjectName,
    selectedSupervisorId,
    setSelectedSupervisorId,
    isCreating,
    handleCreateProject,
    handleCloseCreateDialog,
  };
}
