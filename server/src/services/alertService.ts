import { Alert, User } from '../models';
import { RiskLevel } from '../types';
import { createNotification, notifyCounsellorsOfCriticalAlert } from './notificationService';

export const createAlert = async (
  type: 'assessment' | 'mood' | 'manual' | 'system',
  riskLevel: RiskLevel,
  message: string,
  options?: { userId?: string; assessmentId?: string }
) => {
  const alert = await Alert.create({
    type,
    riskLevel,
    message,
    userId: options?.userId,
    assessmentId: options?.assessmentId,
  });

  if (riskLevel === 'critical' || riskLevel === 'high') {
    const counsellors = await User.find({ role: 'counsellor', isActive: true }).select('_id');
    const counsellorIds = counsellors.map((c) => c._id.toString());

    await notifyCounsellorsOfCriticalAlert(
      counsellorIds,
      `${riskLevel.toUpperCase()} risk alert: ${message}`
    );

    if (options?.userId) {
      await createNotification(
        options.userId,
        'Support Available',
        'Based on your recent assessment, a counsellor may reach out. Support resources are available.',
        'warning',
        { link: '/resources' }
      );
    }
  }

  return alert;
};
