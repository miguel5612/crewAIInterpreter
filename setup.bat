@echo off
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║          Sistema CrewAI + Playwright                 ║
echo  ║      Generador Automático de Tests                   ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

echo [92m⚡ Iniciando configuración del sistema...[0m
echo.

REM Verificar Node.js
echo [93m🔍 Verificando Node.js...[0m
node --version >nul 2>&1
if errorlevel 1 (
    echo [91m❌ Node.js no está instalado[0m
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo [92m✅ Node.js detectado[0m

REM Verificar NPM
echo [93m🔍 Verificando NPM...[0m
npm --version >nul 2>&1
if errorlevel 1 (
    echo [91m❌ NPM no está disponible[0m
    pause
    exit /b 1
)
echo [92m✅ NPM detectado[0m

echo.
echo [93m📦 Instalando dependencias de Node.js...[0m
call npm install
if errorlevel 1 (
    echo [91m❌ Error instalando dependencias[0m
    pause
    exit /b 1
)
echo [92m✅ Dependencias instaladas correctamente[0m

echo.
echo [93m🎭 Instalando navegadores de Playwright...[0m
call npx playwright install
if errorlevel 1 (
    echo [91m❌ Error instalando navegadores de Playwright[0m
    pause
    exit /b 1
)
echo [92m✅ Navegadores de Playwright instalados[0m

echo.
echo [93m📁 Generando arquetipos base...[0m
node -e "const ArchetypeManager = require('./archetype-manager'); const manager = new ArchetypeManager(); manager.createBaseArchetypes().then(() => console.log('Arquetipos creados')).catch(err => { console.error('Error:', err); process.exit(1); });"
if errorlevel 1 (
    echo [91m❌ Error creando arquetipos[0m
    pause
    exit /b 1
)
echo [92m✅ Arquetipos base creados[0m

echo.
echo [93m🗂️  Verificando estructura de directorios...[0m
if not exist "IN" mkdir IN
if not exist "OUT" mkdir OUT  
if not exist "Arquetipos" mkdir Arquetipos
echo [92m✅ Estructura de directorios verificada[0m

echo.
echo [93m⚙️  Configurando archivos...[0m
if not exist ".env" (
    copy config.env .env >nul
    echo [92m✅ Archivo .env creado[0m
    echo [93m⚠️  Recuerda configurar tu GEMINI_API_KEY en .env[0m
) else (
    echo [92m✅ Archivo de configuración ya existe[0m
)

echo.
echo [92m🎉 ¡CONFIGURACIÓN COMPLETA![0m
echo.
echo [96m📋 PRÓXIMOS PASOS:[0m
echo.
echo [93m1. Configurar API Key de Gemini:[0m
echo    [94mset GEMINI_API_KEY=tu-clave-aqui[0m
echo    [94m# O editar el archivo .env[0m
echo.
echo [93m2. Iniciar el sistema:[0m
echo    [94mnpm start[0m               [90m# Versión básica[0m
echo    [94mnpm run start:advanced[0m   [90m# Versión avanzada[0m
echo.
echo [93m3. Colocar archivos CSV en:[0m
echo    [94m.\IN\[0m
echo.
echo [93m4. Revisar resultados en:[0m
echo    [94m.\OUT\[nombre-proyecto]\[0m
echo.
echo [96m🔧 COMANDOS ÚTILES:[0m
echo  [94mnpm run clean[0m        [90m# Limpiar carpeta OUT[0m
echo  [94mnpm run validate[0m     [90m# Verificar validador[0m
echo  [94mnpm run dev[0m          [90m# Modo debug[0m
echo.
echo [93m⚡ ARCHIVO DE EJEMPLO INCLUIDO:[0m
echo    [94m.\IN\ejemplo-tests.csv[0m
echo.
echo [92m🚀 ¡Listo para generar tests automáticamente![0m
echo.
echo [93mPresiona cualquier tecla para continuar...[0m
pause >nul
