import { Pencil, Trash2, Shield, Settings, XCircle, MoreVertical, Cog } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useEliminarConIntegridad from '../hooks/useEliminarConIntegridadSimple';
import ModalIntegridad from './ModalIntegridad';

const ProcesoList = ({ procesos, onEditar, onEliminar, onCambiarEstado, estadoActual }) => {
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

    const {
        modalVisible,
        datosModal,
        manejarEliminacion,
        confirmarEliminacion,
        cancelarEliminacion
    } = useEliminarConIntegridad();

    const handleCambiarEstado = async (proceso, nuevoEstado) => {
        try {
            await onCambiarEstado(proceso._id, nuevoEstado);
            toast.success(`Proceso "${proceso.nombre}" marcado como ${nuevoEstado}`);
        } catch (error) {
            toast.error('Error al cambiar estado del proceso');
        }
    };

    if (!procesos) {
        return <p className="text-center text-gray-500 py-8">Cargando procesos...</p>;
    }

        if (procesos.length === 0) {
        return (
                    <div className="text-center py-10">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                            {estadoActual === 'activo' ? <Settings size={48} /> : 
                             estadoActual === 'inactivo' ? <XCircle size={48} /> : 
                             <Settings size={48} />}
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-700">
                            {estadoActual === 'todos' 
                                ? 'No se encontraron procesos'
                                : estadoActual === 'activo'
                                ? 'No se encontraron procesos activos'
                                : estadoActual === 'inactivo'
                                ? 'No se encontraron procesos inactivos'
                                : 'No se encontraron procesos'
                            }
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {estadoActual === 'activo' 
                                ? 'Parece que aún no hay procesos activos registrados.'
                                : estadoActual === 'inactivo'
                                ? 'No hay procesos inactivos en este momento.'
                                : 'Parece que aún no hay procesos registrados en el sistema.'
                            }
                        </p>
                    </div>
                );
            }



    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-separate border-spacing-y-2">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wider">                        <tr>
                            <th className="px-6 py-3 text-left">Nombre del Proceso</th>
                            <th className="px-6 py-3 text-center">Áreas de Producción</th>
                            <th className="px-6 py-3 text-left">Estado</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">                        {procesos.map(proceso => (
                            <tr key={proceso._id} className="bg-white hover:shadow rounded-lg">
                                <td className="px-6 py-1 rounded-l-lg">{proceso.nombre}</td>
                                <td className="px-6 py-1 text-center">
                                    {proceso.areas && Array.isArray(proceso.areas) && proceso.areas.length > 0 
                                        ? proceso.areas.map(area => area.nombre || area).join(', ')
                                        : proceso.areaId && typeof proceso.areaId === 'object' && proceso.areaId.nombre 
                                            ? proceso.areaId.nombre 
                                            : 'Sin áreas asignadas'
                                    }
                                </td>
                                <td className="px-6 py-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            proceso.estado === 'activo' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {proceso.estado === 'activo' ? <Cog size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                            {proceso.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                        </span>
                                        
                                        {/* Toggle Switch para cambiar estado */}
                                        <button
                                            onClick={() => handleCambiarEstado(proceso, proceso.estado === 'activo' ? 'inactivo' : 'activo')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                proceso.estado === 'activo' 
                                                    ? 'bg-green-500' 
                                                    : 'bg-gray-300'
                                            }`}
                                            title={proceso.estado === 'activo' ? 'Desactivar proceso' : 'Activar proceso'}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                                    proceso.estado === 'activo' 
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
                                            onClick={() => setMenuAbierto(menuAbierto === proceso._id ? null : proceso._id)}
                                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                            title="Más acciones"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Menú desplegable */}
                                        {menuAbierto === proceso._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            onEditar(proceso);
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
                                                            manejarEliminacion(
                                                                proceso._id, 
                                                                proceso.nombre, 
                                                                'proceso',
                                                                onEliminar
                                                            );
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
            </div>
            
            <ModalIntegridad
                visible={modalVisible}
                datos={datosModal}
                onConfirmar={confirmarEliminacion}
                onCancelar={cancelarEliminacion}
            />
        </>
    );
};



export default ProcesoList;

