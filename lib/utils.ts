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

