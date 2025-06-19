import axios from 'axios';
import productionConfig from '../config/production.js';

class ApiClient {
    constructor() {
        this.baseURL = productionConfig.api.baseURL;
        this.timeout = productionConfig.api.timeout;
        
        // Crear instancia de axios
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Version': 'v1'
            }
        });

        // Configurar interceptores
        this.setupInterceptors();
    }

    /**
     * Configurar interceptores de request y response
     */
    setupInterceptors() {
        // Interceptor de request - agregar token de autenticación
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Log en desarrollo
                if (productionConfig.development.enableLogs) {
                    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                        headers: config.headers,
                        data: config.data
                    });
                }

                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor de response - manejo de errores globales
        this.client.interceptors.response.use(
            (response) => {
                // Log en desarrollo
                if (productionConfig.development.enableLogs) {
                    console.log(`✅ API Response: ${response.status}`, response.data);
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // Log del error
                console.error('API Error:', {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    url: error.config?.url,
                    method: error.config?.method
                });

                // Manejo de token expirado
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = this.getRefreshToken();
                        if (refreshToken) {
                            const response = await this.refreshAuthToken(refreshToken);
                            const newToken = response.data.token;
                            
                            this.setToken(newToken);
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        this.handleAuthError();
                        return Promise.reject(refreshError);
                    }
                }

                // Manejo de errores específicos
                if (error.response?.status === 403) {
                    this.handleForbiddenError();
                } else if (error.response?.status >= 500) {
                    this.handleServerError(error);
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Realizar petición GET
     */
    async get(url, config = {}) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Realizar petición POST
     */
    async post(url, data = {}, config = {}) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Realizar petición PUT
     */
    async put(url, data = {}, config = {}) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Realizar petición DELETE
     */
    async delete(url, config = {}) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Health check del API
     */
    async healthCheck() {
        try {
            const response = await this.get(productionConfig.api.endpoints.health.status);
            return response;
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'ERROR', error: error.message };
        }
    }

    /**
     * Ping rápido al servidor
     */
    async ping() {
        try {
            const startTime = Date.now();
            await this.get(productionConfig.api.endpoints.health.ping);
            const responseTime = Date.now() - startTime;
            return { status: 'OK', responseTime };
        } catch (error) {
            return { status: 'ERROR', error: error.message };
        }
    }

    /**
     * Refrescar token de autenticación
     */
    async refreshAuthToken(refreshToken) {
        return await this.client.post(productionConfig.api.endpoints.auth.refresh, {
            refresh_token: refreshToken
        });
    }

    /**
     * Obtener token del localStorage
     */
    getToken() {
        return localStorage.getItem(productionConfig.auth.tokenKey);
    }

    /**
     * Obtener refresh token del localStorage
     */
    getRefreshToken() {
        return localStorage.getItem(productionConfig.auth.refreshTokenKey);
    }

    /**
     * Guardar token en localStorage
     */
    setToken(token) {
        localStorage.setItem(productionConfig.auth.tokenKey, token);
    }

    /**
     * Guardar refresh token en localStorage
     */
    setRefreshToken(refreshToken) {
        localStorage.setItem(productionConfig.auth.refreshTokenKey, refreshToken);
    }

    /**
     * Limpiar tokens de autenticación
     */
    clearTokens() {
        localStorage.removeItem(productionConfig.auth.tokenKey);
        localStorage.removeItem(productionConfig.auth.refreshTokenKey);
        localStorage.removeItem(productionConfig.auth.userKey);
    }

    /**
     * Manejar errores de autenticación
     */
    handleAuthError() {
        this.clearTokens();
        window.location.href = productionConfig.redirects.unauthorized;
    }

    /**
     * Manejar errores de permisos
     */
    handleForbiddenError() {
        window.location.href = productionConfig.redirects.forbidden;
    }

    /**
     * Manejar errores del servidor
     */
    handleServerError(error) {
        console.error('Server Error:', error);
        // Opcional: mostrar notificación de error
        if (window.toast) {
            window.toast.error('Error del servidor. Intente nuevamente.');
        }
    }

    /**
     * Procesar y formatear errores
     */
    handleError(error) {
        const processedError = {
            message: error.response?.data?.message || error.message || 'Error desconocido',
            status: error.response?.status || 500,
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            details: error.response?.data?.error || null
        };

        return processedError;
    }

    /**
     * Verificar conectividad
     */
    async checkConnectivity() {
        try {
            const result = await this.ping();
            return result.status === 'OK';
        } catch {
            return false;
        }
    }
}

// Crear instancia singleton
const apiClient = new ApiClient();

export default apiClient;
