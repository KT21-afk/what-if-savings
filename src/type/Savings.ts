import { Timestamp } from 'firebase/firestore';

export interface Savings {
  userId: string;
  category: string;
  itemName: string;
  amount: number;
  timestamp: Timestamp;
  memo?: string;
}