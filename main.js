const PlaywrightTestGenerator = require('./playwright-generator');
const path = require('path');

// Configuración
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'tu-api-key-aqui';

async function main() {
  try {
    console.log('🤖 Iniciando sistema CrewAI + Playwright');
    
    if (GEMINI_API_KEY === 'tu-api-key-aqui') {
      console.error('❌ Por favor configura tu GEMINI_API_KEY en las variables de entorno');
      console.log('💡 Puedes hacerlo con: set GEMINI_API_KEY=tu-clave-real');
      process.exit(1);
    }

    const generator = new PlaywrightTestGenerator(GEMINI_API_KEY);
    await generator.init();

    // Mantener el proceso activo
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo el sistema...');
      process.exit(0);
    });

    // Mensaje de ayuda
    console.log('\n📋 INSTRUCCIONES DE USO:');
    console.log('1. Coloca tus archivos CSV en la carpeta IN/');
    console.log('2. El sistema procesará automáticamente cada archivo');
    console.log('3. Los proyectos Playwright se generarán en OUT/');
    console.log('4. Los reportes se guardarán en cada proyecto');
    console.log('\n💡 Presiona Ctrl+C para detener el sistema');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Iniciar el sistema
main();
