#!/bin/bash

# =========================================================================
# LeFriApp - Production Deployment Script (PM2 Orchestrated)
# =========================================================================

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 1. Instalar dependencias del sistema operativo (Node.js, npm, git) si no existen
log_info "Verificando dependencias del sistema (Node.js & npm)..."

if ! command -v node &> /dev/null; then
    log_info "Node.js no está instalado. Intentando instalar..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        NODE_MAJOR=20
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        sudo apt-get update && sudo apt-get install nodejs -y || log_error "No se pudo instalar Node.js con apt-get"
    elif command -v yum &> /dev/null; then
        curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs || log_error "No se pudo instalar Node.js con yum"
    elif command -v brew &> /dev/null; then
        brew install node@20 || log_error "No se pudo instalar Node.js con Homebrew"
    else
        log_error "No se pudo detectar el gestor de paquetes (apt, yum, brew). Instale Node.js 18+ manualmente y vuelva a ejecutar."
    fi
else
    log_success "Node.js detectado: $(node -v)"
fi

# 2. Verificar variables de entorno (.env)
if [ ! -f .env ]; then
    log_info "El archivo .env no existe en la raíz."
    if [ -f .env.example ]; then
        log_info "Creando archivo .env a partir de .env.example..."
        cp .env.example .env
        log_info "Se ha creado el archivo .env. Por favor edítalo con las credenciales correctas antes de continuar."
    else
        log_error "No se encontró el archivo .env ni .env.example."
    fi
fi

# Cargar variables locales para verificación rápida
if [ -f .env ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # Ignorar comentarios y líneas vacías
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue
        export "$line"
    done < .env
fi

# Validar variables de entorno críticas en producción
log_info "Validando variables de entorno críticas..."
[ -z "$DATABASE_URL" ] && log_info "Aviso: DATABASE_URL no configurada en .env, asegúrese de que esté correcta antes de iniciar."
[ -z "$MONGODB_URI" ] && log_info "Aviso: MONGODB_URI no configurado en .env (requerido para sesiones de WhatsApp)."
[ -z "$GEMINI_API_KEY" ] && log_info "Aviso: GEMINI_API_KEY no configurado."

# 3. Instalar dependencias del proyecto y compilar el servidor principal
log_info "Instalando dependencias de npm para LeFriApp..."
npm install --include=dev || log_error "Error al instalar dependencias de npm"

# Ejecutar migraciones de Prisma si se usa MySQL
if [ -f prisma/schema.prisma ] && [ ! -z "$DATABASE_URL" ]; then
    log_info "Ejecutando migraciones de base de datos con Prisma..."
    npx prisma db push --accept-data-loss || log_info "Advertencia: Falló 'prisma db push' o no hay base de datos activa aún."
fi

log_info "Compilando cliente y servidor principal..."
npm run build || log_error "Error al compilar el servidor principal (npm run build)"

# 4. Lanzar o recargar procesos con PM2
log_info "Verificando si PM2 está instalado..."
if ! command -v pm2 &> /dev/null; then
    log_info "PM2 no está instalado globalmente. Instalándolo..."
    sudo npm install -g pm2 || npm install -g pm2 || log_error "No se pudo instalar PM2. Intente ejecutar 'npm install -g pm2' manualmente con permisos de administrador."
fi

log_info "Iniciando/Actualizando los servicios en PM2..."
pm2 startOrReload ecosystem.config.cjs --env production || log_error "Error al iniciar/actualizar servicios en PM2"

log_info "Guardando la configuración de procesos en PM2 para auto-inicio..."
pm2 save || log_info "No se pudo guardar el volcado de procesos de PM2"

# 5. Mostrar estado final
log_success "¡Despliegue completado exitosamente!"
pm2 status
