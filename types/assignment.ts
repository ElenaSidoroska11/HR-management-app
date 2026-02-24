import { Timestamp } from 'firebase/firestore';

export type AssignmentStatus = 'Active' | 'Removed';

export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  hours: number;
  assignedAt: Timestamp | Date;
  status: AssignmentStatus;
  removedAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

