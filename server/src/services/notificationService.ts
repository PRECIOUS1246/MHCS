import { Notification } from '../models';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export const setSocketIO = (socketServer: SocketServer): void => {
  io = socketServer;
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'alert' | 'reminder' | 'appointment' = 'info',
  options?: { link?: string; metadata?: Record<string, unknown> }
) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    link: options?.link,
    metadata: options?.metadata,
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      id: notification._id,
      title,
      message,
      type,
      link: options?.link,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

export const notifyCounsellorsOfCriticalAlert = async (
  counsellorIds: string[],
  alertMessage: string
): Promise<void> => {
  await Promise.all(
    counsellorIds.map((id) =>
      createNotification(id, 'Critical Alert', alertMessage, 'alert', {
        link: '/alerts',
      })
    )
  );
};
