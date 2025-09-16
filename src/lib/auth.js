import { prisma } from './prisma';

export async function verifyCredentials(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || !user.password) {
      return null;
    }

    // Para simplicidad en desarrollo, comparación directa
    // En producción deberías usar bcrypt
    const isValid = user.password === password;
    
    if (!isValid) {
      return null;
    }

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}