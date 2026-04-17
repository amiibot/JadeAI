import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/share',
];

function isPublicPath(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(zh|en)/, '') || '/';
  return PUBLIC_PATHS.some((path) => (
    path === '/' ? withoutLocale === '/' : withoutLocale.startsWith(path)
  ));
}

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) return response;
  if (isPublicPath(pathname)) return response;

  const token =
    request.cookies.get('authjs.session-token')?.value
    || request.cookies.get('__Secure-authjs.session-token')?.value;

  if (!token) {
    const localeMatch = pathname.match(/^\/(zh|en)/);
    const locale = localeMatch ? localeMatch[1] : 'zh';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*', '/share/:path*'],
};
