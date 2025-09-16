import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        requestedAt: 'desc'
      }
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Error al obtener las citas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientName, clientPhone, service, scheduledAt, notes } = body;

    // Validación básica
    if (!clientName || !clientPhone || !service || !scheduledAt) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener duración del servicio
    const serviceDuration = await prisma.serviceDuration.findUnique({
      where: { service }
    });

    if (!serviceDuration) {
      return NextResponse.json(
        { error: 'Servicio no válido' },
        { status: 400 }
      );
    }

    // Verificar que el horario siga disponible
    const requestedTime = new Date(scheduledAt);
    const endTime = new Date(requestedTime.getTime() + serviceDuration.duration * 60000);

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: new Date(requestedTime.getTime() - 60 * 60000), // 1 hora antes
          lte: new Date(requestedTime.getTime() + 60 * 60000)  // 1 hora después
        },
        status: {
          in: ['confirmed', 'rescheduled']
        }
      }
    });

    // Verificar conflictos más precisos
    const hasConflict = conflictingAppointments.some(apt => {
      const aptStart = new Date(apt.scheduledAt);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration || 30) * 60000);
      
      return (requestedTime < aptEnd && endTime > aptStart);
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible' },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        service,
        scheduledAt: requestedTime,
        duration: serviceDuration.duration,
        notes: notes || null,
        status: 'confirmed' // Confirmación automática
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error al crear la cita' },
      { status: 500 }
    );
  }
}