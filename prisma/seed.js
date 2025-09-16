const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Crear algunas citas de ejemplo
  const appointments = [
    {
      clientName: 'Juan Pérez',
      clientPhone: '+1234567890',
      service: 'corte',
      status: 'pending',
      notes: 'Corte clásico, no muy corto'
    },
    {
      clientName: 'María García',
      clientPhone: '+0987654321',
      service: 'corte-barba',
      status: 'approved',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
      notes: 'Cliente regular'
    },
    {
      clientName: 'Carlos López',
      clientPhone: '+1122334455',
      service: 'barba',
      status: 'completed',
      scheduledAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
    }
  ];

  for (const appointment of appointments) {
    await prisma.appointment.create({
      data: appointment
    });
  }

  console.log('Datos de prueba creados exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });