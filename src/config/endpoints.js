// Configuración de API dinámica para todos los entornos
class ApiConfig {
    constructor() {
        // Detectar el entorno automáticamente
        this.environment = this.detectEnvironment();
        this.baseURL = this.getBaseURL();
        this.timeout = this.getTimeout();
        
        console.log(`🌍 Environment detected: ${this.environment}`);
        console.log(`🔗 API Base URL: ${this.baseURL}`);
    }

    detectEnvironment() {
        // La forma más simple y fiable es usar las variables de entorno de Vite.
        return import.meta.env.PROD ? 'production' : 'development';
    }

    getBaseURL() {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        
        // La variable de entorno es la única fuente de verdad.
        if (!apiUrl) {
            // Esto causará un error, lo cual es bueno porque te alerta del problema de configuración.
            console.error("Error Crítico: La variable de entorno VITE_API_BASE_URL no está configurada.");
            // Devolvemos una cadena vacía para que la llamada falle de inmediato y sea obvio el error.
            return ""; 
        }
        
        return apiUrl;
    }

    getTimeout() {
        // Timeout más largo en producción (Render puede tardar en despertar)
        return this.environment === 'production' ? 45000 : 10000;
    }

    // Construir URL completa para un endpoint
    buildUrl(endpoint) {
        // Limpiar endpoint
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        
        return `${cleanBaseURL}${cleanEndpoint}`;
    }

    // Verificar si la API está disponible
    async checkConnection() {
        try {
            const healthUrl = this.buildUrl('/api/health');
            const response = await fetch(healthUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Connection successful:', data.status);
                return true;
            }
            return false;
        } catch (error) {
            console.warn('⚠️ API Connection failed:', error.message);
            return false;
        }
    }
}

// Crear instancia singleton
const apiConfig = new ApiConfig();

// Exportar configuración
export const API_CONFIG = {
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    environment: apiConfig.environment,
    buildUrl: (endpoint) => apiConfig.buildUrl(endpoint),
    checkConnection: () => apiConfig.checkConnection()
};

// Endpoints organizados por módulo
export const API_ENDPOINTS = {
    // Health & Status
    health: {
        status: '/api/health',
        ready: '/api/ready',
        ping: '/api/ping',
        version: '/api/version'
    },

    // Authentication
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        forgotPassword: '/api/auth/forgot',
        resetPassword: '/api/auth/reset',
        verifyEmail: '/api/auth/verify-email'
    },

    // Users Management
    users: {
        list: '/api/usuarios',
        create: '/api/usuarios',
        getById: (id) => `/api/usuarios/${id}`,
        update: (id) => `/api/usuarios/${id}`,
        delete: (id) => `/api/usuarios/${id}`,
        profile: '/api/usuarios/profile',
        changePassword: '/api/usuarios/change-password'
    },

    // Operators (Operarios)
    operators: {
        list: '/api/operarios',
        create: '/api/operarios',
        getById: (id) => `/api/operarios/${id}`,
        update: (id) => `/api/operarios/${id}`,
        delete: (id) => `/api/operarios/${id}`,
        active: '/api/operarios/active',
        search: '/api/operarios/search'
    },

    // Production (Producción)
    production: {
        list: '/api/produccion',
        create: '/api/produccion',
        getById: (id) => `/api/produccion/${id}`,
        update: (id) => `/api/produccion/${id}`,
        delete: (id) => `/api/produccion/${id}`,
        reports: '/api/produccion/reports',
        stats: '/api/produccion/stats',
        byDate: '/api/produccion/by-date',
        byOperator: '/api/produccion/by-operator'
    },

    // Machines (Máquinas)
    machines: {
        list: '/api/maquinas',
        create: '/api/maquinas',
        getById: (id) => `/api/maquinas/${id}`,
        update: (id) => `/api/maquinas/${id}`,
        delete: (id) => `/api/maquinas/${id}`,
        status: '/api/maquinas/status',
        maintenance: '/api/maquinas/maintenance'
    },

    // Areas
    areas: {
        list: '/api/areas',
        create: '/api/areas',
        getById: (id) => `/api/areas/${id}`,
        update: (id) => `/api/areas/${id}`,
        delete: (id) => `/api/areas/${id}`
    },

    // Processes (Procesos)
    processes: {
        list: '/api/procesos',
        create: '/api/procesos',
        getById: (id) => `/api/procesos/${id}`,
        update: (id) => `/api/procesos/${id}`,
        delete: (id) => `/api/procesos/${id}`
    },

    // Supplies (Insumos)
    supplies: {
        list: '/api/insumos',
        create: '/api/insumos',
        getById: (id) => `/api/insumos/${id}`,
        update: (id) => `/api/insumos/${id}`,
        delete: (id) => `/api/insumos/${id}`,
        stock: '/api/insumos/stock',
        lowStock: '/api/insumos/low-stock'
    },

    // Work Shifts (Jornadas)
    workShifts: {
        list: '/api/jornadas',
        create: '/api/jornadas',
        getById: (id) => `/api/jornadas/${id}`,
        update: (id) => `/api/jornadas/${id}`,
        delete: (id) => `/api/jornadas/${id}`,
        current: '/api/jornadas/current',
        byOperator: (operatorId) => `/api/jornadas/operator/${operatorId}`
    },

    // Dashboard
    dashboard: {
        stats: '/api/dashboard/stats',
        charts: '/api/dashboard/charts',
        recent: '/api/dashboard/recent',
        summary: '/api/dashboard/summary'
    },

    // Search & Filters
    search: {
        global: '/api/buscar',
        operators: '/api/buscar/operarios',
        production: '/api/buscar/produccion',
        machines: '/api/buscar/maquinas'
    },

    // Admin
    admin: {
        users: '/api/admin/usuarios',
        settings: '/api/admin/settings',
        logs: '/api/admin/logs',
        backup: '/api/admin/backup',
        restore: '/api/admin/restore'
    }
};

// Helper function para obtener URL completa
export const getApiUrl = (endpoint) => {
    return API_CONFIG.buildUrl(endpoint);
};

// Helper function para endpoints dinámicos
export const buildEndpoint = (template, params = {}) => {
    let endpoint = template;
    
    // Reemplazar parámetros en la template
    Object.keys(params).forEach(key => {
        endpoint = endpoint.replace(`:${key}`, params[key]);
    });
    
    return endpoint;
};

// Verificar conexión al cargar
if (typeof window !== 'undefined') {
    // Solo ejecutar en el navegador
    setTimeout(() => {
        API_CONFIG.checkConnection();
    }, 1000);
}

export default API_CONFIG;
