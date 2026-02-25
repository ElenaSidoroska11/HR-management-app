'use client';

import { useState, useEffect } from 'react';
import { subscribeToEmployees } from '@/lib/firebase/firestore';
import type { Employee } from '@/types/employee';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToEmployees((fetchedEmployees) => {
        setEmployees(fetchedEmployees);
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load employees'));
      setLoading(false);
    }
  }, []);

  return { employees, loading, error };
}

