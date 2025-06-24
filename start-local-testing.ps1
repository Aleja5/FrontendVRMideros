Write-Host "🚀 Iniciando entorno de testing local VR-app" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "src\config\endpoints.js")) {
    Write-Host "❌ Error: Debes ejecutar este script desde el directorio frontend" -ForegroundColor Red
    Write-Host "💡 Cambia al directorio: cd 'c:\Users\VR Mideros\Desktop\VR-app\frontend'" -ForegroundColor Yellow
    exit 1
}

# Verificar configuración del backend
Write-Host "🔍 Verificando configuración del backend..." -ForegroundColor Yellow
$backendEnvPath = "..\backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "⚠️  No se encuentra .env en el backend" -ForegroundColor Yellow
    $setupBackend = Read-Host "¿Quieres configurar las variables de entorno del backend ahora? (s/n)"
    if ($setupBackend -eq "s" -or $setupBackend -eq "S") {
        Set-Location "..\backend"
        .\setup-env.ps1
        Set-Location "..\frontend"
    }
} else {
    # Verificar si las variables críticas están configuradas
    $envContent = Get-Content $backendEnvPath -Raw
    if ($envContent -match "MONGO_URI=.*tu_.*" -or $envContent -match "MONGO_URI=mongodb://localhost") {
        Write-Host "⚠️  MONGO_URI del backend no está configurado correctamente" -ForegroundColor Yellow
        Write-Host "💡 Ejecuta: cd ..\backend && .\setup-env.ps1" -ForegroundColor Gray
    } else {
        Write-Host "✅ Backend configurado correctamente" -ForegroundColor Green
    }
}

Write-Host "📋 Pasos a seguir:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣  Configurando endpoints para localhost..." -ForegroundColor Yellow
.\switch-env.ps1 -Environment local

Write-Host ""
Write-Host "2️⃣  Instrucciones para iniciar los servidores:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   BACKEND (Terminal 1):" -ForegroundColor Cyan
Write-Host "   cd 'c:\Users\VR Mideros\Desktop\VR-app\backend'" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   ⚡ Servidor backend en: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "   FRONTEND (Terminal 2):" -ForegroundColor Cyan  
Write-Host "   cd 'c:\Users\VR Mideros\Desktop\VR-app\frontend'" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   ⚡ Aplicación frontend en: http://localhost:5173" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  URLs para testing:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔧 Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   ❤️  Health Check: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "   🧪 Diagnostics: http://localhost:5173/diagnostic.html" -ForegroundColor Cyan
Write-Host ""

Write-Host "4️⃣  Después de probar tus cambios:" -ForegroundColor Yellow
Write-Host "   Para volver a producción ejecuta:" -ForegroundColor Gray
Write-Host "   .\switch-env.ps1 -Environment production" -ForegroundColor Gray
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Consejos para testing:" -ForegroundColor Green
Write-Host "   • Abre las DevTools (F12) para ver errores en consola" -ForegroundColor Gray
Write-Host "   • Revisa la pestaña Network para ver requests fallidos" -ForegroundColor Gray
Write-Host "   • Prueba todas las funcionalidades críticas" -ForegroundColor Gray
Write-Host "   • Verifica que el login funcione correctamente" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "¿Quieres que abra automáticamente las URLs? (s/n)"
if ($choice -eq "s" -or $choice -eq "S") {
    Write-Host "🌐 Abriendo URLs..." -ForegroundColor Green
    Start-Process "http://localhost:5173"
    Start-Process "http://localhost:3000/api/health"
}

Write-Host ""
Write-Host "✅ Configuración lista! Ahora inicia los servidores en terminales separadas." -ForegroundColor Green
