import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Shield, UserCheck, UserX, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';

import ConfirmacionEliminar from './ConfirmacionEliminar';
import { useEliminarConIntegridad } from '../hooks/useEliminarConIntegridad';

const OperarioList = ({ operarios, onEditar, onEliminar, onCambiarEstado, estadoActual }) => {
    const [menuAbierto, setMenuAbierto] = useState(null);

    // Cerrar menú cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setMenuAbierto(null);
            }
        };

        if (menuAbierto) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [menuAbierto]);

    // Hook para manejar eliminaciones con integridad referencial
    const {
        iniciarEliminacion,
        propsConfirmacion
    } = useEliminarConIntegridad('operario', (operarioEliminado) => {
        toast.success(`Operario "${operarioEliminado.name}" eliminado exitosamente`);
        // Llamar al callback original si existe
        if (onEliminar) {
            onEliminar(operarioEliminado._id || operarioEliminado.id);
        }
    });

    // Nueva función que usa el sistema de integridad
    const handleDeleteClick = (operario) => {
        iniciarEliminacion(operario);
    };

    const handleCambiarEstado = async (operario, nuevoEstado) => {
        try {
            await onCambiarEstado(operario._id, nuevoEstado);
            toast.success(`Operario "${operario.name}" marcado como ${nuevoEstado}`);
        } catch (error) {
            toast.error('Error al cambiar estado del operario');
        }
    };

    if (!operarios) {
        return <p className="text-center text-gray-500 py-8">Cargando operarios...</p>;
    }

    if (operarios.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                    {estadoActual === 'activo' ? <UserCheck size={48} /> : 
                     estadoActual === 'inactivo' ? <UserX size={48} /> : 
                     <UserCheck size={48} />}
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-700">
                    {estadoActual === 'todos' 
                        ? 'No se encontraron operarios'
                        : `No se encontraron operarios ${estadoActual}s`
                    }
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    {estadoActual === 'activo' 
                        ? 'Parece que aún no hay operarios activos registrados.'
                        : estadoActual === 'inactivo'
                        ? 'No hay operarios inactivos en este momento.'
                        : 'Parece que aún no hay operarios registrados en el sistema.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-y-2">
                <thead className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wider">
                    <tr>
                        <th className="px-6 py-3 text-left">Nombre</th>
                        <th className="px-6 py-3 text-left">Cédula</th>
                        <th className="px-6 py-3 text-left">Estado</th>
                        <th className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {operarios.map(operario => (
                        <tr key={operario._id} className="bg-white hover:shadow rounded-lg">
                            <td className="px-6 py-1 rounded-l-lg">
                                {operario.name}
                            </td>
                            <td className="px-6 py-1">
                                {operario.cedula}
                            </td>
                            <td className="px-6 py-1">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        operario.estado === 'activo' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {operario.estado === 'activo' ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
                                        {operario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                    </span>
                                    
                                    {/* Toggle Switch para cambiar estado */}
                                    <button
                                        onClick={() => handleCambiarEstado(operario, operario.estado === 'activo' ? 'inactivo' : 'activo')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            operario.estado === 'activo' 
                                                ? 'bg-green-500' 
                                                : 'bg-gray-300'
                                        }`}
                                        title={operario.estado === 'activo' ? 'Desactivar operario' : 'Activar operario'}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                                operario.estado === 'activo' 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-1 text-center rounded-r-lg">
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuAbierto(menuAbierto === operario._id ? null : operario._id)}
                                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                        title="Más acciones"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {/* Menú desplegable */}
                                    {menuAbierto === operario._id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        onEditar(operario);
                                                        setMenuAbierto(null);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                                >
                                                    <Pencil size={14} className="mr-3 text-blue-500" />
                                                    Editar
                                                </button>
                                                
                                                <hr className="border-gray-100" />
                                                
                                                <button
                                                    onClick={() => {
                                                        handleDeleteClick(operario);
                                                        setMenuAbierto(null);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <Trash2 size={14} className="mr-3" />
                                                    Eliminar
                                                    <Shield className="w-3 h-3 text-blue-500 ml-auto" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal de confirmación con verificación de integridad */}
            <ConfirmacionEliminar {...propsConfirmacion} />
        </div>
    );
};

export default OperarioList;