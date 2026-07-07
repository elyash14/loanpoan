import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from 'utils/auth/session';
import { DASHBOARD_URL } from 'utils/configs';

const publicRoutes = ['/login', '/link-required'];

const userAppRoute = /^\/(home|accounts|loans|installments|payments|profile|more|settings)(\/|$)/;

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isUserAppRoute = userAppRoute.test(path);

    // decrypt the session from the cookie
    // we can't use the verifySession function from dataAccessLayer because of react cache 
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    const session = await decrypt(cookie);
    const hasInvalidSessionCookie = Boolean(cookie) && !session?.userId;

    // User panel: allow through so Telegram Mini App can bootstrap auth client-side
    // Dashboard still requires session below
    const requiresAuth = !isPublicRoute && !isUserAppRoute;

    // redirect to /login if the user is not authenticated
    if (requiresAuth && !session?.userId) {
        const response = NextResponse.redirect(new URL('/login', req.nextUrl));
        if (hasInvalidSessionCookie) {
            response.cookies.delete('session');
        }
        return response;
    }

    // redirect to / if the user is not an admin
    const isPanelRoute = req.nextUrl.pathname.startsWith(`/${DASHBOARD_URL}`)
    if (isPanelRoute && session?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    const response = NextResponse.next();
    if (hasInvalidSessionCookie) {
        response.cookies.delete('session');
    }
    return response;
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}