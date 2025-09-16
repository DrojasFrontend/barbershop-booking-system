const { execSync } = require('child_process');

async function railwaySetup() {
  try {
    console.log('🚀 Configurando base de datos para Railway...\n');

    // Ejecutar setup de horarios
    console.log('📅 Configurando horarios de trabajo...');
    execSync('node scripts/setup-schedule.js', { stdio: 'inherit' });

    // Crear usuario barbero
    console.log('👤 Creando usuario barbero...');
    execSync('node scripts/force-create-barber.js', { stdio: 'inherit' });

    console.log('\n✅ ¡Configuración completada exitosamente!');
    console.log('🎉 La aplicación está lista para usar en Railway');

  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  }
}

railwaySetup();