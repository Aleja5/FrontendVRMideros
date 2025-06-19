import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/endpoints.js';
import { healthService } from '../services/index.js';

/**
 * Hook para monitorear la conectividad con la API
 */
export const useApiConnection = () => {
    const [isConnected, setIsConnected] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [lastCheck, setLastCheck] = useState(null);
    const [responseTime, setResponseTime] = useState(null);

    const checkConnection = async () => {
        try {
            setConnectionStatus('checking');
            const startTime = Date.now();
            
            const result = await healthService.ping();
            const endTime = Date.now();
            
            if (result.status === 'OK') {
                setIsConnected(true);
                setConnectionStatus('connected');
                setResponseTime(endTime - startTime);
            } else {
                setIsConnected(false);
                setConnectionStatus('disconnected');
                setResponseTime(null);
            }
        } catch (error) {
            setIsConnected(false);
            setConnectionStatus('error');
            setResponseTime(null);
            console.warn('API connection check failed:', error.message);
        } finally {
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        // Verificar conexión al montar
        checkConnection();

        // Verificar cada 30 segundos
        const interval = setInterval(checkConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    return {
        isConnected,
        connectionStatus,
        lastCheck,
        responseTime,
        checkConnection,
        apiUrl: API_CONFIG.baseURL,
        environment: API_CONFIG.environment
    };
};

/**
 * Hook para manejar datos de API con estado y error handling
 */
export const useApiData = (apiFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction();
            setData(result);
        } catch (err) {
            setError(err);
            console.error('API data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};

/**
 * Hook para manejar operaciones CRUD con optimistic updates
 */
export const useApiCrud = (service) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await service.getAll();
            setItems(result.data || result);
        } catch (err) {
            setError(err);
            console.error('Fetch items error:', err);
        } finally {
            setLoading(false);
        }
    };

    const createItem = async (itemData) => {
        try {
            setError(null);
            const result = await service.create(itemData);
            const newItem = result.data || result;
            
            // Optimistic update
            setItems(prevItems => [...prevItems, newItem]);
            return newItem;
        } catch (err) {
            setError(err);
            console.error('Create item error:', err);
            throw err;
        }
    };

    const updateItem = async (id, itemData) => {
        try {
            setError(null);
            const result = await service.update(id, itemData);
            const updatedItem = result.data || result;
            
            // Optimistic update
            setItems(prevItems => 
                prevItems.map(item => 
                    item._id === id || item.id === id ? updatedItem : item
                )
            );
            return updatedItem;
        } catch (err) {
            setError(err);
            console.error('Update item error:', err);
            throw err;
        }
    };

    const deleteItem = async (id) => {
        try {
            setError(null);
            await service.delete(id);
            
            // Optimistic update
            setItems(prevItems => 
                prevItems.filter(item => item._id !== id && item.id !== id)
            );
        } catch (err) {
            setError(err);
            console.error('Delete item error:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return {
        items,
        loading,
        error,
        fetchItems,
        createItem,
        updateItem,
        deleteItem
    };
};

export default {
    useApiConnection,
    useApiData,
    useApiCrud
};
