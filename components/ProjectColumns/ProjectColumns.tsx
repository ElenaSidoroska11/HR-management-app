'use client';

import { useMemo } from 'react';
import ProjectColumn from './ProjectColumn';
import { useProjects } from '@/lib/hooks/useProjects';
import type { Project } from '@/types/project';

interface Supervisor {
  id: string;
  name: string;
  projects: Project[];
}

export default function ProjectColumns() {
  const { projects, loading, error } = useProjects();

  const supervisors = useMemo(() => {
    const supervisorMap = new Map<string, Supervisor>();

    projects.forEach((project) => {
      const key = project.supervisorId;
      if (!supervisorMap.has(key)) {
        supervisorMap.set(key, {
          id: project.supervisorId,
          name: project.supervisorName,
          projects: [],
        });
      }
      supervisorMap.get(key)!.projects.push(project);
    });

    return Array.from(supervisorMap.values());
  }, [projects]);

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
    <div className="h-full p-4">
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
  );
}
