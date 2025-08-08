import { Timestamp } from "firebase/firestore";

export interface Goal {
  id?: string;
  userId: string;
  targetAmount: number;
  currentAmount: number;
  title: string;
  createdAt: Timestamp;
  deadline: Timestamp;
  updatedAt: Timestamp;
  achievedAt?: Timestamp;
  order?: number;
} 