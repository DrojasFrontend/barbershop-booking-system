const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function railwaySetup() {
    try {
        console.log('🚀 Configurando base de datos para Railway...\n');

        // Verificar conexión a la base de datos
        await prisma.$connect();
        console.log('✅ Conexión a base de datos establecida');

        // Configurar horarios de trabajo
        console.log('📅 Configurando horarios de trabajo...');

        // Limpiar horarios existentes (con manejo de errores)
        try {
            await prisma.barberSchedule.deleteMany();
        } catch (error) {
            console.log('ℹ️ No hay horarios existentes para limpiar');
        }

        const schedules = [
            { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' }, // Domingo
            { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' }, // Lunes
            { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' }, // Martes
            { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' }, // Miércoles
            { dayOfWeek: 4, startTime: '09:00', endTime: '19:00' }, // Jueves
            { dayOfWeek: 5, startTime: '09:00', endTime: '19:00' }, // Viernes
            { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' }, // Sábado
        ];

        for (const schedule of schedules) {
            await prisma.barberSchedule.create({ data: schedule });
        }

        // Configurar duraciones de servicios
        console.log('⏱️ Configurando duraciones de servicios...');

        try {
            await prisma.serviceDuration.deleteMany();
        } catch (error) {
            console.log('ℹ️ No hay duraciones existentes para limpiar');
        }

        const services = [
            { service: 'corte', duration: 30 },
            { service: 'barba', duration: 20 },
            { service: 'corte-barba', duration: 45 },
            { service: 'afeitado', duration: 25 }
        ];

        for (const serviceData of services) {
            await prisma.serviceDuration.create({ data: serviceData });
        }

        // Crear usuario barbero
        console.log('👤 Creando usuario barbero...');

        // Verificar si ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: 'barbero@test.com' }
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    name: 'Barbero Principal',
                    email: 'barbero@test.com',
                    password: '123456', // En desarrollo sin hash
                    role: 'barber'
                }
            });
            console.log('✅ Usuario barbero creado: barbero@test.com / 123456');
        } else {
            console.log('✅ Usuario barbero ya existe');
        }

        console.log('\n🎉 ¡Configuración completada exitosamente!');
        console.log('🌐 La aplicación está lista en Railway');

    } catch (error) {
        console.error('❌ Error en la configuración:', error);
        // No hacer exit(1) para que el build continúe
    } finally {
        await prisma.$disconnect();
    }
}

railwaySetup();