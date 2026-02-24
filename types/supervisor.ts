import { Timestamp } from 'firebase/firestore';

export interface Supervisor {
  id: string;
  name: string;
  email?: string;
  createdAt: Timestamp | Date;
}

