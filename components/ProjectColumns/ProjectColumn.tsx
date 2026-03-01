'use client';

import ProjectCard from './ProjectCard';
import type { Project } from '@/types/project';

interface Supervisor {
  id: string;
  name: string;
}

interface ProjectColumnProps {
  supervisor: Supervisor;
  projects: Project[];
}

export default function ProjectColumn({
  supervisor,
  projects,
}: ProjectColumnProps) {
  return (
    <div className="shrink-0 w-80 rounded-lg p-4 flex flex-col h-full">
      {/* Supervisor Header */}
      <div className="mb-4 pb-3 border-b border-gray-300">
        <h3 className="text-lg font-semibold text-gray-800">
          {supervisor.name}
        </h3>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No projects
          </p>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}
