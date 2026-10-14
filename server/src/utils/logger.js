const REDACTED_KEYS = ['password', 'token', 'refreshtoken', 'secret', 'authorization', 'cookie'];

function sanitizeMeta(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeMeta);
  const copy = {};
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

export const logger = {
  info: (msg, meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? sanitizeMeta(meta) : '');
  },
  warn: (msg, meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? sanitizeMeta(meta) : '');
  },
  error: (msg, meta) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ? sanitizeMeta(meta) : '');
  },
};
