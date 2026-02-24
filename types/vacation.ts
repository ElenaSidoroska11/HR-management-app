import { Timestamp } from 'firebase/firestore';

export type VacationStatus = 'Scheduled' | 'Active' | 'Completed';

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  status: VacationStatus;
  createdBy: string; 
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
