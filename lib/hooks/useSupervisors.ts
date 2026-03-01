'use client';

import { useState, useEffect } from 'react';
import { subscribeToSupervisors } from '@/lib/firebase/firestore';
import type { Supervisor } from '@/types/supervisor';

export function useSupervisors() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToSupervisors((fetchedSupervisors) => {
        setSupervisors(fetchedSupervisors);
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load supervisors'));
      setLoading(false);
    }
  }, []);

  return { supervisors, loading, error };
}

