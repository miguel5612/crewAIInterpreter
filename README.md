# Sistema de Generación Automática de Tests Playwright con CrewAI

Sistema automatizado que procesa archivos CSV con casos de prueba y genera proyectos completos de Playwright con tests ejecutables.

## 🚀 Características

- **Monitoreo automático**: Detecta nuevos archivos CSV en la carpeta IN/
- **Múltiples agentes IA**: 
  - Extensor de definiciones de test
  - Analizador de datos faltantes  
  - Generador de código Playwright
  - Ejecutor de tests y reportes
- **Proyectos completos**: Genera estructura completa de Playwright por cada CSV
- **Reportes automáticos**: Ejecuta tests y genera reportes en PDF/HTML
- **Integración Gemini**: Utiliza Google Gemini AI para procesamiento inteligente

## 📁 Estructura del Proyecto

```
pruebaCrewAI/
├── IN/              # Carpeta para archivos CSV de entrada
├── OUT/             # Carpeta donde se generan los proyectos Playwright
├── Arquetipos/      # Carpeta para arquetipos y templates
├── main.js          # Archivo principal del sistema
├── playwright-generator.js  # Lógica principal y agentes
└── package.json     # Dependencias del proyecto
```

## 🔧 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Instalar Playwright**:
```bash
npm run install-playwright
```

3. **Configurar API Key de Gemini**:
```bash
# Windows
set GEMINI_API_KEY=tu-clave-de-gemini-aqui

# Linux/Mac
export GEMINI_API_KEY=tu-clave-de-gemini-aqui
```

## 📊 Formato del CSV

El CSV debe contener las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| escenario | Nombre del escenario de prueba |
| descripcion | Descripción detallada del caso de prueba |
| precondiciones | Condiciones previas necesarias |
| acciones | Acciones a realizar en el test |
| tecnica | Técnica de prueba aplicada |
| prioridad | Prioridad del caso de prueba |
| resultado_esperado | Resultado esperado del test |

### Ejemplo de CSV:

```csv
escenario,descripcion,precondiciones,acciones,tecnica,prioridad,resultado_esperado
Login exitoso,Verificar login con credenciales válidas,Usuario registrado,Ingresar email y password válidos,Funcional,Alta,Usuario logueado correctamente
Búsqueda producto,Buscar producto en catálogo,Página principal cargada,Escribir nombre del producto y hacer clic en buscar,Funcional,Media,Lista de productos mostrada
```

## 🎯 Uso

1. **Iniciar el sistema**:
```bash
npm start
```

2. **Agregar archivos CSV**: Coloca tus archivos CSV en la carpeta `IN/`

3. **Procesamiento automático**: El sistema:
   - Detecta el nuevo archivo
   - Procesa cada línea del CSV
   - Genera código Playwright
   - Crea proyecto completo
   - Ejecuta tests
   - Genera reportes

4. **Revisar resultados**: Los proyectos generados estarán en `OUT/nombre-del-csv/`

## 🤖 Agentes del Sistema

### 1. TestExtenderAgent
- Analiza casos de prueba básicos
- Extiende definiciones para ser implementables en Playwright
- Sugiere selectores y datos específicos

### 2. DataAnalyzerAgent  
- Identifica datos faltantes para implementación completa
- Analiza dependencias y configuraciones necesarias
- Sugiere variables de entorno requeridas

### 3. PlaywrightGeneratorAgent
- Genera código Playwright funcional y completo
- Implementa mejores prácticas
- Incluye manejo de errores y assertions

### 4. TestExecutorAgent
- Ejecuta los tests generados
- Crea reportes HTML y PDF
- Maneja errores de ejecución

## 📈 Estructura del Proyecto Generado

Cada CSV genera un proyecto con:

```
OUT/nombre-del-csv/
├── tests/           # Tests generados (.spec.js)
├── reports/         # Reportes de ejecución
├── playwright.config.js  # Configuración de Playwright
└── package.json     # Dependencias del proyecto
```

## 🔍 Características Avanzadas

- **Detección inteligente** de elementos web
- **Generación automática** de selectores
- **Manejo de errores** robusto  
- **Screenshots** automáticos en fallos
- **Reportes detallados** con métricas
- **Configuración adaptativa** por proyecto

## 🛠️ Troubleshooting

### Error: API Key no configurada
```bash
set GEMINI_API_KEY=tu-clave-real
```

### Error: Playwright no instalado
```bash
npm run install-playwright
```

### Error: Dependencias faltantes
```bash
npm install
```

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios  
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

## 🆘 Soporte

Para soporte y preguntas:
- Crear un issue en el repositorio
- Revisar la documentación de Playwright
- Consultar la documentación de Google Gemini AI
