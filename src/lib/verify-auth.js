import { cookies } from 'next/headers';

export async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');

    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Verificar que la sesión no haya expirado (24 horas)
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms

    if (sessionAge > maxAge) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}