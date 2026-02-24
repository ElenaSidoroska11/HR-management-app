import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  projectId: string; 
  name: string;
  supervisorId: string;
  supervisorName: string;
  totalEmployees: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface ProjectWithEmployees extends Project {
  employees?: string[]; 
}
