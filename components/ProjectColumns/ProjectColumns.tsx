'use client';

import ProjectColumn from './ProjectColumn';
import type { Project } from '@/types/project';

interface Supervisor {
  id: string;
  name: string;
  projects: Project[];
}

export default function ProjectColumns() {
  // TODO: Will connect to Firebase later
  // For now, show empty state
  const supervisors: Supervisor[] = [];

  return (
    <div className="h-full p-4">
      {supervisors.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm mt-2">Project columns will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 h-full overflow-x-auto">
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

