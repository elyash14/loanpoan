import { User } from '@prisma/client'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import 'server-only'


const secretKey = process.env.AUTH_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

function sessionCookieOptions(expiresAt: Date) {
    const useSecure =
        process.env.NODE_ENV === "production" ||
        process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://");

    return {
        httpOnly: true,
        secure: useSecure,
        expires: expiresAt,
        sameSite: "lax" as const,
        path: "/",
    };
}

export async function createSession(
    user: User,
    authProvider: "email" | "telegram" = "email",
) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({
        userId: String(user.id),
        email: user.email,
        role: user.role,
        fullName: `${user.firstName} ${user.lastName}`,
        authProvider,
        telegramId: user.telegramId?.toString(),
        expiresAt
    })

    const cookieStore = await cookies()
    cookieStore.set('session', session, sessionCookieOptions(expiresAt))
}

export async function updateSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const payload = await decrypt(session)

    if (!session || !payload) {
        return null
    }

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    cookieStore.set('session', session, sessionCookieOptions(expires))
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export type SessionUser = {
    userId: string,
    email: string,
    role: string,
    fullName: string,
    authProvider?: string,
    telegramId?: string,
    image?: string,
}
export type SessionPayload = SessionUser & {
    expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') //TODO check it
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    if (!session) {
        return null
    }

    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}
