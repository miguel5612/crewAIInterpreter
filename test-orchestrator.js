const PlaywrightTestGenerator = require('./playwright-generator');
const ArchetypeManager = require('./archetype-manager');

class TestOrchestrator {
  constructor(apiKey) {
    this.generator = new PlaywrightTestGenerator(apiKey);
    this.archetypeManager = new ArchetypeManager();
  }

  async init() {
    console.log('🎭 Iniciando orquestador de tests...');
    
    // Crear arquetipos si no existen
    await this.archetypeManager.createBaseArchetypes();
    
    // Iniciar el generador principal
    await this.generator.init();
  }

  async processWithArchetypes(csvPath, testCases) {
    console.log('🏗️  Procesando con arquetipos...');
    
    for (const testCase of testCases) {
      // Determinar tipo de arquetipo basado en el escenario
      const archetypeType = this.determineArchetypeType(testCase);
      const archetype = await this.archetypeManager.getArchetypeByType(archetypeType);
      
      if (archetype) {
        console.log(`📋 Usando arquetipo ${archetypeType} para: ${testCase.escenario}`);
        testCase.archetype = archetype;
        testCase.archetypeType = archetypeType;
      }
    }

    return testCases;
  }

  determineArchetypeType(testCase) {
    const scenario = testCase.escenario.toLowerCase();
    const actions = testCase.acciones.toLowerCase();
    
    if (scenario.includes('login') || actions.includes('login') || actions.includes('ingresar')) {
      return 'login';
    }
    
    if (scenario.includes('carrito') || scenario.includes('compra') || scenario.includes('checkout') || 
        actions.includes('carrito') || actions.includes('comprar')) {
      return 'ecommerce';
    }
    
    if (scenario.includes('registro') || scenario.includes('formulario') || 
        actions.includes('completar formulario') || actions.includes('registrar')) {
      return 'form';
    }
    
    if (scenario.includes('responsive') || scenario.includes('móvil') || scenario.includes('mobile')) {
      return 'responsive';
    }
    
    return 'generic';
  }
}

module.exports = TestOrchestrator;
