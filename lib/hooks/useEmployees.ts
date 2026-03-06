'use client';

import { useState, useEffect } from 'react';
import { subscribeToEmployees, updateEmployee } from '@/lib/firebase/firestore';
import { useToast } from './use-toast';
import type { Employee } from '@/types/employee';

// Helper function to convert Firestore Timestamp or Date to Date
const toDate = (date: Date | any): Date => {
  if (date instanceof Date) {
    return date;
  } else if (date && typeof date.toDate === 'function') {
    // Firestore Timestamp
    return date.toDate();
  } else if (date) {
    return new Date(date);
  }
  return new Date();
};

// Check if vacation has ended and update employee status if needed
const checkAndUpdateVacationStatus = async (
  employee: Employee,
  toast: (props: { variant: 'destructive'; title: string; description: string }) => void
) => {
  // Only check employees with "On Vacation" status and vacation end date
  if (employee.status !== 'On Vacation' || !employee.vacationEndDate) {
    return;
  }

  try {
    const vacationEndDate = toDate(employee.vacationEndDate);
    const today = new Date();
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    vacationEndDate.setHours(0, 0, 0, 0);

    // If vacation has ended (end date is today or before)
    if (vacationEndDate <= today) {
      // Determine new status based on whether employee has a project
      const newStatus = employee.currentProjectId ? 'Active' : 'Unassigned';
      
      await updateEmployee(employee.id, {
        status: newStatus,
        vacationStartDate: undefined,
        vacationEndDate: undefined,
      } as any);
    }
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: `Failed to update vacation status for employee ${employee.name}. Please try again.`,
    });
  }
};

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const unsubscribe = subscribeToEmployees((fetchedEmployees) => {
        setEmployees(fetchedEmployees);
        setLoading(false);
        setError(null);

        // Check and update vacation status for all employees
        fetchedEmployees.forEach((employee) => {
          checkAndUpdateVacationStatus(employee, toast);
        });
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load employees'));
      setLoading(false);
    }
  }, [toast]);

  return { employees, loading, error };
}

