import React, { useEffect, useState } from 'react';
import { useApiConnection } from '../hooks/useApi.js';

const ApiConnectionStatus = () => {
    const { 
        isConnected, 
        connectionStatus, 
        lastCheck, 
        responseTime, 
        checkConnection,
        apiUrl,
        environment 
    } = useApiConnection();

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-600 bg-green-100';
            case 'disconnected': return 'text-red-600 bg-red-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'checking': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected': return '🟢';
            case 'disconnected': return '🔴';
            case 'error': return '❌';
            case 'checking': return '🟡';
            default: return '⚪';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Conectado';
            case 'disconnected': return 'Desconectado';
            case 'error': return 'Error';
            case 'checking': return 'Verificando...';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Estado de la API</h3>
                <button
                    onClick={checkConnection}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    disabled={connectionStatus === 'checking'}
                >
                    {connectionStatus === 'checking' ? 'Verificando...' : 'Verificar'}
                </button>
            </div>

            <div className="space-y-2">
                {/* Estado de conexión */}
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor()}`}>
                        {getStatusIcon()} {getStatusText()}
                    </span>
                </div>

                {/* URL de la API */}
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL:</span>
                    <span className="text-sm font-mono text-gray-800 truncate max-w-xs" title={apiUrl}>
                        {apiUrl}
                    </span>
                </div>

                {/* Entorno */}
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Entorno:</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                        environment === 'production' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {environment}
                    </span>
                </div>

                {/* Tiempo de respuesta */}
                {responseTime && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tiempo de respuesta:</span>
                        <span className="text-sm text-gray-800">
                            {responseTime}ms
                        </span>
                    </div>
                )}

                {/* Última verificación */}
                {lastCheck && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Última verificación:</span>
                        <span className="text-sm text-gray-800">
                            {lastCheck.toLocaleTimeString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Mensaje de ayuda */}
            {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <strong>💡 Posibles soluciones:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                        <li>• Verifica tu conexión a internet</li>
                        <li>• El servidor puede estar iniciando (Render tarda ~1 min)</li>
                        <li>• Verifica que la URL del backend sea correcta</li>
                    </ul>
                </div>
            ) : null}
        </div>
    );
};

export default ApiConnectionStatus;
