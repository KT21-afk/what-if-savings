import { Timestamp } from 'firebase/firestore';

export interface Savings {
  userId: string;
  goalId?: string;
  itemName: string;
  amount: number;
  timestamp: Timestamp;
}