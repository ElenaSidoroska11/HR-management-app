'use client';

import { useState, useEffect } from 'react';
import { subscribeToAssignmentsByProject, subscribeToAssignmentsByEmployee, subscribeToVacationsByEmployee } from '@/lib/firebase/firestore';
import type { Assignment } from '@/types/assignment';
import type { Employee } from '@/types/employee';
import type { Vacation } from '@/types/vacation';
import { getEmployee } from '@/lib/firebase/firestore';

export interface EmployeeWithAssignment extends Employee {
  assignmentId: string;
  hours: number;
}

export function useProjectAssignments(projectId: string | undefined) {
  const [employees, setEmployees] = useState<EmployeeWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToAssignmentsByProject(
        projectId,
        async (assignments) => {
          // Fetch employee details for each assignment
          const employeesWithAssignments = await Promise.all(
            assignments.map(async (assignment) => {
              const employee = await getEmployee(assignment.employeeId);
              if (!employee) {
                return null;
              }
              return {
                ...employee,
                assignmentId: assignment.id,
                hours: assignment.hours,
              } as EmployeeWithAssignment;
            })
          );

          setEmployees(
            employeesWithAssignments.filter(
              (emp): emp is EmployeeWithAssignment => emp !== null
            )
          );
          setLoading(false);
          setError(null);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load assignments'));
      setLoading(false);
    }
  }, [projectId]);

  return { employees, loading, error };
}

export function useEmployeeAssignments(employeeId: string | undefined) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = subscribeToAssignmentsByEmployee(
        employeeId,
        (fetchedAssignments) => {
          setAssignments(fetchedAssignments);
          setLoading(false);
          setError(null);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load assignments'));
      setLoading(false);
    }
  }, [employeeId]);

  return { assignments, loading, error };
}

export function useEmployeeVacationDays(employeeId: string | undefined, vacationDaysPerYear: number = 21) {
  const [usedDays, setUsedDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setUsedDays(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = subscribeToVacationsByEmployee(
        employeeId,
        (vacations) => {
          let totalUsedDays = 0;
          
          vacations.forEach((vacation: Vacation) => {
            let startDate: Date;
            let endDate: Date;
            
            if (vacation.startDate instanceof Date) {
              startDate = vacation.startDate;
            } else if (vacation.startDate && typeof (vacation.startDate as any).toDate === 'function') {
              startDate = (vacation.startDate as any).toDate();
            } else {
              startDate = new Date(vacation.startDate as any);
            }
            
            if (vacation.endDate instanceof Date) {
              endDate = vacation.endDate;
            } else if (vacation.endDate && typeof (vacation.endDate as any).toDate === 'function') {
              endDate = (vacation.endDate as any).toDate();
            } else {
              endDate = new Date(vacation.endDate as any);
            }
            
            // Calculate days (inclusive of both start and end dates)
            const timeDiff = endDate.getTime() - startDate.getTime();
            const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
            totalUsedDays += days;
          });
          
          setUsedDays(totalUsedDays);
          setLoading(false);
          setError(null);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load vacation days'));
      setLoading(false);
    }
  }, [employeeId]);

  const remainingDays = vacationDaysPerYear - usedDays;

  return { usedDays, remainingDays, loading, error };
}

