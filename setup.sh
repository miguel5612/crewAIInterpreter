#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║          Sistema CrewAI + Playwright                 ║"
echo "║      Generador Automático de Tests                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Función para mostrar progreso
show_progress() {
    echo -e "${YELLOW}⏳ $1...${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js
if ! command -v node &> /dev/null; then
    show_error "Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar NPM
if ! command -v npm &> /dev/null; then
    show_error "NPM no está disponible"
    exit 1
fi

show_success "Node.js y NPM detectados"

# Instalar dependencias
show_progress "Instalando dependencias de Node.js"
npm install
if [ $? -ne 0 ]; then
    show_error "Error instalando dependencias"
    exit 1
fi
show_success "Dependencias instaladas correctamente"

# Instalar navegadores de Playwright
show_progress "Instalando navegadores de Playwright"
npx playwright install
if [ $? -ne 0 ]; then
    show_error "Error instalando navegadores de Playwright"
    exit 1
fi
show_success "Navegadores de Playwright instalados"

# Crear arquetipos
show_progress "Generando arquetipos base"
node -e "
const ArchetypeManager = require('./archetype-manager');
const manager = new ArchetypeManager();
manager.createBaseArchetypes()
  .then(() => console.log('Arquetipos creados'))
  .catch(err => {
    console.error('Error creando arquetipos:', err);
    process.exit(1);
  });
"
show_success "Arquetipos base creados"

# Verificar estructura de directorios
show_progress "Verificando estructura de directorios"
for dir in "IN" "OUT" "Arquetipos"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "  • Creado directorio $dir"
    fi
done
show_success "Estructura de directorios verificada"

# Crear archivo de configuración si no existe
if [ ! -f ".env" ]; then
    show_progress "Creando archivo de configuración"
    cp config.env .env
    show_success "Archivo .env creado (recuerda configurar tu GEMINI_API_KEY)"
else
    show_success "Archivo de configuración ya existe"
fi

echo -e "\n${GREEN}🎉 ¡CONFIGURACIÓN COMPLETA!${NC}\n"

echo -e "${BLUE}📋 PRÓXIMOS PASOS:${NC}"
echo -e "1. ${YELLOW}Configurar API Key de Gemini:${NC}"
echo -e "   ${BLUE}export GEMINI_API_KEY=tu-clave-aqui${NC}"
echo -e "   ${BLUE}# O editar el archivo .env${NC}"
echo ""
echo -e "2. ${YELLOW}Iniciar el sistema:${NC}"
echo -e "   ${BLUE}npm start${NC}               # Versión básica"
echo -e "   ${BLUE}npm run start:advanced${NC}   # Versión avanzada con más features"
echo ""
echo -e "3. ${YELLOW}Colocar archivos CSV en:${NC}"
echo -e "   ${BLUE}./IN/${NC}"
echo ""
echo -e "4. ${YELLOW}Revisar resultados en:${NC}"
echo -e "   ${BLUE}./OUT/[nombre-proyecto]/${NC}"
echo ""

echo -e "${BLUE}🔧 COMANDOS ÚTILES:${NC}"
echo -e "  ${BLUE}npm run clean${NC}        # Limpiar carpeta OUT"
echo -e "  ${BLUE}npm run validate${NC}     # Verificar validador"
echo -e "  ${BLUE}npm run dev${NC}          # Modo debug"
echo ""

echo -e "${YELLOW}⚡ ARCHIVO DE EJEMPLO INCLUIDO:${NC}"
echo -e "   ${BLUE}./IN/ejemplo-tests.csv${NC}"
echo ""

echo -e "${GREEN}🚀 ¡Listo para generar tests automáticamente!${NC}"
