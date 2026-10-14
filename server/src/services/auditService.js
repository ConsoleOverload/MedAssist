import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const recordAuditEvent = async ({
  actorId = null,
  actorName = 'System',
  actorRole = 'system',
  action,
  resourceType,
  resourceId = null,
  outcome = 'success',
  details = {},
  req = null,
}) => {
  try {
    const ipAddress = req?.ip || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers ? req.headers['user-agent'] || '' : '';

    const auditEntry = await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      resourceType,
      resourceId: resourceId ? resourceId.toString() : null,
      outcome,
      details,
      ipAddress,
      userAgent,
    });

    return auditEntry;
  } catch (error) {
    logger.error('Failed to record audit log:', error);
    // Never crash the primary workflow if an audit log fails, but log aggressively
    return null;
  }
};
