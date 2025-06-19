// Ejemplos de uso de los nuevos endpoints y servicios

// ================================
// 1. IMPORTAR SERVICIOS
// ================================

// Importar servicios específicos
import { 
    auth, 
    operators, 
    production, 
    dashboard,
    health 
} from '../services/index.js';

// O importar servicio base
import apiService from '../services/apiService.js';

// Importar hooks personalizados
import { useApiConnection, useApiData, useApiCrud } from '../hooks/useApi.js';

// ================================
// 2. EJEMPLOS EN COMPONENTES REACT
// ================================

// Ejemplo 1: Login con manejo de errores
const LoginExample = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await auth.login(email, password);
            
            if (response.success) {
                console.log('✅ Login exitoso:', response.data.user);
                // Redireccionar al dashboard
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('❌ Error de login:', error.message);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required 
            />
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required 
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
        </form>
    );
};

// Ejemplo 2: Lista de operarios con hook personalizado
const OperatorsList = () => {
    const { 
        items: operators, 
        loading, 
        error, 
        createItem: createOperator,
        updateItem: updateOperator,
        deleteItem: deleteOperator 
    } = useApiCrud(operators);

    const handleCreate = async () => {
        try {
            await createOperator({
                nombre: 'Nuevo Operario',
                cedula: '12345678',
                area: 'Producción'
            });
            alert('✅ Operario creado exitosamente');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    if (loading) return <div>Cargando operarios...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h2>Lista de Operarios</h2>
            <button onClick={handleCreate}>Crear Operario</button>
            
            <ul>
                {operators.map(operator => (
                    <li key={operator._id}>
                        {operator.nombre} - {operator.cedula}
                        <button onClick={() => updateOperator(operator._id, { ...operator, nombre: 'Actualizado' })}>
                            Editar
                        </button>
                        <button onClick={() => deleteOperator(operator._id)}>
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Ejemplo 3: Dashboard con múltiples datos
const DashboardExample = () => {
    const { data: stats, loading: statsLoading } = useApiData(() => dashboard.getStats());
    const { data: charts, loading: chartsLoading } = useApiData(() => dashboard.getCharts());
    const { data: recent, loading: recentLoading } = useApiData(() => dashboard.getRecent());

    if (statsLoading || chartsLoading || recentLoading) {
        return <div>Cargando dashboard...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            
            {/* Estadísticas */}
            <section>
                <h2>Estadísticas</h2>
                {stats && (
                    <div>
                        <p>Total Operarios: {stats.totalOperators}</p>
                        <p>Producción Hoy: {stats.todayProduction}</p>
                        <p>Máquinas Activas: {stats.activeMachines}</p>
                    </div>
                )}
            </section>

            {/* Gráficos */}
            <section>
                <h2>Gráficos</h2>
                {charts && (
                    <div>
                        {/* Renderizar gráficos aquí */}
                        <pre>{JSON.stringify(charts, null, 2)}</pre>
                    </div>
                )}
            </section>

            {/* Actividad Reciente */}
            <section>
                <h2>Actividad Reciente</h2>
                {recent && recent.map(activity => (
                    <div key={activity._id}>
                        <p>{activity.description} - {new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </section>
        </div>
    );
};

// Ejemplo 4: Componente de estado de conexión
const ConnectionStatus = () => {
    const { 
        isConnected, 
        connectionStatus, 
        responseTime, 
        apiUrl,
        environment,
        checkConnection 
    } = useApiConnection();

    return (
        <div style={{ 
            padding: '10px', 
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
            border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '5px',
            margin: '10px 0'
        }}>
            <h3>Estado de la API</h3>
            <p>Estado: {connectionStatus}</p>
            <p>URL: {apiUrl}</p>
            <p>Entorno: {environment}</p>
            {responseTime && <p>Tiempo de respuesta: {responseTime}ms</p>}
            <button onClick={checkConnection}>Verificar Conexión</button>
        </div>
    );
};

// ================================
// 3. EJEMPLOS DE USO DIRECTO
// ================================

// Ejemplo 5: Función para obtener datos de producción con filtros
const getProductionData = async (filters = {}) => {
    try {
        // Con parámetros de filtro
        const productionData = await production.getAll({
            startDate: filters.startDate,
            endDate: filters.endDate,
            operatorId: filters.operatorId,
            machineId: filters.machineId
        });

        console.log('📊 Datos de producción:', productionData);
        return productionData;
    } catch (error) {
        console.error('❌ Error obteniendo producción:', error);
        throw error;
    }
};

// Ejemplo 6: Buscar operarios
const searchOperators = async (query) => {
    try {
        const results = await operators.search(query);
        console.log('🔍 Resultados de búsqueda:', results);
        return results;
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        return [];
    }
};

// Ejemplo 7: Health check manual
const checkApiHealth = async () => {
    try {
        const healthStatus = await health.getStatus();
        console.log('🏥 Estado de salud de la API:', healthStatus);
        
        if (healthStatus.status === 'OK') {
            console.log('✅ API funcionando correctamente');
        } else {
            console.warn('⚠️ API con problemas:', healthStatus);
        }
        
        return healthStatus;
    } catch (error) {
        console.error('❌ API no disponible:', error);
        return null;
    }
};

// ================================
// 4. CONFIGURACIÓN INICIAL
// ================================

// Ejemplo 8: Verificar configuración al iniciar la app
const initializeApp = async () => {
    console.log('🚀 Inicializando aplicación...');
    
    // Verificar conexión con la API
    const isHealthy = await checkApiHealth();
    
    if (!isHealthy) {
        console.warn('⚠️ API no disponible al iniciar');
        // Mostrar mensaje al usuario o modo offline
        return false;
    }
    
    // Verificar autenticación existente
    const token = localStorage.getItem('production_token');
    if (token) {
        try {
            // Validar token con el servidor
            await apiService.get('/api/auth/validate');
            console.log('✅ Sesión válida encontrada');
        } catch (error) {
            console.log('⚠️ Token inválido, limpiando sesión');
            apiService.clearTokens();
        }
    }
    
    console.log('✅ Aplicación inicializada correctamente');
    return true;
};

// ================================
// 5. MANEJO DE ERRORES GLOBALES
// ================================

// Ejemplo 9: Error boundary para API
const handleApiError = (error, context = 'API') => {
    console.error(`❌ Error en ${context}:`, error);
    
    // Manejar diferentes tipos de errores
    switch (error.status) {
        case 401:
            console.log('🔐 Error de autenticación, redirigiendo al login');
            apiService.clearTokens();
            window.location.href = '/login';
            break;
            
        case 403:
            console.log('🚫 Sin permisos para esta acción');
            alert('No tienes permisos para realizar esta acción');
            break;
            
        case 404:
            console.log('🔍 Recurso no encontrado');
            break;
            
        case 500:
            console.log('🔥 Error del servidor');
            alert('Error del servidor. Intenta nuevamente en unos momentos.');
            break;
            
        default:
            console.log('❓ Error desconocido');
            alert(`Error: ${error.message}`);
    }
};

// ================================
// EXPORT PARA USO EN OTROS ARCHIVOS
// ================================

export {
    LoginExample,
    OperatorsList,
    DashboardExample,
    ConnectionStatus,
    getProductionData,
    searchOperators,
    checkApiHealth,
    initializeApp,
    handleApiError
};
