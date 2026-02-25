'use client';

import { useState, useEffect } from 'react';
import { subscribeToProjects } from '@/lib/firebase/firestore';
import type { Project } from '@/types/project';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToProjects((fetchedProjects) => {
        setProjects(fetchedProjects);
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load projects'));
      setLoading(false);
    }
  }, []);

  return { projects, loading, error };
}

