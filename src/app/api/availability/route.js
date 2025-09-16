import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const service = searchParams.get('service');

    if (!date || !service) {
      return NextResponse.json(
        { error: 'Fecha y servicio son requeridos' },
        { status: 400 }
      );
    }

    // Obtener duración del servicio
    const serviceDuration = await prisma.serviceDuration.findUnique({
      where: { service }
    });

    if (!serviceDuration) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 400 }
      );
    }

    // Arreglar problema de zona horaria agregando hora del mediodía
    const requestedDate = new Date(date + 'T12:00:00');
    const dayOfWeek = requestedDate.getDay();

    console.log('🔍 Debug availability:');
    console.log('  Date string:', date);
    console.log('  Parsed date:', requestedDate);
    console.log('  Day of week:', dayOfWeek);

    // Verificar si el barbero trabaja ese día
    const schedule = await prisma.barberSchedule.findFirst({
      where: {
        dayOfWeek: dayOfWeek,
        isActive: true
      }
    });

    console.log('  Schedule found:', schedule);

    if (!schedule) {
      return NextResponse.json({
        availableSlots: [],
        message: 'El barbero no trabaja este día'
      });
    }

    // Generar slots de tiempo disponibles
    const slots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      serviceDuration.duration
    );

    // Obtener citas ya programadas para ese día
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['confirmed', 'rescheduled']
        }
      }
    });

    // Filtrar slots ocupados
    const availableSlots = slots.filter(slot => {
      const slotStart = new Date(`${date}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + serviceDuration.duration * 60000);

      return !bookedAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.scheduledAt);
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 30) * 60000);

        // Verificar si hay solapamiento
        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });
    });

    return NextResponse.json({
      availableSlots,
      serviceDuration: serviceDuration.duration,
      workingHours: `${schedule.startTime} - ${schedule.endTime}`
    });

  } catch (error) {
    console.error('Error getting availability:', error);
    return NextResponse.json(
      { error: 'Error al obtener disponibilidad' },
      { status: 500 }
    );
  }
}

function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentTime = startHour * 60 + startMinute; // Convertir a minutos
  const endTimeMinutes = endHour * 60 + endMinute;

  while (currentTime + duration <= endTimeMinutes) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    slots.push(timeString);
    
    currentTime += 30; // Slots cada 30 minutos
  }

  return slots;
}