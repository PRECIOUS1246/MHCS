export type UserRole = 'student' | 'counsellor' | 'admin';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AssessmentType = 'phq9' | 'gad7';

export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'rescheduled';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}
