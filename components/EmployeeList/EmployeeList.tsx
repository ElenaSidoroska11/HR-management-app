"use client";

import { Plus } from "lucide-react";
import EmployeeSearch from "./EmployeeSearch";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeCard from "./EmployeeCard";
import { useEmployeeList } from "@/lib/hooks/useEmployeeList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "../ui/input";

export default function EmployeeList() {
  const {
    filteredEmployees,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    positionFilter,
    setPositionFilter,
    showAddDialog,
    showEditDialog,
    showDeleteConfirmDialog,
    setShowAddDialog,
    setShowDeleteConfirmDialog,
    employeeName,
    setEmployeeName,
    editingEmployee,
    handleAddEmployee,
    handleEditEmployee,
    handleOpenEditDialog,
    handleDeleteEmployee,
    handleOpenDeleteConfirm,
    handleCloseAddDialog,
    handleCloseEditDialog,
  } = useEmployeeList();

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-300 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        <button
          onClick={() => setShowAddDialog(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          title="Add Employee">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-300">
        <EmployeeSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <div className="p-4 border-b border-gray-300">
        <EmployeeFilters
          statusFilter={statusFilter}
          positionFilter={positionFilter}
          onStatusChange={setStatusFilter}
          onPositionChange={setPositionFilter}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        style={{
          touchAction: "pan-y", // Only allow vertical scrolling
          overscrollBehavior: "contain", // Prevent scroll chaining
        }}>
        {filteredEmployees.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No employees found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} onEdit={handleOpenEditDialog} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={handleCloseAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Add Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1 text-black">Name</label>
            <Input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name..."
              className="bg-white text-gray-900 mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddEmployee();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => handleCloseAddDialog(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200">
              Cancel
            </button>
            <button
              onClick={handleAddEmployee}
              disabled={!employeeName.trim()}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              Add Employee
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1 text-black">Name</label>
            <Input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name..."
              className="bg-white text-gray-900 mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditEmployee();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              onClick={handleOpenDeleteConfirm}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              Delete Employee
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleCloseEditDialog(false)}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-colors duration-200 flex-1 sm:flex-none">
                Cancel
              </button>
              <button
                onClick={handleEditEmployee}
                disabled={!employeeName.trim()}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none">
                Save Changes
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{editingEmployee?.name}</strong>? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteConfirmDialog(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200">
              Cancel
            </button>
            <button
              onClick={handleDeleteEmployee}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg">
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
