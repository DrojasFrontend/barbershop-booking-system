import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');

    console.log('🔍 Búsqueda de citas:');
    console.log('  Nombre buscado:', `"${name}"`);
    console.log('  Teléfono buscado:', `"${phone}"`);

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nombre y teléfono son requeridos' },
        { status: 400 }
      );
    }

    // Primero obtener todas las citas y filtrar en JavaScript (para compatibilidad con SQLite)
    const allAppointments = await prisma.appointment.findMany({
      where: {
        clientPhone: phone // Filtrar primero por teléfono (exacto)
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    // Filtrar por nombre (case-insensitive) en JavaScript
    const appointments = allAppointments.filter(apt => 
      apt.clientName.toLowerCase() === name.toLowerCase()
    );

    console.log('📋 Resultados encontrados:', appointments.length);
    appointments.forEach((apt, index) => {
      console.log(`  ${index + 1}. "${apt.clientName}" - "${apt.clientPhone}" - ${apt.service}`);
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('❌ Error searching appointments:', error);
    return NextResponse.json(
      { error: 'Error al buscar las citas' },
      { status: 500 }
    );
  }
}