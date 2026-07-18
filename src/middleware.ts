import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from 'utils/auth/session';
import { DASHBOARD_URL } from 'utils/configs';

const publicRoutes = ['/login', '/link-required', `/${DASHBOARD_URL}/login`];

const userAppRoute = /^\/(home|accounts|loans|installments|payments|profile|more|settings)(\/|$)/;
const publicAssetRoute = /^\/uploads(\/|$)/;

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Avatar and other uploaded files must load without a session cookie.
    // Mini App often requests them before Telegram auth finishes.
    if (publicAssetRoute.test(path)) {
        return NextResponse.next();
    }

    const isPublicRoute = publicRoutes.includes(path);
    const isUserAppRoute = userAppRoute.test(path);
    const isDashboardLogin = path === `/${DASHBOARD_URL}/login`;
    const isPanelRoute = path.startsWith(`/${DASHBOARD_URL}`);

    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    const session = await decrypt(cookie);
    const hasInvalidSessionCookie = Boolean(cookie) && !session?.userId;

    // User panel: allow through so Telegram Mini App can bootstrap auth client-side
    // Dashboard still requires session below (except login)
    const requiresAuth = !isPublicRoute && !isUserAppRoute;

    if (requiresAuth && !session?.userId) {
        const loginPath = isPanelRoute ? `/${DASHBOARD_URL}/login` : '/login';
        const response = NextResponse.redirect(new URL(loginPath, req.nextUrl));
        if (hasInvalidSessionCookie) {
            response.cookies.delete('session');
        }
        return response;
    }

    // Already signed in: skip login pages
    if (session?.userId && (path === '/login' || isDashboardLogin)) {
        const destination = session.role === 'ADMIN' ? `/${DASHBOARD_URL}` : '/home';
        return NextResponse.redirect(new URL(destination, req.nextUrl));
    }

    // Dashboard (except login) is admin-only
    if (isPanelRoute && !isDashboardLogin && session?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    const response = NextResponse.next();
    if (hasInvalidSessionCookie) {
        response.cookies.delete('session');
    }
    return response;
}

export const config = {
    // Skip Next internals, API, and common static image files.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
