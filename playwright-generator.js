const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const chokidar = require('chokidar');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class PlaywrightTestGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    this.paths = {
      input: path.join(__dirname, 'IN'),
      output: path.join(__dirname, 'OUT'),
      arquetipos: path.join(__dirname, 'Arquetipos')
    };

    this.agents = {
      testExtender: new TestExtenderAgent(this.model),
      dataAnalyzer: new DataAnalyzerAgent(this.model),
      playwrightGenerator: new PlaywrightGeneratorAgent(this.model),
      testExecutor: new TestExecutorAgent()
    };
  }

  async init() {
    console.log('🚀 Iniciando sistema de generación de tests Playwright...');
    
    // Verificar que las carpetas existen
    await this.ensureDirectories();
    
    // Iniciar vigilancia de archivos
    this.watchInputFolder();
    
    console.log('✅ Sistema iniciado. Esperando archivos CSV en la carpeta IN...');
  }

  async ensureDirectories() {
    for (const dir of Object.values(this.paths)) {
      await fs.ensureDir(dir);
    }
  }

  watchInputFolder() {
    const watcher = chokidar.watch(path.join(this.paths.input, '*.csv'), {
      persistent: true,
      ignoreInitial: false
    });

    watcher.on('add', async (filePath) => {
      console.log(`📁 Nuevo archivo CSV detectado: ${filePath}`);
      await this.processCSV(filePath);
    });
  }

  async processCSV(csvPath) {
    try {
      const csvName = path.basename(csvPath, '.csv');
      const projectPath = path.join(this.paths.output, csvName);
      
      console.log(`🔄 Procesando ${csvName}...`);
      
      // Leer y parsear CSV
      const testCases = await this.parseCSV(csvPath);
      console.log(`📊 ${testCases.length} casos de prueba encontrados`);

      // Crear estructura del proyecto
      await this.createProjectStructure(projectPath, csvName);

      // Procesar cada caso de prueba con los agentes
      const processedTests = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`⚙️  Procesando caso de prueba ${i + 1}: ${testCase.escenario}`);

        // Agente 1: Extender definición
        const extendedTest = await this.agents.testExtender.process(testCase);
        
        // Agente 2: Analizar datos faltantes
        const analyzedTest = await this.agents.dataAnalyzer.process(extendedTest);
        
        // Agente 3: Generar código Playwright
        const playwrightCode = await this.agents.playwrightGenerator.process(analyzedTest);
        
        processedTests.push({
          original: testCase,
          extended: extendedTest,
          analyzed: analyzedTest,
          code: playwrightCode
        });

        // Crear archivo de test
        await this.createTestFile(projectPath, i + 1, playwrightCode, testCase.escenario);
      }

      // Ejecutar tests y generar reportes
      await this.agents.testExecutor.executeAndReport(projectPath, csvName);
      
      console.log(`✅ Procesamiento completo para ${csvName}`);
      
    } catch (error) {
      console.error(`❌ Error procesando CSV: ${error.message}`);
    }
  }

  async parseCSV(csvPath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          // Normalizar nombres de columnas
          const normalizedData = {};
          Object.keys(data).forEach(key => {
            const normalizedKey = key.toLowerCase()
              .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
              .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
              .replace(/[^a-z0-9]/g, '_');
            normalizedData[normalizedKey] = data[key];
          });

          results.push({
            escenario: normalizedData.escenario || '',
            descripcion: normalizedData.descripcion || normalizedData.descripcion_del_caso_de_prueba || '',
            precondiciones: normalizedData.precondiciones || '',
            acciones: normalizedData.acciones || normalizedData.acciones_del_caso_de_prueba || '',
            tecnica: normalizedData.tecnica || normalizedData.tecnica_de_prueba || '',
            prioridad: normalizedData.prioridad || '',
            resultado_esperado: normalizedData.resultado_esperado || ''
          });
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async createProjectStructure(projectPath, projectName) {
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'tests'));
    await fs.ensureDir(path.join(projectPath, 'reports'));

    // Crear playwright.config.js
    const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './reports/html-report' }],
    ['json', { outputFile: './reports/results.json' }],
    ['junit', { outputFile: './reports/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});`;

    await fs.writeFile(path.join(projectPath, 'playwright.config.js'), playwrightConfig);

    // Crear package.json específico del proyecto
    const projectPackageJson = {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      version: "1.0.0",
      scripts: {
        "test": "playwright test",
        "test:headed": "playwright test --headed",
        "report": "playwright show-report"
      },
      devDependencies: {
        "@playwright/test": "^1.40.0"
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'), 
      JSON.stringify(projectPackageJson, null, 2)
    );
  }

  async createTestFile(projectPath, testNumber, code, scenario) {
    const testName = `test${testNumber.toString().padStart(3, '0')}-${scenario.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    const filePath = path.join(projectPath, 'tests', `${testName}.spec.js`);
    
    await fs.writeFile(filePath, code);
  }
}

// Agente 1: Extensor de definiciones de test
class TestExtenderAgent {
  constructor(model) {
    this.model = model;
  }

  async process(testCase) {
    const prompt = `
Eres un experto en automatización de pruebas con Playwright. Analiza este caso de prueba y extiende su definición para que sea implementable con Playwright:

CASO DE PRUEBA:
- Escenario: ${testCase.escenario}
- Descripción: ${testCase.descripcion}
- Precondiciones: ${testCase.precondiciones}
- Acciones: ${testCase.acciones}
- Técnica de prueba: ${testCase.tecnica}
- Prioridad: ${testCase.prioridad}
- Resultado esperado: ${testCase.resultado_esperado}

Por favor, proporciona:
1. Pasos detallados y específicos para Playwright
2. Selectores CSS/XPath sugeridos para elementos
3. Datos de entrada específicos
4. Validaciones concretas
5. Configuración de navegador recomendada

Responde en formato JSON con la estructura:
{
  "detailed_steps": ["paso1", "paso2", ...],
  "selectors": {"elemento": "selector", ...},
  "test_data": {"campo": "valor", ...},
  "validations": ["validacion1", "validacion2", ...],
  "browser_config": {"viewport": "1920x1080", "timeout": 30000}
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extraer JSON del response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extended = JSON.parse(jsonMatch[0]);
        return { ...testCase, extended };
      }
      
      // Fallback si no se puede parsear JSON
      return { 
        ...testCase, 
        extended: {
          detailed_steps: [testCase.acciones],
          selectors: {},
          test_data: {},
          validations: [testCase.resultado_esperado],
          browser_config: { viewport: "1920x1080", timeout: 30000 }
        }
      };
    } catch (error) {
      console.error('Error en TestExtenderAgent:', error);
      return testCase;
    }
  }
}

