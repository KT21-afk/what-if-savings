import { Timestamp } from "firebase/firestore";

export interface Feedback {
  id?: string;
  userId: string;
  userDisplayName: string;
  title: string;
  description: string;
  category: "feature" | "bug" | "improvement";
  status?: "scheduled" | "completed";
  votes: number;
  voters: string[]; // 投票したユーザーのID配列
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string; // 完了した開発者のID
} 