#!/bin/bash

# Script para configurar el entorno de desarrollo local
# Este script NO debe subirse al repositorio

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Configurando entorno de desarrollo local...${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.${NC}"
    exit 1
fi

# Verificar si existe el archivo .env.local
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: No se encontró el archivo .env.local${NC}"
    echo -e "${YELLOW}Por favor, crea un archivo .env.local con las siguientes variables:${NC}"
    echo "MONGODB_URI=tu_uri_mongodb"
    echo "GOOGLE_OAUTH_CLIENT_ID=tu_client_id"
    echo "GOOGLE_OAUTH_CLIENT_SECRET=tu_client_secret"
    echo "GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5000/api/auth/google/callback"
    echo "GEMINI_API_KEY=tu_api_key"
    exit 1
fi

# Cargar variables desde .env.local
source .env.local

# Verificar que las variables se configuraron correctamente
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}Error: La variable $1 no está configurada en .env.local${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Variable $1 configurada${NC}"
    fi
}

check_env_var "MONGODB_URI"
check_env_var "GOOGLE_OAUTH_CLIENT_ID"
check_env_var "GOOGLE_OAUTH_CLIENT_SECRET"
check_env_var "GOOGLE_OAUTH_REDIRECT_URI"
check_env_var "GEMINI_API_KEY"

echo -e "${GREEN}✓ Entorno local configurado exitosamente${NC}"
echo -e "${YELLOW}Para iniciar el servidor de desarrollo, ejecuta: npm run dev${NC}"
