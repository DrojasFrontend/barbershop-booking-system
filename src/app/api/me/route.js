import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/verify-auth';

export async function GET() {
  try {
    const user = verifyAuth();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    });

  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}