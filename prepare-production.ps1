Write-Host "🚀 Preparando para despliegue a producción" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "src\config\endpoints.js")) {
    Write-Host "❌ Error: Debes ejecutar este script desde el directorio frontend" -ForegroundColor Red
    Write-Host "💡 Cambia al directorio: cd 'c:\Users\VR Mideros\Desktop\VR-app\frontend'" -ForegroundColor Yellow
    exit 1
}

Write-Host "1️⃣  Configurando endpoints para producción..." -ForegroundColor Yellow
.\switch-env.ps1 -Environment production

Write-Host ""
Write-Host "2️⃣  Construyendo aplicación para producción..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build completado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "3️⃣  Próximos pasos para desplegar:" -ForegroundColor Yellow
    Write-Host "   • Verifica que el directorio 'dist' se haya creado" -ForegroundColor Gray
    Write-Host "   • Sube los cambios a tu repositorio Git" -ForegroundColor Gray
    Write-Host "   • Netlify detectará automáticamente los cambios" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📁 Archivos listos en: ./dist/" -ForegroundColor Cyan
    
    $choice = Read-Host "¿Quieres abrir el directorio dist? (s/n)"
    if ($choice -eq "s" -or $choice -eq "S") {
        explorer "dist"
    }
} else {
    Write-Host ""
    Write-Host "❌ Error en el build. Revisa los errores arriba." -ForegroundColor Red
    Write-Host "💡 Soluciona los errores antes de desplegar" -ForegroundColor Yellow
}
