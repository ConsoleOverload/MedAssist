export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? sanitizeMeta(meta) : '');
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? sanitizeMeta(meta) : '');
  },
  error: (msg: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ? sanitizeMeta(meta) : '');
  },
};

const REDACTED_KEYS = ['password', 'token', 'refreshToken', 'secret', 'authorization', 'cookie'];

function sanitizeMeta(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeMeta);
  const copy: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_KEYS.some((k) => key.toLowerCase().includes(k))) {
      copy[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      copy[key] = sanitizeMeta(value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}
