// Script de diagnóstico para verificar conectividad con el backend en producción
const BACKEND_URL = 'https://vrmiderosbackend.onrender.com';

console.log('🔍 Iniciando diagnóstico de conectividad...');
console.log('🌐 Backend URL:', BACKEND_URL);

// Función para verificar cada endpoint
async function checkEndpoint(path, description) {
    try {
        console.log(`\n📡 Verificando ${description}...`);
        console.log(`URL: ${BACKEND_URL}${path}`);
        
        const startTime = Date.now();
        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Respuesta exitosa:', data);
            return { success: true, data, responseTime, status: response.status };
        } else {
            const errorText = await response.text();
            console.log('❌ Error en respuesta:', errorText);
            return { success: false, error: errorText, responseTime, status: response.status };
        }
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return { success: false, error: error.message };
    }
}

// Función principal de diagnóstico
async function runDiagnostic() {
    console.log('🚀 Ejecutando diagnóstico completo...\n');
    
    const endpoints = [
        { path: '/api/health', description: 'Health Check' },
        { path: '/api/ping', description: 'Ping' },
        { path: '/api/status', description: 'Status' },
        { path: '/api/version', description: 'Version' },
        { path: '/api/auth/login', description: 'Login Endpoint (OPTIONS)' }
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
        results[endpoint.path] = await checkEndpoint(endpoint.path, endpoint.description);
        // Esperar un poco entre requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Resumen de resultados
    console.log('\n📋 RESUMEN DE DIAGNÓSTICO:');
    console.log('=' * 50);
    
    let successCount = 0;
    let totalCount = 0;
    
    for (const [path, result] of Object.entries(results)) {
        totalCount++;
        if (result.success) {
            successCount++;
            console.log(`✅ ${path}: OK (${result.responseTime}ms)`);
        } else {
            console.log(`❌ ${path}: FAILED - ${result.error}`);
        }
    }
    
    console.log(`\n📊 Resultado: ${successCount}/${totalCount} endpoints funcionando`);
    
    if (successCount === 0) {
        console.log('\n🚨 PROBLEMA DETECTADO:');
        console.log('• El backend en Render no está respondiendo');
        console.log('• Posibles causas:');
        console.log('  - El servicio está durmiendo (common en plan gratuito)');
        console.log('  - Error en el despliegue');
        console.log('  - Problemas de configuración');
        console.log('\n💡 SOLUCIONES:');
        console.log('• Visita https://vrmiderosbackend.onrender.com/api/health en el navegador');
        console.log('• Revisa los logs en el dashboard de Render');
        console.log('• Verifica las variables de entorno');
    } else if (successCount < totalCount) {
        console.log('\n⚠️ FUNCIONAMIENTO PARCIAL:');
        console.log('• Algunos endpoints fallan');
        console.log('• Revisa la configuración de rutas en el backend');
    } else {
        console.log('\n🎉 TODO FUNCIONANDO CORRECTAMENTE!');
        console.log('• El backend está disponible');
        console.log('• Todos los endpoints responden');
    }
    
    return results;
}

// Función para verificar CORS
async function checkCORS() {
    console.log('\n🌐 Verificando configuración CORS...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/ping`, {
            method: 'OPTIONS',
            headers: {
                'Origin': window.location.origin,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        console.log('📊 CORS Status:', response.status);
        console.log('🔧 CORS Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            console.log('✅ CORS configurado correctamente');
        } else {
            console.log('❌ Problema con CORS');
        }
        
    } catch (error) {
        console.log('❌ Error verificando CORS:', error.message);
    }
}

// Exportar funciones para uso en consola
window.backendDiagnostic = {
    runDiagnostic,
    checkEndpoint,
    checkCORS,
    BACKEND_URL
};

// Ejecutar diagnóstico automáticamente
runDiagnostic().then(() => {
    checkCORS();
    console.log('\n🛠️ Para ejecutar nuevamente: backendDiagnostic.runDiagnostic()');
});

console.log('📝 Funciones disponibles en consola:');
console.log('• backendDiagnostic.runDiagnostic() - Ejecutar diagnóstico completo');
console.log('• backendDiagnostic.checkCORS() - Verificar CORS');
console.log('• backendDiagnostic.checkEndpoint(path, desc) - Verificar endpoint específico');
