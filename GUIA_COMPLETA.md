# Guía Completa del Sistema CrewAI + Playwright

## 🎯 Descripción General

Este sistema automatiza completamente la generación de tests Playwright a partir de archivos CSV que contienen casos de prueba. Utiliza múltiples agentes de IA (CrewAI) con Google Gemini para procesar, analizar y generar código de testing funcional.

### 🏗️ Arquitectura del Sistema

```
Sistema CrewAI + Playwright
│
├── 📁 Entrada de Datos
│   ├── Monitoreo automático de CSV
│   ├── Validación de estructura
│   └── Normalización de datos
│
├── 🤖 Agentes IA (CrewAI)
│   ├── TestExtenderAgent: Extiende definiciones básicas
│   ├── DataAnalyzerAgent: Identifica datos faltantes
│   ├── PlaywrightGeneratorAgent: Genera código funcional
│   └── TestExecutorAgent: Ejecuta y reporta
│
├── 📋 Arquetipos
│   ├── Login/Autenticación
│   ├── E-commerce/Carrito
│   ├── Formularios/Registros
│   └── Diseño Responsivo
│
└── 📊 Reportes
    ├── Reportes ejecutivos HTML
    ├── Validación de CSV
    └── Métricas de ejecución
```

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática (Recomendada)

**Windows:**
```bash
.\setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores Playwright
npx playwright install

# 3. Crear arquetipos
npm run setup

# 4. Configurar API Key
set GEMINI_API_KEY=tu-clave-de-gemini-aqui
```

## 📊 Formato del CSV

### Estructura Requerida

| Columna | Requerido | Descripción | Ejemplo |
|---------|-----------|-------------|---------|
| `escenario` | ✅ | Nombre del caso de prueba | "Login exitoso" |
| `descripcion` | ⚠️ | Descripción detallada | "Verificar login con credenciales válidas" |
| `precondiciones` | ⚠️ | Condiciones previas | "Usuario registrado en sistema" |
| `acciones` | ✅ | Pasos a ejecutar | "1. Navegar a login 2. Ingresar datos 3. Hacer clic" |
| `tecnica` | ⚠️ | Técnica de prueba | "Funcional", "E2E", "Regresión" |
| `prioridad` | ⚠️ | Nivel de prioridad | "Alta", "Media", "Baja", "Crítica" |
| `resultado_esperado` | ✅ | Resultado esperado | "Usuario logueado correctamente" |

### Ejemplo Completo de CSV

```csv
escenario,descripcion,precondiciones,acciones,tecnica,prioridad,resultado_esperado
Login exitoso,Verificar login con credenciales válidas,Usuario registrado,1. Navegar a /login 2. Completar email 3. Completar password 4. Clic en Ingresar,Funcional,Alta,Usuario redirigido a dashboard
Búsqueda producto,Buscar producto en catálogo,Página principal cargada,1. Clic en buscador 2. Escribir 'laptop' 3. Presionar Enter,Funcional,Media,Lista de laptops mostrada
Agregar carrito,Añadir producto al carrito,Producto visible en página,1. Clic en producto 2. Seleccionar cantidad 3. Clic Agregar Carrito,E2E,Alta,Producto agregado y contador actualizado
```

## 🎮 Uso del Sistema

### 1. Iniciar el Sistema

**Versión Básica:**
```bash
npm start
```

**Versión Avanzada (Recomendada):**
```bash
npm run start:advanced
```

### 2. Procesar Archivos CSV

1. **Colocar archivos:** Arrastra tu CSV a la carpeta `IN/`
2. **Procesamiento automático:** El sistema detecta y procesa automáticamente
3. **Generación:** Se crea un proyecto completo en `OUT/nombre-csv/`
4. **Ejecución:** Los tests se ejecutan automáticamente
5. **Reportes:** Se generan reportes HTML y JSON

### 3. Estructura Generada

Por cada CSV se genera:

