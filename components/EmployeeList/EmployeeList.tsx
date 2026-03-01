'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import EmployeeSearch from './EmployeeSearch';
import EmployeeFilters from './EmployeeFilters';
import EmployeeCard from './EmployeeCard';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { createEmployee, updateEmployee, deleteEmployee } from '@/lib/firebase/firestore';
import type { Employee } from '@/types/employee';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';


export default function EmployeeList() {
  const { employees, loading, error } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        searchQuery === '' ||
        employee.name.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'Active') {
          matchesStatus = !!employee.currentProjectId;
        } else if (statusFilter === 'On Vacation') {
          matchesStatus = employee.status === 'On Vacation';
        } else if (statusFilter === 'Unassigned') {
          matchesStatus = !employee.currentProjectId;
        } else {
          matchesStatus = employee.status === statusFilter;
        }
      }

      const matchesPosition =
        positionFilter === 'all' || employee.position === positionFilter;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [employees, searchQuery, statusFilter, positionFilter]);

  const handleAddEmployee = async () => {
    if (!employeeName.trim()) return;

    try {
      await createEmployee({
        name: employeeName.trim(),
        position: 'Apprentice',
        status: 'Unassigned',
      });
      setShowAddDialog(false);
      setEmployeeName('');
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee');
    }
  };

  const handleEditEmployee = async () => {
    if (!employeeName.trim() || !editingEmployee) return;

    try {
      await updateEmployee(editingEmployee.id, {
        name: employeeName.trim(),
      } as any);
      setShowEditDialog(false);
      setEmployeeName('');
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    }
  };

  const handleOpenEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeName(employee.name);
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = async () => {
    if (!editingEmployee) return;

    try {
      await deleteEmployee(editingEmployee.id);
      setShowDeleteConfirmDialog(false);
      setShowEditDialog(false);
      setEmployeeName('');
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const handleOpenDeleteConfirm = () => {
    setShowDeleteConfirmDialog(true);
  };

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
      {/* Header */}
      <div className="p-4 border-b border-gray-300 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        <button
          onClick={() => setShowAddDialog(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          title="Add Employee"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-300">
        <EmployeeSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-300">
        <EmployeeFilters
          statusFilter={statusFilter}
          positionFilter={positionFilter}
          onStatusChange={setStatusFilter}
          onPositionChange={setPositionFilter}
        />
      </div>

      {/* Employee List */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        style={{ 
          touchAction: 'pan-y', // Only allow vertical scrolling
          overscrollBehavior: 'contain', // Prevent scroll chaining
        }}
      >
        {filteredEmployees.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No employees found</p>
            <p className="text-sm mt-2">
              {employees.length === 0
                ? 'Add employees in Firebase to see them here'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee}
                onEdit={handleOpenEditDialog}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEmployeeName('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Add Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1 text-black">
              Name
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black bg-white placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddEmployee();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowAddDialog(false);
                setEmployeeName('');
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEmployee}
              disabled={!employeeName.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Employee
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setEmployeeName('');
          setEditingEmployee(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1 text-black">
              Name
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black bg-white placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditEmployee();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              onClick={handleOpenDeleteConfirm}
              className="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors duration-200 border border-red-200 w-full sm:w-auto"
            >
              Delete Employee
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEmployeeName('');
                  setEditingEmployee(null);
                }}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={handleEditEmployee}
                disabled={!employeeName.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
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
              Are you sure you want to delete <strong>{editingEmployee?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteConfirmDialog(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteEmployee}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
