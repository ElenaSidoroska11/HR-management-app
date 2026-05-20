"use client";

import { Plane, Pencil } from "lucide-react";
import type { Project } from "@/types/project";
import { useProjectCard } from "@/lib/hooks/useProjectCard";
import { getPositionBgColor } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const {
    employees,
    loading,
    setNodeRef,
    isOver,
    showConfirmDialog,
    showEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    editedProjectName,
    setEditedProjectName,
    editedProjectId,
    setEditedProjectId,
    isUpdating,
    isDeleting,
    employeeToRemove,
    formatDate,
    calculateRemainingVacationDays,
    handleRemoveClick,
    handleConfirmRemove,
    handleEditProject,
    handleSaveEdit,
    handleDeleteProject,
    handleCloseEditDialog,
    handleOpenDeleteFromEdit,
    handleCloseConfirmDialog,
  } = useProjectCard({ project });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg p-4 border-2 shadow-sm transition-all ${
        isOver ? "border-gray-500 bg-gray-50 shadow-lg" : "border-gray-200"
      }`}>
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-gray-900 flex-1">
            {project.projectId} {project.name}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditProject();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
            title="Edit project">
            <Pencil className="h-4 w-4 text-gray-600 hover:text-gray-950 cursor-pointer" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Total employees: {project.totalEmployees}</p>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mb-2 p-2 bg-gray-100 border border-gray-300 rounded text-center">
          <p className="text-xs text-gray-700 font-medium">Drop employee here</p>
        </div>
      )}

      {/* Employees List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-2">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">{isOver ? "" : "No employees assigned"}</p>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className={`flex items-center justify-between p-2 rounded text-sm ${getPositionBgColor(employee.position)}`}>
              <div className="flex-1">
                <div className="text-gray-700">
                  {employee.name} ({calculateRemainingVacationDays(employee)})
                </div>
                {employee.status === "On Vacation" &&
                  employee.vacationStartDate &&
                  employee.vacationEndDate && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Plane className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">
                        {formatDate(employee.vacationStartDate)} - {formatDate(employee.vacationEndDate)}
                      </span>
                    </div>
                  )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveClick(employee);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors">
                <span className="text-lg">−</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Edit Project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Project ID</label>
              <input
                type="text"
                value={editedProjectId}
                onChange={(e) => setEditedProjectId(e.target.value)}
                placeholder="Enter project ID"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-black bg-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Project Name</label>
              <input
                type="text"
                value={editedProjectName}
                onChange={(e) => setEditedProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-black bg-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteFromEdit();
              }}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              Delete Project
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleCloseEditDialog(false)}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200 flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none">
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Delete Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete project{" "}
              <strong>
                {project.projectId} {project.name}
              </strong>
              ?
              {employees.length > 0 && (
                <span className="block mt-2 text-red-600 text-sm">
                  Warning: This project has {employees.length} assigned employee(s). They will need to be
                  reassigned.
                </span>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Employee Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={handleCloseConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Remove Employee from Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to remove <strong>{employeeToRemove?.name}</strong> from project{" "}
              <strong>
                {project.projectId} {project.name}
              </strong>
              ?
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleCloseConfirmDialog(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              className="px-5 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg">
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