```
OUT/
└── nombre-csv/
    ├── tests/
    │   ├── test001-login-exitoso.spec.js
    │   ├── test002-busqueda-producto.spec.js
    │   └── test003-agregar-carrito.spec.js
    ├── reports/
    │   ├── reporte-ejecutivo.html
    │   ├── validacion-csv.html
    │   ├── html-report/
    │   └── results.json
    ├── playwright.config.js
    └── package.json
```

## 🤖 Agentes del Sistema

### 1. TestExtenderAgent
**Función:** Convierte descripciones básicas en especificaciones detalladas para Playwright

**Entrada:**
```csv
escenario: Login exitoso
acciones: Ingresar email y password
```

**Salida:**
```json
{
  "detailed_steps": [
    "Navegar a página de login",
    "Esperar que el formulario sea visible", 
    "Completar campo email con datos válidos",
    "Completar campo password",
    "Hacer clic en botón de login",
    "Esperar redirección"
  ],
  "selectors": {
    "email_input": "[data-testid='email']",
    "password_input": "[data-testid='password']", 
    "login_button": "[data-testid='login-btn']"
  },
  "test_data": {
    "valid_email": "user@example.com",
    "valid_password": "password123"
  }
}
```

### 2. DataAnalyzerAgent
**Función:** Identifica datos faltantes y dependencias necesarias

**Análisis:**
- URLs base requeridas
- Credenciales de prueba
- Variables de entorno
- Dependencias externas
- Configuraciones de timeout

### 3. PlaywrightGeneratorAgent
**Función:** Genera código Playwright funcional y optimizado

**Código Generado:**
```javascript
import { test, expect } from '@playwright/test';

test('Login exitoso', async ({ page }) => {
  // Navegar a página de login
  await page.goto('/login');
  
  // Completar formulario
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  
  // Hacer clic en login
  await page.click('[data-testid="login-btn"]');
  
  // Verificar redirección exitosa
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
});
```

### 4. TestExecutorAgent
**Función:** Ejecuta tests y genera reportes comprehensivos

**Capacidades:**
- Ejecución paralela de tests
- Captura de screenshots en fallos
- Generación de videos
- Reportes HTML interactivos
- Métricas detalladas

## 📋 Arquetipos Disponibles

### Login/Autenticación
```javascript
// Maneja casos de:
- Login exitoso/fallido
- Recuperación de password
- Registro de usuarios
- Validación de campos
```

### E-commerce
```javascript
// Maneja casos de:
- Búsqueda de productos
- Agregar/quitar del carrito
- Proceso de checkout
- Gestión de wishlist
```

### Formularios
```javascript
// Maneja casos de:
- Validación de formularios
- Envío de datos
- Campos requeridos
- Formatos específicos
```

### Responsive Design
```javascript
// Maneja casos de:
- Diferentes viewports
- Navegación móvil
- Adaptación de contenido
- Touch interactions
```

## 📊 Reportes Generados

### 1. Reporte Ejecutivo
- **Ubicación:** `OUT/[proyecto]/reports/reporte-ejecutivo.html`
- **Contenido:** Métricas generales, distribución de resultados, recomendaciones

### 2. Validación CSV
- **Ubicación:** `OUT/[proyecto]/reports/validacion-csv.html`
- **Contenido:** Errores de formato, advertencias, recomendaciones de mejora

### 3. Reporte Playwright Nativo
- **Ubicación:** `OUT/[proyecto]/reports/html-report/`
- **Contenido:** Reporte detallado con screenshots, traces, videos

## 🔧 Configuración Avanzada

### Variables de Entorno (config.env)

```env
# IA Configuration
GEMINI_API_KEY=tu-clave-aqui
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.3

# Playwright Configuration  
PLAYWRIGHT_BASE_URL=http://localhost:3000
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_TIMEOUT=30000

# Test Configuration
DEFAULT_TEST_TIMEOUT=60000
PARALLEL_EXECUTION=false
RETRY_FAILED_TESTS=2

# Report Configuration
REPORT_FORMAT=html,json
REPORT_INCLUDE_SCREENSHOTS=true
REPORT_DETAILED_LOGS=true
```

