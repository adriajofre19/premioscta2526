import { createHash, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function adminPasswordConfigured(): boolean {
  return Boolean(import.meta.env.ADMIN_PASSWORD?.length);
}

function sessionToken(): string | null {
  const password = import.meta.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash('sha256').update(`premioscta-admin:${password}`).digest('hex');
}

export function verifyAdminPassword(password: string): boolean {
  const expected = import.meta.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function isAdminAuthenticated(cookies: AstroCookies): boolean {
  const expected = sessionToken();
  if (!expected) return false;
  const value = cookies.get(COOKIE_NAME)?.value;
  if (!value) return false;
  return safeEqual(value, expected);
}

export function setAdminSession(cookies: AstroCookies): void {
  const token = sessionToken();
  if (!token) return;
  cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/admin',
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAdminSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: '/admin' });
}
