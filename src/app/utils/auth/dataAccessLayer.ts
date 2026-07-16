import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { decrypt } from './session'
import { DASHBOARD_URL } from 'utils/configs'

export const verifySession = cache(async () => {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) {
        redirect(`/${DASHBOARD_URL}/login`)
    }

    return { isAuth: true, userId: session.userId }
});

export const getSession = cache(async () => {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value
    const session = await decrypt(cookie)
    return session;
});
