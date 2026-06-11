import { ActivityLog } from '../models';

export const logActivity = async (
  action: string,
  entity: string,
  options?: {
    userId?: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }
): Promise<void> => {
  try {
    await ActivityLog.create({
      userId: options?.userId,
      action,
      entity,
      entityId: options?.entityId,
      details: options?.details,
      ipAddress: options?.ipAddress,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
