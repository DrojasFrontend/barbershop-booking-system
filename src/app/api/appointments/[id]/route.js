import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, cancellationReason } = body;

    // Validación básica
    if (!status) {
      return NextResponse.json(
        { error: 'Status es requerido' },
        { status: 400 }
      );
    }

    const updateData = { status };
    
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la cita' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cita' },
      { status: 500 }
    );
  }
}