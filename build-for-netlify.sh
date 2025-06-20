#!/bin/bash
# Script de build para Netlify

echo "🚀 Iniciando build para Netlify..."

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Mostrar versiones
echo "📦 Versión de Node.js: $(node --version)"
echo "📦 Versión de npm: $(npm --version)"

# Limpiar cache de npm
echo "🧹 Limpiando cache de npm..."
npm cache clean --force

# Instalar dependencias
echo "📥 Instalando dependencias..."
npm ci

# Ejecutar build
echo "🔨 Ejecutando build..."
npm run build

# Verificar que la carpeta dist existe
if [ -d "dist" ]; then
    echo "✅ Build completado exitosamente"
    echo "📁 Archivos generados en ./dist/"
else
    echo "❌ Build falló - no se generó la carpeta dist"
    exit 1
fi

echo "🎉 Listo para despliegue en Netlify!"
