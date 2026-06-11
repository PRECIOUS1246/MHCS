export type UserRole = 'student' | 'counsellor' | 'admin';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type AssessmentType = 'phq9' | 'gad7';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  anonymousNickname?: string;
  studentId?: string;
  department?: string;
  avatar?: string;
}

export interface Assessment {
  _id: string;
  type: AssessmentType;
  score: number;
  riskLevel: RiskLevel;
  recommendations: string[];
  answers?: number[];
  userId?: { firstName: string; lastName: string; email?: string; studentId?: string };
  createdAt: string;
}

export interface MoodRecord {
  _id: string;
  mood: number;
  emoji: string;
  note?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  counsellorId: { firstName: string; lastName: string; email?: string };
  studentId?: { firstName: string; lastName: string };
  scheduledAt: string;
  status: string;
  reason?: string;
  duration: number;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: string;
  content?: string;
  url?: string;
  tags: string[];
}

export interface Forum {
  _id: string;
  title: string;
  description: string;
  category: string;
  postCount: number;
}

export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  anonymousName: string;
  likes: number;
  createdAt: string;
}

export interface Alert {
  _id?: string;
  id?: string;
  riskLevel: RiskLevel;
  message: string;
  type: string;
  isResolved: boolean;
  createdAt: string;
  userId?: { firstName: string; lastName: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
