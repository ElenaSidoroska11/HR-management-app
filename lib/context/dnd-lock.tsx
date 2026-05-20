"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DndLockContextValue = {
  isLocked: boolean;
  acquire: () => void;
  release: () => void;
};

const DndLockContext = createContext<DndLockContextValue | null>(null);

export function DndLockProvider({ children }: { children: ReactNode }) {
  const countRef = useRef(0);
  const [isLocked, setIsLocked] = useState(false);

  const syncLocked = useCallback(() => {
    setIsLocked(countRef.current > 0);
  }, []);

  const acquire = useCallback(() => {
    countRef.current += 1;
    syncLocked();
  }, [syncLocked]);

  const release = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    syncLocked();
  }, [syncLocked]);

  const value = useMemo(
    () => ({ isLocked, acquire, release }),
    [isLocked, acquire, release],
  );

  return (
    <DndLockContext.Provider value={value}>{children}</DndLockContext.Provider>
  );
}

export function useDndLock() {
  const context = useContext(DndLockContext);
  if (!context) {
    throw new Error("useDndLock must be used within DndLockProvider");
  }
  return context;
}

/** Keeps drag-and-drop disabled while `isOpen` is true (e.g. floating menus). */
export function useDndLockWhileOpen(isOpen: boolean) {
  const { acquire, release } = useDndLock();

  useEffect(() => {
    if (!isOpen) return;
    acquire();
    return release;
  }, [isOpen, acquire, release]);
}
