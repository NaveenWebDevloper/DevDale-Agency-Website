import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'devdale_secret';
const JWT_ALGORITHM = 'HS256';

// Simple HMAC‑SHA256 JWT creation (header.payload.signature)
export function signJwt(payload: Record<string, any>, expiresIn: string = '1h'): string {
  const header = Buffer.from(JSON.stringify({ alg: JWT_ALGORITHM, typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + parseDuration(expiresIn);
  const payloadWithExp = { ...payload, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payloadB64}`).digest('base64url');
  return `${header}.${payloadB64}.${signature}`;
}

export function verifyJwt(token: string): Record<string, any> | null {
  const [headerB64, payloadB64, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest('base64url');
  if (expectedSig !== signature) return null;
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// Helper to parse strings like "1h", "30m"
function parseDuration(str: string): number {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // default 1h
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] ?? 3600);
}
