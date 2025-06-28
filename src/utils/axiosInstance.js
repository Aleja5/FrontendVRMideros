import axios from 'axios';

// Validar que la variable de entorno existe
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) {
    console.error('❌ VITE_API_BASE_URL no está configurada');
    throw new Error('Variable de entorno VITE_API_BASE_URL requerida');
}

// Crear una instancia de Axios
const axiosInstance = axios.create({
    baseURL: `${apiBaseUrl}/api`, // URL base del backend
    timeout: 30000, // Timeout de 30 segundos (aumentado para refresh)
    headers: {
        'Content-Type': 'application/json'
    }
});

// Control de rate limiting
let requestCount = 0;
let resetTime = Date.now();

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

// Resetear contador cada minuto
setInterval(() => {
    requestCount = 0;
    resetTime = Date.now();
}, 60000);

// Interceptor de request para agregar token
axiosInstance.interceptors.request.use(
    (config) => {
        // Rate limiting básico: máximo 100 requests por minuto
        if (requestCount >= 100) {
            const timeToWait = 60000 - (Date.now() - resetTime);
            if (timeToWait > 0) {
                return Promise.reject(new Error(`Rate limit excedido. Espera ${Math.ceil(timeToWait/1000)} segundos.`));
            }
        }
        
        requestCount++;
        const token = localStorage.getItem('token');
        // REMOVED: console.log
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Agregar cache-busting si no está presente y es un GET request
        if (config.method === 'get' && !config.params?.t) {
            config.params = {
                ...config.params,
                t: Date.now()
            };
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta para manejar errores de autenticación y rate limiting
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Manejar errores de rate limiting (429)
        if (error.response?.status === 429) {
            console.error('❌ Error 429: Demasiadas solicitudes');
            const retryAfter = error.response.headers['retry-after'];
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
            
            // REMOVED: console.log
            await new Promise(resolve => setTimeout(resolve, delay));
            return axiosInstance(originalRequest);
        }

        // Manejar token expirado o inválido (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Si ya está refrescando, esperar en cola
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                processQueue(error, null);
                
                // Limpiar datos y redirigir
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('operario');
                localStorage.removeItem('idOperario');
                
                // REMOVED: console.log
                window.location.href = '/login';
                
                return Promise.reject(new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'));
            }

        try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { token: newToken, refreshToken: newRefreshToken } = response.data;
                
                // Actualizar tokens en localStorage
                localStorage.setItem('token', newToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                // Actualizar header de la petición original
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                processQueue(null, newToken);
                
                // REMOVED: console.log
                
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // Limpiar tokens inválidos
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('operario');
                localStorage.removeItem('idOperario');
                
                // REMOVED: console.log
                window.location.href = '/login';
                
                return Promise.reject(new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'));
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;