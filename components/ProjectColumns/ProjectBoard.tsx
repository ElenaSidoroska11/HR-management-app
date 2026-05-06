'use client';

import ProjectColumn from './ProjectColumn';
import type { Project } from '@/types/project';

export interface SupervisorColumnGroup {
  id: string;
  name: string;
  projects: Project[];
}

interface ProjectBoardProps {
  supervisors: SupervisorColumnGroup[];
}

export default function ProjectBoard({ supervisors }: ProjectBoardProps) {
  if (supervisors.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add a project from the Management tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-x-auto">
      {supervisors.map((supervisor) => (
        <ProjectColumn
          key={supervisor.id}
          supervisor={supervisor}
          projects={supervisor.projects}
        />
      ))}
    </div>
  );
}
