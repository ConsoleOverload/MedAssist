import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
    });

    return sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany(
        { userId: req.user.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return sendSuccess(res, null, 'All notifications marked as read');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) return sendError(res, 'Notification not found', 404);

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};
