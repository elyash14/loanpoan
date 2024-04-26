import { User } from '@prisma/client'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import 'server-only'


const secretKey = process.env.AUTH_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(user: User) {
    //TODO use shorter time and use updateSession
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({
        userId: String(user.id),
        email: user.email,
        role: user.role,
        fullName: (user as any).fullName,
        // image: user.image,
        expiresAt
    })

    cookies().set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function updateSession() {
    const session = cookies().get('session')?.value
    const payload = await decrypt(session)

    if (!session || !payload) {
        return null
    }

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    cookies().set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expires,
        sameSite: 'lax',
        path: '/',
    })
}

export function deleteSession() {
    cookies().delete('session')
}

export type SessionUser = {
    userId: string,
    email: string,
    role: string,
    fullName: string,
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
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session')
    }
}