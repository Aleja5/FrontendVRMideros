import { Pencil, Trash2, Shield } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';

import ConfirmacionEliminar from './ConfirmacionEliminar';
import { useEliminarConIntegridad } from '../hooks/useEliminarConIntegridad';

const MaquinasList = ({ maquinas, onEditar, onEliminar }) => {
    // Hook para manejar eliminaciones con integridad referencial
    const {
        iniciarEliminacion,
        propsConfirmacion
    } = useEliminarConIntegridad('maquina', (maquinaEliminada) => {
        toast.success(`Máquina "${maquinaEliminada.nombre}" eliminada exitosamente`);
        // Llamar al callback original si existe
        if (onEliminar) {
            onEliminar(maquinaEliminada._id || maquinaEliminada.id);
        }
    });

    // Nueva función que usa el sistema de integridad
    const handleDeleteClick = (maquina) => {
        iniciarEliminacion(maquina);
    };

        if (!maquinas) {
        return <p className="text-center text-gray-500 py-8">Cargando maquinas...</p>
    }

        if (maquinas.length === 0) {
        return (
            <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9-1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">No se encontraron maquinas</h3>
                <p className="mt-1 text-sm text-gray-500">Parece que aún no hay maquinas registradas.</p>
            </div>
        );
    }
    return (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-y-2">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wider">
                <tr>
                <th className="px-6 py-3 text-left">Nombre de la maquina</th>
                <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="text-gray-700">
                    {maquinas.map(maquina => (
                        <tr key={maquina._id} className="bg-white hover:shadow rounded-lg">
                            <td className="px-6 py-1 rounded-l-lg">{maquina.nombre}</td>
                            <td className="px-6 py-1 text-center rounded-r-lg">
                                <div className="flex justify-center space-x-2">
                                    <button
                                        onClick={() => onEditar(maquina)}
                                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
                                        title="Editar"
                                        >
                                        <Pencil size={16} />
                                    </button>
                                      <button
                                        onClick={() => handleDeleteClick(maquina)}
                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition relative"
                                        title="Eliminar con verificación de integridad"
                                        >
                                        <Trash2 size={16} />
                                        <Shield className="w-2 h-2 text-blue-500 absolute -top-1 -right-1" />
                                    </button>
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

export default MaquinasList;