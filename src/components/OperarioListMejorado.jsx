// frontend/src/components/OperarioListMejorado.jsx
import React from 'react';
import { Pencil, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

import ConfirmacionEliminar from './ConfirmacionEliminar';
import { useEliminarConIntegridad } from '../hooks/useEliminarConIntegridad';

/**
 * Componente mejorado de lista de operarios con sistema de integridad referencial
 */
const OperarioListMejorado = ({ operarios, onEditar, onActualizar, cargando = false }) => {
    
    // Hook para manejar eliminaciones con integridad
    const {
        mostrarConfirmacion,
        entidadAEliminar,
        eliminando,
        iniciarEliminacion,
        cancelarEliminacion,
        confirmarEliminacion,
        verificarIntegridad,
        propsConfirmacion
    } = useEliminarConIntegridad('operario', (operarioEliminado) => {
        // Callback ejecutado después de eliminación exitosa
        toast.success(`Operario ${operarioEliminado.name} eliminado exitosamente`);
        
        // Actualizar la lista
        if (onActualizar) {
            onActualizar();
        }
    });

    const handleEliminar = (operario) => {
        iniciarEliminacion(operario);
    };

    const handleEditar = (operario) => {
        if (onEditar) {
            onEditar(operario);
        }
    };

        if (cargando) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando operarios...</span>
            </div>
        );
    }

        if (!operarios || operarios.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">No hay operarios registrados</h3>
                <p className="mt-1 text-sm text-gray-500">Comience agregando un nuevo operario</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header con información de protección */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">
                            Lista Protegida - Verificación de Integridad Activa
                        </span>
                    </div>
                    <div className="text-xs text-blue-700">
                        {operarios.length} operario{operarios.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Tabla */}
                        <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Operario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cédula
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {operarios.map((operario) => (
                            <OperarioRow
                                key={operario._id || operario.id}
                                operario={operario}
                                onEditar={() => handleEditar(operario)}
                                onEliminar={() => handleEliminar(operario)}
                                eliminando={eliminando && entidadAEliminar?._id === operario._id}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de confirmación de eliminación */}
            <ConfirmacionEliminar {...propsConfirmacion} />
        </div>
    );
};

/**
 * Componente para cada fila de operario
 */
const OperarioRow = ({ operario, onEditar, onEliminar, eliminando }) => {
    return (
        <tr className={`hover:bg-gray-50 transition-colors ${eliminando ? 'opacity-50' : ''}`}>
            {/* Información del operario */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                                {operario.name?.charAt(0).toUpperCase() || 'O'}
                            </span>
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {operario.name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                            ID: {operario._id || operario.id}
                        </div>
                    </div>
                </div>
            </td>

            {/* Cédula */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-mono">
                    {operario.cedula || 'No especificada'}
                </div>
            </td>

            {/* Estado */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></div>
                    Activo
                </span>
            </td>

            {/* Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onEditar}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar operario"
                        disabled={eliminando}
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={onEliminar}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar operario (con verificación de integridad)"
                        disabled={eliminando}
                    >
                        {eliminando ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                            <div className="relative">
                                <Trash2 className="w-4 h-4" />
                                <Shield className="w-2 h-2 text-blue-500 absolute -top-1 -right-1" />
                            </div>
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default OperarioListMejorado;
