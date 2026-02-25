'use client';

import { useState, useEffect } from 'react';
import { subscribeToAssignmentsByProject } from '@/lib/firebase/firestore';
import type { Assignment } from '@/types/assignment';
import type { Employee } from '@/types/employee';
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

