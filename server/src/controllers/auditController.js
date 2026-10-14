import { AuditLog } from '../models/AuditLog.js';
import { sendSuccess } from '../utils/response.js';

export const listAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, outcome, page = 1, limit = 50 } = req.query;
    const query = {};

    if (action) query.action = new RegExp(action.trim(), 'i');
    if (resourceType) query.resourceType = resourceType;
    if (outcome) query.outcome = outcome;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    return sendSuccess(res, logs, 'Audit logs retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};
