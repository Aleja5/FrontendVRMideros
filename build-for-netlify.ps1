#!/usr/bin/env pwsh
# Script de build para Netlify

Write-Host "🚀 Iniciando build para Netlify..." -ForegroundColor Green

# Verificar que Node.js está instalado
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar que npm está instalado
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}

# Mostrar versiones
Write-Host "📦 Versión de Node.js: $(node --version)" -ForegroundColor Blue
Write-Host "📦 Versión de npm: $(npm --version)" -ForegroundColor Blue

# Limpiar cache de npm
Write-Host "🧹 Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force

# Instalar dependencias
Write-Host "📥 Instalando dependencias..." -ForegroundColor Yellow
npm ci

# Ejecutar build
Write-Host "🔨 Ejecutando build..." -ForegroundColor Yellow
npm run build

# Verificar que la carpeta dist existe
if (Test-Path "dist") {
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
    Write-Host "📁 Archivos generados en ./dist/" -ForegroundColor Blue
} else {
    Write-Host "❌ Build falló - no se generó la carpeta dist" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Listo para despliegue en Netlify!" -ForegroundColor Green
