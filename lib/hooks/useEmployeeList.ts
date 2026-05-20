'use client';

import { useState, useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { createEmployee, updateEmployee, deleteEmployee } from '@/lib/firebase/firestore';
import { isDuplicateDisplayName } from '@/lib/utils';
import { toast } from 'sonner';
import type { Employee } from '@/types/employee';

export function useEmployeeList() {
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
    const name = employeeName.trim();
    if (!name) return;

    if (isDuplicateDisplayName(name, employees.map((e) => e.name))) {
      toast.error('Name already exists', {
        description: `An employee named "${name}" already exists.`,
      });
      return;
    }

    try {
      await createEmployee({
        name,
        position: 'Apprentice',
        status: 'Unassigned',
      });
      setShowAddDialog(false);
      setEmployeeName('');
      toast.success(`${name} Employee added`);
    } catch {
      toast.error('Error', {
        description: 'Failed to create employee. Please try again.',
      });
    }
  };

  const handleEditEmployee = async () => {
    const name = employeeName.trim();
    if (!name || !editingEmployee) return;

    if (
      isDuplicateDisplayName(
        name,
        employees.map((e) => e.name),
        editingEmployee.name
      )
    ) {
      toast.error('Name already exists', {
        description: `An employee named "${name}" already exists.`,
      });
      return;
    }

    const nameChanged = name !== editingEmployee.name;

    try {
      await updateEmployee(editingEmployee.id, {
        name,
      } as any);
      setShowEditDialog(false);
      setEmployeeName('');
      setEditingEmployee(null);

      if (nameChanged) {
        toast.success('Employee updated', {
          description: `New name: ${name}`,
        });
      } else {
        toast.success('Employee updated');
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to update employee. Please try again.',
      });
    }
  };

  const handleOpenEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeName(employee.name);
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = async () => {
    if (!editingEmployee) return;

    const removedName = editingEmployee.name;
    try {
      await deleteEmployee(editingEmployee.id);
      setShowDeleteConfirmDialog(false);
      setShowEditDialog(false);
      setEmployeeName('');
      setEditingEmployee(null);
      toast.success(`${removedName} Employee removed`);
    } catch {
      toast.error('Error', {
        description: 'Failed to delete employee. Please try again.',
      });
    }
  };

  const handleOpenDeleteConfirm = () => {
    setShowDeleteConfirmDialog(true);
  };

  const handleCloseAddDialog = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      setEmployeeName('');
    }
  };

  const handleCloseEditDialog = (open: boolean) => {
    setShowEditDialog(open);
    if (!open) {
      setEmployeeName('');
      setEditingEmployee(null);
    }
  };

  return {
    employees,
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
    setShowEditDialog,
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
  };
}
