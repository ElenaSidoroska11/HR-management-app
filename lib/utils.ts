import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EmployeePosition } from "@/types/employee"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get background color class for employee position
 * @param position - Employee position
 * @returns Tailwind CSS background color class
 */
export function getPositionBgColor(position: EmployeePosition | undefined): string {
  if (!position) return 'bg-gray-50';
  
  const positionColors: Record<EmployeePosition, string> = {
    'Manager': 'bg-purple-50',
    'Foreman': 'bg-yellow-50',
    'Journeyman': 'bg-orange-50',
    'Apprentice': 'bg-green-50',
  };
  
  return positionColors[position] || 'bg-gray-50';
}

export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/** Position a floating menu next to an anchor, flipping above when needed. */
export function getFloatingMenuPosition(
  anchor: AnchorRect,
  menuWidth: number,
  menuHeight: number,
  options?: { padding?: number; gap?: number }
): { left: number; top: number } {
  const padding = options?.padding ?? 8;
  const gap = options?.gap ?? 4;

  let left = anchor.right - menuWidth;
  let top = anchor.bottom + gap;

  if (top + menuHeight > window.innerHeight - padding) {
    top = anchor.top - menuHeight - gap;
  }

  left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding));
  top = Math.max(padding, Math.min(top, window.innerHeight - menuHeight - padding));

  return { left, top };
}

