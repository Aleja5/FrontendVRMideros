// ⚠️ ARCHIVO LEGACY - Usa endpoints.js para nueva funcionalidad
// Configuración de API para compatibilidad con código existente
import { API_CONFIG, getApiUrl } from './endpoints.js';

// Mantener compatibilidad con el código existente
const API_BASE_URL = API_CONFIG.baseURL;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Configuración para diferentes ambientes
export const config = {
  API_URL: API_BASE_URL,
  IS_PRODUCTION: API_CONFIG.environment === 'production',
  IS_DEVELOPMENT: API_CONFIG.environment === 'development',
};

// Helper function para construir URLs de API (legacy)
export const buildApiUrl = (endpoint) => {
  return getApiUrl(endpoint);
};

// URLs comunes para fácil acceso (legacy - usar servicios nuevos)
export const apiUrls = {
  // Auth
  login: getApiUrl('/api/auth/login'),
  register: getApiUrl('/api/auth/register'),
  logout: getApiUrl('/api/auth/logout'),
  resetPassword: getApiUrl('/api/auth/reset'),
  
  // Resources
  operarios: getApiUrl('/api/operarios'),
  maquinas: getApiUrl('/api/maquinas'),
  areas: getApiUrl('/api/areas'),
  procesos: getApiUrl('/api/procesos'),
  insumos: getApiUrl('/api/insumos'),
  produccion: getApiUrl('/api/produccion'),
  jornadas: getApiUrl('/api/jornadas'),
  usuarios: getApiUrl('/api/usuarios'),
};

console.log('📝 Legacy API config loaded. Consider migrating to services/index.js');

export default API_BASE_URL;
