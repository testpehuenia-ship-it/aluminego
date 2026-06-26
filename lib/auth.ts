import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'AluminéGO-super-secret-key-2026-safe-123456';

export function signSession(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifySession(sessionToken: string | undefined | null): { username: string } | null {
  if (!sessionToken) return null;
  const parts = sessionToken.split('.');
  if (parts.length !== 2) return null;
  const [payloadStr, signature] = parts;
  
  // Verificar firma
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadStr)
    .digest('base64url');
    
  if (signature !== expectedSignature) {
    return null;
  }
  
  try {
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Expirado
    }
    return { username: payload.username };
  } catch (e) {
    return null;
  }
}

// Password hashing and verification
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // Compatibilidad hacia atrás: si no contiene dos puntos, verificar directamente (texto plano)
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Signed Portal Sessions
export function signPortalSession(sessionData: { id: string; email: string; name: string | null }): string {
  const payload = {
    ...sessionData,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifyPortalSession(sessionToken: string | undefined | null): { id: string; email: string; name: string | null } | null {
  if (!sessionToken) return null;
  const parts = sessionToken.split('.');
  if (parts.length !== 2) return null;
  const [payloadStr, signature] = parts;
  
  // Verificar firma
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadStr)
    .digest('base64url');
    
  if (signature !== expectedSignature) {
    return null;
  }
  
  try {
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Expirado
    }
    return { id: payload.id, email: payload.email, name: payload.name };
  } catch (e) {
    return null;
  }
}

