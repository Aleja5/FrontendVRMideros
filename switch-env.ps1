param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "production")]
    [string]$Environment
)

Write-Host "🔄 Cambiando configuración de endpoints a: $Environment" -ForegroundColor Yellow

if ($Environment -eq "local") {
    # Copiar configuración local
    if (Test-Path ".env.local") {
        Copy-Item ".env.local" ".env"
        Write-Host "✅ Configurado para desarrollo local (localhost:3000)" -ForegroundColor Green
    } else {
        # Crear .env para desarrollo local
        @"
# Configuración para desarrollo local
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Archivo .env creado para desarrollo local" -ForegroundColor Green
    }
} else {
    # Copiar configuración de producción
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env"
        Write-Host "✅ Configurado para producción" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Archivo .env.production no encontrado" -ForegroundColor Yellow
    }
}

Write-Host "📝 Configuración de entorno actualizada" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor White
if ($Environment -eq "local") {
    Write-Host "1. Ejecutar: npm run dev (en el frontend)" -ForegroundColor Gray
    Write-Host "2. Ejecutar: npm run dev (en el backend)" -ForegroundColor Gray
    Write-Host "3. Abrir: http://localhost:5173" -ForegroundColor Gray
} else {
    Write-Host "1. Ejecutar: npm run build" -ForegroundColor Gray
    Write-Host "2. Desplegar los cambios" -ForegroundColor Gray
}
