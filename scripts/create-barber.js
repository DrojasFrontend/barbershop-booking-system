const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBarber() {
  try {
    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'barbero@test.com' }
    });

    if (existingUser) {
      console.log('El usuario barbero ya existe');
      return;
    }

    // Crear usuario barbero (contraseña en texto plano para desarrollo)
    const barber = await prisma.user.create({
      data: {
        name: 'Barbero Principal',
        email: 'barbero@test.com',
        password: '123456', // En producción usar bcrypt
        role: 'barber'
      }
    });

    console.log('Usuario barbero creado exitosamente:');
    console.log('Email: barbero@test.com');
    console.log('Contraseña: 123456');
    console.log('ID:', barber.id);

  } catch (error) {
    console.error('Error creando barbero:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBarber();