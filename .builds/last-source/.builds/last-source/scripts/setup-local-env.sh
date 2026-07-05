#!/bin/bash

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Configurando variables de entorno locales...${NC}"

# Verificar si el archivo .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creando archivo .env.local...${NC}"
    touch .env.local
fi

# Función para solicitar y validar una variable
solicitar_variable() {
    local nombre=$1
    local valor_actual=$(grep "^$nombre=" .env.local | cut -d '=' -f2-)
    
    if [ -n "$valor_actual" ]; then
        echo -e "${GREEN}Valor actual para $nombre: ${valor_actual:0:10}...${NC}"
        read -p "¿Desea cambiar este valor? (s/n): " cambiar
        if [ "$cambiar" != "s" ]; then
            return
        fi
    fi
    
    read -p "Ingrese el valor para $nombre: " valor
    if [ -n "$valor" ]; then
        # Actualizar o agregar la variable en .env.local
        if grep -q "^$nombre=" .env.local; then
            sed -i '' "s|^$nombre=.*|$nombre=$valor|" .env.local
        else
            echo "$nombre=$valor" >> .env.local
        fi
        echo -e "${GREEN}Variable $nombre configurada correctamente${NC}"
    else
        echo -e "${RED}Error: El valor no puede estar vacío${NC}"
        exit 1
    fi
}

# Solicitar cada variable
solicitar_variable "MONGODB_URI"
solicitar_variable "GOOGLE_OAUTH_CLIENT_ID"
solicitar_variable "GOOGLE_OAUTH_CLIENT_SECRET"
solicitar_variable "GOOGLE_OAUTH_REDIRECT_URI"
solicitar_variable "GEMINI_API_KEY"

# Configurar las variables de entorno
echo -e "${YELLOW}Configurando variables de entorno...${NC}"
export $(cat .env.local | xargs)

echo -e "${GREEN}¡Configuración completada!${NC}"
echo -e "${YELLOW}Las variables de entorno han sido configuradas en .env.local y exportadas al entorno actual.${NC}" 