### Configuración de Proyecto Específico

Cada proyecto generado incluye su propio `playwright.config.js` optimizado:

```javascript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: './reports/html-report' }],
    ['json', { outputFile: './reports/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
```

## 🛠️ Comandos Útiles

```bash
# Gestión del sistema
npm start                    # Iniciar versión básica
npm run start:advanced       # Iniciar versión avanzada
npm run setup               # Configuración inicial completa

# Utilidades
npm run clean               # Limpiar carpeta OUT
npm run validate            # Verificar validador CSV  
npm run dev                 # Modo debug con inspector

# Testing
npm test                    # Ejecutar tests de ejemplo
npm run test:headed         # Ejecutar con navegador visible
```

## 🔍 Debugging y Troubleshooting

### Problemas Comunes

**1. Error de API Key**
```bash
❌ GEMINI_API_KEY no configurada

Solución:
set GEMINI_API_KEY=tu-clave-real
# O editar config.env
```

**2. Playwright no instalado**
```bash
❌ Error: browserType.launch: Executable doesn't exist

Solución:
npx playwright install
```

**3. CSV mal formateado**
```bash
❌ Error procesando CSV: campos requeridos faltantes

Solución:
- Verificar que tenga las columnas: escenario, acciones, resultado_esperado
- Usar el validador: npm run validate
```

**4. Tests fallan por selectores**
```bash
❌ TimeoutError: Locator not found

Solución:
- Los selectores generados son estimaciones
- Ajustar selectores en el código generado
- Usar data-testid en tu aplicación
```

### Modo Debug

```bash
# Activar logs detallados
set DEBUG_MODE=true

# Ejecutar en modo desarrollo
npm run dev

# Ver logs de agentes IA
set LOG_LEVEL=debug
```

## 🎯 Mejores Prácticas

### 1. Preparación de CSV
- **Ser específico:** Describir acciones paso a paso
- **Usar nombres descriptivos:** Escenarios claros y únicos
- **Incluir datos de ejemplo:** Emails, URLs, valores específicos
- **Definir pre-condiciones:** Estado inicial necesario

### 2. Optimización de Tests
- **Usar data-testid:** Facilita la generación de selectores estables
- **Organizar por flujos:** Agrupar casos relacionados
- **Definir datos de prueba:** Usuarios, productos, configuraciones

### 3. Mantenimiento
- **Revisar código generado:** Ajustar selectores si es necesario
- **Actualizar arquetipos:** Crear patrones específicos para tu app
- **Monitorear reportes:** Identificar patrones de fallos

## 🔮 Roadmap y Mejoras Futuras

### Versión 2.0 (Planeada)
- [ ] Soporte para múltiples idiomas
- [ ] Integración con CI/CD
- [ ] Arquetipos personalizables por proyecto
- [ ] Generación de datos de prueba automática
- [ ] Soporte para APIs REST/GraphQL

### Versión 1.5 (En desarrollo)
- [ ] Validación avanzada de CSV
- [ ] Modo interactivo de configuración
- [ ] Templates de proyectos
- [ ] Integración con Jira/Azure DevOps

## 📞 Soporte y Comunidad

### Recursos
- **Documentación:** Este archivo README.md
- **Ejemplos:** Carpeta `IN/ejemplo-tests.csv`
- **Arquetipos:** Carpeta `Arquetipos/`

### Contribuir
1. Fork del proyecto
2. Crear branch para feature
3. Implementar mejoras
4. Enviar Pull Request

### Reportar Issues
- Incluir CSV de ejemplo
- Especificar configuración del sistema
- Adjuntar logs de error
- Describir comportamiento esperado vs actual

---

**¡Sistema CrewAI + Playwright - Automatización Inteligente de Testing! 🚀**

*Generado automáticamente por el sistema CrewAI*
