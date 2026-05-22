import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// ---- Simple password hashing (pbkdf2) ----
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

// ---- Simple JWT implementation using HMAC SHA256 ----
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d'; // placeholder

function base64UrlEncode(str: string) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString();
}

export function signJwt(payload: Record<string, any>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 7 * 24 * 60 * 60; // 7 days
  const tokenPayload = { ...payload, iat, exp };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest('base64');
  const encodedSignature = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export function verifyJwt(token: string): { valid: boolean; payload?: any } {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return { valid: false };
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (expectedSig !== signatureB64) return { valid: false };
  const payload = JSON.parse(base64UrlDecode(payloadB64));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return { valid: false };
  return { valid: true, payload };
}

// ---- Simple rate limiter (in‑memory) ----
interface RateLimitOptions {
  windowMs: number; // time window in ms
  max: number; // max requests per window per IP
  message?: string;
}

const rateLimiterStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket?.remoteAddress || '';
    const now = Date.now();
    const record = rateLimiterStore.get(ip) ?? { count: 0, resetTime: now + windowMs };
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    record.count += 1;
    rateLimiterStore.set(ip, record);
    if (record.count > max) {
      res.status(429).json({ error: message, retryAfter: Math.ceil((record.resetTime - now) / 1000) });
    } else {
      next();
    }
  };
}

// ---- Basic security headers (helmet‑like) ----
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  next();
}
