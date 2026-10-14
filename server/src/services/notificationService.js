import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  link = '',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    logger.error('Failed to create in-app notification:', error);
    return null;
  }
};

export const broadcastToRole = async (
  role,
  { title, message, type = 'system', link = '', metadata = {} }
) => {
  try {
    const users = await User.find({ role, isActive: true }).select('_id');
    if (!users || users.length === 0) return [];

    const notifications = users.map((u) => ({
      userId: u._id,
      title,
      message,
      type,
      link,
      metadata,
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    logger.error(`Failed to broadcast notifications to role ${role}:`, error);
    return [];
  }
};
