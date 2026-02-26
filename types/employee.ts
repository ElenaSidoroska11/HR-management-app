import { Timestamp } from 'firebase/firestore';

export type EmployeePosition = 'Manager' | 'Foreman' | 'Journeyman' | 'Apprentice';
export type EmployeeStatus = 'Active' | 'On Vacation' | 'Unassigned';

export interface Employee {
  id: string;
  name: string;
  position: EmployeePosition;
  status: EmployeeStatus;
  assignedHours?: number;
  currentProjectId?: string;
  vacationStartDate?: Timestamp | Date;
  vacationEndDate?: Timestamp | Date;
  vacationDaysPerYear?: number; // Default 21 days per year
  notes?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface EmployeeWithAssignmentCount extends Employee {
  assignmentCount?: number;
}

