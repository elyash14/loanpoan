import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from 'utils/auth/session';
import { DASHBOARD_URL } from 'utils/configs';

const publicRoutes = ['/login'];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    // decrypt the session from the cookie
    // we can't use the verifySession function from dataAccessLayer because of react cache 
    const cookie = cookies().get('session')?.value;
    const session = await decrypt(cookie);

    // redirect to /login if the user is not authenticated
    if (!isPublicRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // redirect to / if the user is not an admin
    const isPanelRoute = req.nextUrl.pathname.startsWith(`/${DASHBOARD_URL}`)
    if (isPanelRoute && session?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}