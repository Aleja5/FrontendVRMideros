// Configuración para entorno de producción (Vercel)
const productionConfig = {
    // URL del backend en Render
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://vr-mideros-backend.onrender.com',
    
    // Configuración de la aplicación
    app: {
        name: 'Production Management System',
        version: '1.0.0',
        environment: 'production'
    },

    // Configuración de API
    api: {
        baseURL: import.meta.env.VITE_API_BASE_URL || 'https://vr-mideros-backend.onrender.com',
        timeout: 30000, // 30 segundos
        retries: 3,
        endpoints: {
            // Authentication
            auth: {
                login: '/api/auth/login',
                register: '/api/auth/register',
                refresh: '/api/auth/refresh',
                logout: '/api/auth/logout',
                forgot: '/api/auth/forgot',
                reset: '/api/auth/reset'
            },
            // Health checks
            health: {
                status: '/api/health',
                ping: '/api/ping',
                version: '/api/version'
            },
            // Users
            users: {
                base: '/api/users',
                profile: '/api/users/profile',
                password: '/api/users/password'
            },
            // Production
            production: {
                base: '/api/production',
                reports: '/api/production/reports',
                stats: '/api/production/stats'
            },
            // Operators
            operators: {
                base: '/api/operators',
                active: '/api/operators/active'
            },
            // Areas
            areas: {
                base: '/api/areas'
            },
            // Machines
            machines: {
                base: '/api/machines',
                status: '/api/machines/status'
            },
            // Dashboard
            dashboard: {
                stats: '/api/dashboard/stats',
                charts: '/api/dashboard/charts',
                recent: '/api/dashboard/recent'
            }
        }
    },

    // Configuración de autenticación
    auth: {
        tokenKey: 'production_token',
        refreshTokenKey: 'production_refresh_token',
        userKey: 'production_user',
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
        refreshExpiry: 7 * 24 * 60 * 60 * 1000 // 7 días
    },

    // Configuración de cache
    cache: {
        enabled: true,
        prefix: 'prod_cache_',
        ttl: 5 * 60 * 1000, // 5 minutos
        keys: {
            user: 'user_data',
            dashboard: 'dashboard_data',
            areas: 'areas_list',
            operators: 'operators_list'
        }
    },

    // Configuración de UI
    ui: {
        theme: {
            primary: '#3B82F6',
            secondary: '#64748B',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#06B6D4'
        },
        pagination: {
            defaultPageSize: 10,
            pageSizeOptions: [5, 10, 20, 50]
        },
        animations: {
            enabled: true,
            duration: 300
        }
    },

    // Configuración de notificaciones
    notifications: {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    },

    // Configuración de desarrollo/debugging
    development: {
        enableLogs: process.env.NODE_ENV !== 'production',
        enableMockData: false,
        enablePerformanceMonitoring: true,
        enableErrorBoundary: true
    },

    // URLs de redirección
    redirects: {
        afterLogin: '/',
        afterLogout: '/login',
        unauthorized: '/login',
        forbidden: '/403',
        notFound: '/404',
        error: '/500'
    },

    // Configuración de PWA
    pwa: {
        enabled: true,
        name: 'Production Management',
        shortName: 'ProdMgmt',
        description: 'Sistema de Gestión de Producción',
        themeColor: '#3B82F6',
        backgroundColor: '#FFFFFF'
    }
};

export default productionConfig;

//TODO: ESTE ARCHIVO NO SE ESTA USANDO, SE DEBE ELIMINAR Y REFACTORIZAR EL CODIGO PARA QUE USE LAS VARIABLES DE ENTORNO DE VITE 
/*
import axios from 'axios';

const instance = axios.create({
        baseURL: process.env.VITE_API_BASE_URL || 'https://your-backend.onrender.com',
        // otros configuraciones de axios
});

export default instance;
*/
