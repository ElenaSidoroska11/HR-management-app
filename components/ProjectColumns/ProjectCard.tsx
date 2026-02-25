'use client';

import type { Project } from '@/types/project';
import { useProjectAssignments } from '@/lib/hooks/useAssignments';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { employees, loading } = useProjectAssignments(project.id);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* Project Header */}
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900">
          {project.projectId} {project.name}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Total employees: {project.totalEmployees}
        </p>
      </div>

      {/* Employees List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-2">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            No employees assigned
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
