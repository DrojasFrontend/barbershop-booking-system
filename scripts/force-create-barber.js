const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function forceCreateBarber() {
  try {
    // Primero eliminar si existe
    try {
      await prisma.user.delete({
        where: { email: 'barbero@test.com' }
      });
      console.log('Usuario existente eliminado');
    } catch (e) {
      console.log('No había usuario previo');
    }

    // Crear usuario barbero
    const barber = await prisma.user.create({
      data: {
        name: 'Barbero Principal',
        email: 'barbero@test.com',
        password: '123456',
        role: 'barber'
      }
    });

    console.log('✅ Usuario barbero creado exitosamente:');
    console.log('📧 Email: barbero@test.com');
    console.log('🔑 Contraseña: 123456');
    console.log('🆔 ID:', barber.id);
    console.log('👤 Nombre:', barber.name);
    console.log('🎭 Rol:', barber.role);

  } catch (error) {
    console.error('❌ Error creando barbero:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceCreateBarber();