const TestOrchestrator = require('./test-orchestrator');
const ReportGenerator = require('./report-generator');
require('dotenv').config({ path: './config.env' });

// Configuración desde variables de entorno
const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || 'tu-api-key-aqui',
  logLevel: process.env.LOG_LEVEL || 'info',
  debugMode: process.env.DEBUG_MODE === 'true',
  useArchetypes: process.env.USE_ARCHEOTYPES !== 'false'
};

// Logger simple
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  debug: (msg) => config.debugMode && console.log(`🐛 ${msg}`)
};

async function main() {
  try {
    logger.info('Iniciando Sistema Avanzado CrewAI + Playwright');
    
    // Validar configuración
    if (config.geminiApiKey === 'tu-api-key-aqui' || !config.geminiApiKey) {
      logger.error('GEMINI_API_KEY no configurada correctamente');
      logger.info('Configura tu clave con: set GEMINI_API_KEY=tu-clave-real');
      logger.info('O edita el archivo config.env');
      process.exit(1);
    }

    // Crear instancia del orquestador
    const orchestrator = new TestOrchestrator(config.geminiApiKey);
    
    // Configurar el generador de reportes
    orchestrator.generator.reportGenerator = new ReportGenerator();
    
    // Inicializar sistema
    await orchestrator.init();

    logger.success('Sistema iniciado correctamente');
    
    // Información de ayuda
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SISTEMA CREWAI + PLAYWRIGHT ACTIVO');
    console.log('='.repeat(60));
    console.log('📋 INSTRUCCIONES:');
    console.log('  1. Coloca archivos CSV en: IN/');
    console.log('  2. Los proyectos se generan en: OUT/');
    console.log('  3. Reportes ejecutivos en: OUT/[proyecto]/reports/');
    console.log('  4. Arquetipos disponibles en: Arquetipos/');
    console.log('');
    console.log('🔧 CONFIGURACIÓN ACTUAL:');
    console.log(`  • Modelo AI: ${process.env.GEMINI_MODEL || 'gemini-pro'}`);
    console.log(`  • Navegador: ${process.env.PLAYWRIGHT_BROWSER || 'chromium'}`);
    console.log(`  • Modo headless: ${process.env.PLAYWRIGHT_HEADLESS || 'false'}`);
    console.log(`  • Usar arquetipos: ${config.useArchetypes}`);
    console.log('');
    console.log('🎯 CASOS DE PRUEBA SOPORTADOS:');
    console.log('  • Login/Autenticación');
    console.log('  • E-commerce/Carrito');
    console.log('  • Formularios/Registros');
    console.log('  • Diseño Responsivo');
    console.log('  • Navegación/Menús');
    console.log('  • Búsquedas');
    console.log('  • Casos genéricos');
    console.log('');
    console.log('💡 Para detener el sistema: Ctrl+C');
    console.log('='.repeat(60));

    // Mantener proceso activo
    process.on('SIGINT', () => {
      logger.info('Deteniendo sistema...');
      logger.success('Sistema detenido correctamente');
      process.exit(0);
    });

    // Procesar archivo de ejemplo si existe
    setTimeout(async () => {
      const exampleFile = require('path').join(__dirname, 'IN', 'ejemplo-tests.csv');
      if (await require('fs-extra').pathExists(exampleFile)) {
        logger.info('Archivo de ejemplo detectado. Procesando automáticamente...');
        logger.info('Puedes observar el proceso en tiempo real.');
      }
    }, 2000);

  } catch (error) {
    logger.error(`Error fatal: ${error.message}`);
    if (config.debugMode) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Promesa rechazada no manejada: ${reason}`);
  if (config.debugMode) {
    console.error('Promise:', promise);
  }
});

process.on('uncaughtException', (error) => {
  logger.error(`Excepción no capturada: ${error.message}`);
  if (config.debugMode) {
    console.error(error.stack);
  }
  process.exit(1);
});

// Iniciar aplicación
main();
