import { NextRequest } from 'next/server';

function getFirstForwardedValue(value: string | null | undefined): string | null {
  if (!value) return null;

  const normalizedValue = value.split(',')[0]?.trim();
  return normalizedValue || null;
}

function normalizeOrigin(value: string | null | undefined): string | null {
  const normalizedValue = getFirstForwardedValue(value);
  if (!normalizedValue) return null;

  try {
    return new URL(normalizedValue).origin;
  } catch {
    return null;
  }
}

export function getPublicOrigin(request: NextRequest): string {
  const envOrigin = normalizeOrigin(process.env.AUTH_URL) || normalizeOrigin(process.env.NEXTAUTH_URL);
  if (envOrigin) return envOrigin;

  const host = getFirstForwardedValue(request.headers.get('x-forwarded-host')) || getFirstForwardedValue(request.headers.get('host'));
  const proto = getFirstForwardedValue(request.headers.get('x-forwarded-proto')) || request.nextUrl.protocol.replace(':', '') || 'https';

  if (host) return `${proto}://${host}`;

  return request.nextUrl.origin;
}

export function buildLocalizedLoginPath(locale: string): string {
  return `/${locale}/login`;
}

export function buildLocalizedDashboardPath(locale: string): string {
  return `/${locale}/dashboard`;
}

export function buildLoginUrl(origin: string, locale: string, callbackPath?: string): string {
  const loginUrl = new URL(buildLocalizedLoginPath(locale), origin);
  if (callbackPath) loginUrl.searchParams.set('callbackUrl', callbackPath);
  return loginUrl.toString();
}

export function sanitizeRelativeCallbackPath(value: string | null | undefined, fallbackPath: string): string {
  if (!value) return fallbackPath;
  if (!value.startsWith('/')) return fallbackPath;
  if (value.startsWith('//')) return fallbackPath;

  try {
    const url = new URL(value, 'http://localhost');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallbackPath;
  }
}