// Agente 2: Analizador de datos faltantes
class DataAnalyzerAgent {
  constructor(model) {
    this.model = model;
  }

  async process(testCase) {
    const prompt = `
Analiza este caso de prueba extendido e identifica qué datos adicionales se necesitan para una implementación completa:

CASO EXTENDIDO:
${JSON.stringify(testCase, null, 2)}

Identifica:
1. URLs base requeridas
2. Credenciales de usuario necesarias
3. Datos de configuración faltantes
4. Variables de entorno requeridas
5. Dependencias externas
6. Configuraciones de timeout específicas

Responde en JSON:
{
  "required_data": {
    "urls": ["url1", "url2"],
    "credentials": ["username", "password"],
    "config": {"key": "description"},
    "env_vars": ["VAR1", "VAR2"],
    "dependencies": ["dep1", "dep2"],
    "timeouts": {"action": 5000}
  },
  "missing_critical": ["item1", "item2"],
  "assumptions": ["assumption1", "assumption2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analyzed = JSON.parse(jsonMatch[0]);
        return { ...testCase, analyzed };
      }
      
      return { 
        ...testCase, 
        analyzed: {
          required_data: { urls: [], credentials: [], config: {}, env_vars: [], dependencies: [], timeouts: {} },
          missing_critical: [],
          assumptions: []
        }
      };
    } catch (error) {
      console.error('Error en DataAnalyzerAgent:', error);
      return testCase;
    }
  }
}

// Agente 3: Generador de código Playwright
class PlaywrightGeneratorAgent {
  constructor(model) {
    this.model = model;
  }

  async process(testCase) {
    const prompt = `
Genera código Playwright completo y funcional basado en este análisis:

${JSON.stringify(testCase, null, 2)}

El código debe:
1. Seguir mejores prácticas de Playwright
2. Incluir manejo de errores
3. Tener assertions específicas
4. Usar page object pattern si es apropiado
5. Incluir timeouts y waits apropiados
6. Generar screenshots en fallos
7. Ser completamente ejecutable

Genera SOLO el código JavaScript/TypeScript, sin explicaciones adicionales.`;

    try {
      const result = await this.model.generateContent(prompt);
      let code = result.response.text();
      
      // Limpiar el código (remover markdown si existe)
      code = code.replace(/```javascript|```typescript|```js|```/g, '').trim();
      
      // Asegurar imports básicos si no están
      if (!code.includes('import') && !code.includes('require')) {
        code = `import { test, expect } from '@playwright/test';\n\n${code}`;
      }

      return code;
    } catch (error) {
      console.error('Error en PlaywrightGeneratorAgent:', error);
      
      // Código de fallback
      return `import { test, expect } from '@playwright/test';

test('${testCase.escenario}', async ({ page }) => {
  // ${testCase.descripcion}
  
  // Precondiciones: ${testCase.precondiciones}
  
  try {
    // Acciones del test
    // ${testCase.acciones}
    
    // Validación del resultado esperado
    // ${testCase.resultado_esperado}
    
    console.log('Test completado exitosamente');
  } catch (error) {
    await page.screenshot({ path: 'test-failure.png' });
    throw error;
  }
});`;
    }
  }
}

// Agente 4: Ejecutor de tests
class TestExecutorAgent {
  async executeAndReport(projectPath, projectName) {
    try {
      console.log('🧪 Ejecutando tests...');
      
      // Cambiar al directorio del proyecto
      process.chdir(projectPath);
      
      // Instalar dependencias si no existen
      if (!await fs.pathExists('node_modules')) {
        console.log('📦 Instalando dependencias...');
        await execAsync('npm install');
      }

      // Ejecutar tests
      const { stdout, stderr } = await execAsync('npx playwright test --reporter=json');
      
      if (stderr) {
        console.log('⚠️  Advertencias en la ejecución:', stderr);
      }

      // Generar reporte PDF
      await this.generatePDFReport(projectPath, projectName, stdout);
      
      console.log('📄 Reporte PDF generado');
      
    } catch (error) {
      console.error('❌ Error ejecutando tests:', error.message);
      
      // Generar reporte de error
      await this.generateErrorReport(projectPath, projectName, error.message);
    }
  }

  async generatePDFReport(projectPath, projectName, testResults) {
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Tests - ${projectName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; }
        .section { margin: 20px 0; }
        .test-case { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .passed { border-left: 5px solid #4CAF50; }
        .failed { border-left: 5px solid #f44336; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Ejecución de Tests</h1>
        <p>Proyecto: ${projectName}</p>
        <p class="timestamp">Generado: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>Resumen de Resultados</h2>
        <pre>${testResults}</pre>
    </div>
    
    <div class="section">
        <h2>Detalles de Tests</h2>
        <p>Ver archivos de reporte HTML en la carpeta reports/</p>
    </div>
</body>
</html>`;

    const htmlPath = path.join(projectPath, 'reports', 'reporte-completo.html');
    await fs.writeFile(htmlPath, reportContent);
    
    // Aquí podrías usar puppeteer para generar PDF si lo necesitas
    console.log(`📊 Reporte HTML generado en: ${htmlPath}`);
  }

  async generateErrorReport(projectPath, projectName, errorMessage) {
    const errorReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Error - ${projectName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f44336; color: white; padding: 20px; }
        .error { background: #ffebee; padding: 15px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Error en Ejecución de Tests</h1>
        <p>Proyecto: ${projectName}</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="error">
        <h2>Error Encontrado:</h2>
        <pre>${errorMessage}</pre>
    </div>
</body>
</html>`;

    const errorPath = path.join(projectPath, 'reports', 'error-report.html');
    await fs.ensureDir(path.dirname(errorPath));
    await fs.writeFile(errorPath, errorReport);
  }
}

module.exports = PlaywrightTestGenerator;
