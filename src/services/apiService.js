import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from '../config/endpoints.js';

class ApiService {
    constructor() {
        // Crear instancia de axios con configuración dinámica
        this.client = axios.create({
            baseURL: API_CONFIG.baseURL,
            timeout: API_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Version': 'v1'
            }
        });

        // Variables para manejo de refresh token
        this.isRefreshing = false;
        this.failedQueue = [];

        this.setupInterceptors();
        this.logConfiguration();
    }

    logConfiguration() {
        console.log('🔧 API Service Configuration:', {
            baseURL: API_CONFIG.baseURL,
            environment: API_CONFIG.environment,
            timeout: API_CONFIG.timeout
        });
    }

    setupInterceptors() {
        // Interceptor de request
        this.client.interceptors.request.use(
            (config) => {
                // Agregar token de autenticación
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Log en desarrollo
                if (API_CONFIG.environment === 'development') {
                    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                        headers: config.headers,
                        data: config.data
                    });
                }

                return config;
            },
            (error) => {
                console.error('❌ Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor de response
        this.client.interceptors.response.use(
            (response) => {
                // Log en desarrollo
                if (API_CONFIG.environment === 'development') {
                    console.log(`✅ API Response: ${response.status}`, response.data);
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // Log del error
                console.error('❌ API Error:', {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase()
                });

                // Manejo de token expirado (401)
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        // Si ya se está refrescando, agregar a la cola
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.client(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = this.getRefreshToken();
                        if (refreshToken) {
                            const response = await this.refreshAuthToken(refreshToken);
                            const newToken = response.data.token;
                            
                            this.setToken(newToken);
                            this.processQueue(null, newToken);
                            
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('🔄 Token refresh failed:', refreshError);
                        this.processQueue(refreshError, null);
                        this.handleAuthError();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                // Manejo de otros errores
                if (error.response?.status === 403) {
                    this.handleForbiddenError();
                } else if (error.response?.status >= 500) {
                    this.handleServerError(error);
                }

                return Promise.reject(this.formatError(error));
            }
        );
    }

    processQueue(error, token = null) {
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        
        this.failedQueue = [];
    }

    // Métodos HTTP básicos
    async get(endpoint, config = {}) {
        try {
            const response = await this.client.get(endpoint, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post(endpoint, data = {}, config = {}) {
        try {
            const response = await this.client.post(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async put(endpoint, data = {}, config = {}) {
        try {
            const response = await this.client.put(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async delete(endpoint, config = {}) {
        try {
            const response = await this.client.delete(endpoint, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Métodos de autenticación
    getToken() {
        return localStorage.getItem('production_token') || localStorage.getItem('token');
    }

    getRefreshToken() {
        return localStorage.getItem('production_refresh_token') || localStorage.getItem('refreshToken');
    }

    setToken(token) {
        localStorage.setItem('production_token', token);
        localStorage.setItem('token', token); // Mantener compatibilidad
    }

    setRefreshToken(refreshToken) {
        localStorage.setItem('production_refresh_token', refreshToken);
        localStorage.setItem('refreshToken', refreshToken); // Mantener compatibilidad
    }

    clearTokens() {
        localStorage.removeItem('production_token');
        localStorage.removeItem('production_refresh_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    async refreshAuthToken(refreshToken) {
        return await this.client.post(API_ENDPOINTS.auth.refresh, {
            refresh_token: refreshToken
        });
    }

    // Health checks
    async healthCheck() {
        try {
            return await this.get(API_ENDPOINTS.health.status);
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return { status: 'ERROR', error: error.message };
        }
    }

    async ping() {
        try {
            const startTime = Date.now();
            await this.get(API_ENDPOINTS.health.ping);
            const responseTime = Date.now() - startTime;
            return { status: 'OK', responseTime };
        } catch (error) {
            return { status: 'ERROR', error: error.message };
        }
    }

    // Métodos de manejo de errores
    handleAuthError() {
        this.clearTokens();
        // Redireccionar al login
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    handleForbiddenError() {
        console.warn('🚫 Access forbidden');
        // Opcional: mostrar mensaje de error
        if (window.toast) {
            window.toast.error('No tienes permisos para realizar esta acción');
        }
    }

    handleServerError(error) {
        console.error('🔥 Server Error:', error);
        // Opcional: mostrar notificación de error
        if (window.toast) {
            window.toast.error('Error del servidor. Intente nuevamente en unos momentos.');
        }
    }

    formatError(error) {
        return {
            message: error.response?.data?.message || error.message || 'Error desconocido',
            status: error.response?.status || 500,
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            details: error.response?.data?.error || null
        };
    }

    // Verificar conectividad
    async checkConnectivity() {
        try {
            const result = await this.ping();
            return result.status === 'OK';
        } catch {
            return false;
        }
    }

    // Método para actualizar la configuración dinámicamente
    updateConfig(newConfig) {
        if (newConfig.baseURL) {
            this.client.defaults.baseURL = newConfig.baseURL;
        }
        if (newConfig.timeout) {
            this.client.defaults.timeout = newConfig.timeout;
        }
        console.log('🔄 API configuration updated:', newConfig);
    }
}

// Crear instancia singleton
const apiService = new ApiService();

export default apiService;
