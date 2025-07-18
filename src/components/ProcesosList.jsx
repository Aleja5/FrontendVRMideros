import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';
import useEliminarConIntegridad from '../hooks/useEliminarConIntegridadSimple';
import ModalIntegridad from './ModalIntegridad';

const ProcesoList = ({ procesos, onEditar, onEliminar }) => {
    const {
        modalVisible,
        datosModal,
        manejarEliminacion,
        confirmarEliminacion,
        cancelarEliminacion
    } = useEliminarConIntegridad();

    if (!procesos) {
        return <p className="text-center text-gray-500 py-8">Cargando procesos...</p>;
    }

        if (procesos.length === 0) {
        return (
            <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9-1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">No se encontraron procesos</h3>
                <p className="mt-1 text-sm text-gray-500">Parece que aún no hay procesos registrados.</p>
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
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">                        {procesos.map(proceso => (
                            <tr key={proceso._id} className="bg-white hover:shadow rounded-lg">
                                <td className="px-6 py-1 rounded-l-lg">{proceso.nombre}</td>
                                <td className="px-6 py-1 text-center rounded-r-lg">
                                    {proceso.areas && Array.isArray(proceso.areas) && proceso.areas.length > 0 
                                        ? proceso.areas.map(area => area.nombre || area).join(', ')
                                        : proceso.areaId && typeof proceso.areaId === 'object' && proceso.areaId.nombre 
                                            ? proceso.areaId.nombre 
                                            : 'Sin áreas asignadas'
                                    }
                                </td>
                                <td className="px-6 py-1 text-right text-sm font-medium space-x-2">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => onEditar(proceso)}
                                            className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                            
                                        </button>                                        <button 
                                            onClick={() => manejarEliminacion(
                                                proceso._id, 
                                                proceso.nombre, 
                                                'proceso',
                                                onEliminar
                                            )} 
                                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                            
                                        </button>
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

