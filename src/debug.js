// Debug de variables de entorno
console.log('🔍 DEBUG: Variables de entorno cargadas');
console.log('================================');

console.log('📝 Variables VITE disponibles:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);

console.log('\n🌍 Información del entorno:');
console.log('MODE:', import.meta.env.MODE);
console.log('PROD:', import.meta.env.PROD);
console.log('DEV:', import.meta.env.DEV);

console.log('\n🌐 Información del navegador:');
console.log('hostname:', window.location.hostname);
console.log('origin:', window.location.origin);
console.log('protocol:', window.location.protocol);

// Verificar configuración de API
import { API_CONFIG } from './config/endpoints.js';

console.log('\n⚙️ Configuración de API calculada:');
console.log('baseURL:', API_CONFIG.baseURL);
console.log('environment:', API_CONFIG.environment);
console.log('timeout:', API_CONFIG.timeout);

// Test rápido de conectividad
async function testConnection() {
    console.log('\n🚀 Probando conectividad...');
    
    try {
        const response = await fetch(`${API_CONFIG.baseURL}/api/ping`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa:', data);
        } else {
            console.log('❌ Error de conexión:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
    }
}

// Ejecutar test después de un momento
setTimeout(testConnection, 2000);

export { API_CONFIG };
