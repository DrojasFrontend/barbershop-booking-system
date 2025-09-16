const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupSchedule() {
  try {
    console.log('🕒 Configurando horarios y duraciones...\n');

    // Configurar horarios de trabajo (Domingo a Sábado, 9AM a 7PM)
    const schedules = [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' }, // Domingo (horario reducido)
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' }, // Lunes
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' }, // Martes
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' }, // Miércoles
      { dayOfWeek: 4, startTime: '09:00', endTime: '19:00' }, // Jueves
      { dayOfWeek: 5, startTime: '09:00', endTime: '19:00' }, // Viernes
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' }, // Sábado
    ];

    // Limpiar horarios existentes
    await prisma.barberSchedule.deleteMany();

    // Crear nuevos horarios
    for (const schedule of schedules) {
      await prisma.barberSchedule.create({ data: schedule });
    }

    console.log('✅ Horarios de trabajo configurados:');
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    schedules.forEach(s => {
      console.log(`   ${days[s.dayOfWeek]}: ${s.startTime} - ${s.endTime}`);
    });

    // Configurar duraciones de servicios
    const services = [
      { service: 'corte', duration: 30 },
      { service: 'barba', duration: 20 },
      { service: 'corte-barba', duration: 45 },
      { service: 'afeitado', duration: 25 }
    ];

    // Limpiar duraciones existentes
    await prisma.serviceDuration.deleteMany();

    // Crear nuevas duraciones
    for (const serviceData of services) {
      await prisma.serviceDuration.create({ data: serviceData });
    }

    console.log('\n✅ Duraciones de servicios configuradas:');
    services.forEach(s => {
      console.log(`   ${s.service}: ${s.duration} minutos`);
    });

    console.log('\n🎉 Configuración completada!');

  } catch (error) {
    console.error('❌ Error configurando:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSchedule();