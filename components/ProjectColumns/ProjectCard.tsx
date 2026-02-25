'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Project } from '@/types/project';
import { useProjectAssignments } from '@/lib/hooks/useAssignments';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { employees, loading } = useProjectAssignments(project.id);
  
  const { setNodeRef, isOver } = useDroppable({
    id: project.id,
    data: {
      type: 'project',
      project,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg p-4 border-2 shadow-sm transition-all ${
        isOver
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200'
      }`}
    >
      {/* Project Header */}
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900">
          {project.projectId} {project.name}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Total employees: {project.totalEmployees}
        </p>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-center">
          <p className="text-xs text-blue-700 font-medium">
            Drop employee here
          </p>
        </div>
      )}

      {/* Employees List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-2">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            {isOver ? '' : 'No employees assigned'}
          </p>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-2 bg-yellow-50 rounded text-sm"
            >
              <span className="text-gray-700">
                {employee.name} ({employee.hours || 0})
              </span>
              <button className="text-gray-400 hover:text-red-500">
                <span className="text-lg">−</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
