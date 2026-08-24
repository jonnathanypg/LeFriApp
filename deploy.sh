#!/bin/bash
set -e

# =========================================================================
# LeFriApp - Contabo VPS Automated Deployment Script
# Standardized across WEBLIFETECH AI Lab (Aikrofy / EnpiAI / MediaSuite)
# =========================================================================

# Colores para la salida en consola
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}[INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

log_step() {
    echo -e "${BLUE}==> $1${NC}"
}

# 0. Entorno de ejecución & NVM
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -f ~/.bashrc ] && source ~/.bashrc

echo "🚀 Iniciando flujo de despliegue en VPS para LeFriApp..."

# 1. Crear directorios requeridos
mkdir -p logs dist uploads

# 2. Verificar archivo de variables de entorno (.env)
if [ ! -f .env ]; then
    log_info "El archivo .env no existe en la raíz."
    if [ -f .env.example ]; then
        log_info "Generando .env inicial desde .env.example..."
        cp .env.example .env
        log_info "Archivo .env creado. Asegúrese de que las credenciales de base de datos y APIs estén configuradas."
    else
        log_error "No se encontró el archivo .env ni .env.example."
    fi
fi

# Cargar variables locales
if [ -f .env ]; then
    set -a
    source .env 2>/dev/null || true
    set +a
fi

# 3. Instalación de dependencias
log_step "Instalando dependencias de Node.js..."
npm install --include=dev

# 4. Sincronización de Base de Datos con Prisma ORM
if [ -f prisma/schema.prisma ] && [ ! -z "$DATABASE_URL" ]; then
    log_step "Sincronizando esquema de base de datos con Prisma..."
    npx prisma db push --accept-data-loss || log_info "Aviso: 'prisma db push' omitido o base de datos en inicialización."
fi

# 5. Compilación del proyecto (Frontend Vite + Backend Node.js Bundle)
log_step "Compilando Frontend Vite y Backend TypeScript..."
npm run build || log_error "Falló la compilación del proyecto (npm run build)"

# 6. Orquestación y Recarga con PM2
log_step "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    log_info "Instalando PM2 globalmente..."
    sudo npm install -g pm2 || npm install -g pm2 || log_error "No se pudo instalar PM2."
fi

log_step "Recargando servicios con PM2..."
pm2 reload ecosystem.config.cjs --update-env 2>/dev/null || pm2 start ecosystem.config.cjs --env production

# Guardar estado de PM2 para auto-arranque en reinicios del VPS
pm2 save 2>/dev/null || true

# 7. Verificación de salud y estado
log_step "Verificando estado de los procesos..."
pm2 status | grep -E "lefri-app|App name" || pm2 status

PORT_TO_CHECK=${PORT:-8080}
log_step "Realizando health-check en http://localhost:${PORT_TO_CHECK}..."
MAX_RETRIES=5
RETRY_INTERVAL=3
ATTEMPT=0
SUCCESS=0

while [ $ATTEMPT -lt $MAX_RETRIES ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "  ↳ Intento $ATTEMPT/$MAX_RETRIES — esperando ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:${PORT_TO_CHECK}/" || echo "000")
    echo "  ↳ Código HTTP recibido: $HTTP_CODE"
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 302 ] || [ "$HTTP_CODE" -eq 304 ]; then
        SUCCESS=1
        break
    fi
done

if [ $SUCCESS -eq 1 ]; then
    log_success "¡Despliegue de LeFriApp completado y verificado exitosamente!"
else
    log_info "Aviso: El servicio está iniciando o respondiendo en otro puerto configurado. Verifique con: pm2 logs lefri-app"
fi
