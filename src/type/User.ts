import { Timestamp } from "firebase/firestore";

export interface User {
  id?: string;
  uid: string;
  displayName: string;
  email: string;
  role: "user" | "admin";
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 