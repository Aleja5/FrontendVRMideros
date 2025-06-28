// frontend/src/components/EjemploUsoIntegridad.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import ConfirmacionEliminar from './ConfirmacionEliminar';
import { useEliminarConIntegridad } from '../hooks/useEliminarConIntegridad';
import integridadService from '../services/integridadService';

/**
 * Ejemplo de cómo usar el sistema de integridad referencial
 * Este componente puede servir como plantilla para OperariosList, MaquinasList, etc.
 */
const EjemploListaOperarios = () => {
  const [operarios, setOperarios] = useState([]);
  const [cargando, setCargando] = useState(true);

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
    setOperarios(prev => prev.filter(op => op._id !== operarioEliminado._id));
    toast.success(`Operario ${operarioEliminado.name} eliminado exitosamente`);
  });

  // Cargar operarios
  useEffect(() => {
    cargarOperarios();
  }, []);

  const cargarOperarios = async () => {
    setCargando(true);
    try {
      // Aquí iría tu lógica existente para cargar operarios
      // const response = await axiosInstance.get('/operarios');
      // setOperarios(response.data.operarios || response.data);
      
      // Datos de ejemplo
      setOperarios([
        { _id: '1', name: 'Juan Pérez', cedula: '12345678' },
        { _id: '2', name: 'María García', cedula: '87654321' },
        { _id: '3', name: 'Carlos López', cedula: '11223344' }
      ]);
    } catch (error) {
      console.error('Error cargando operarios:', error);
      toast.error('Error cargando operarios');
    } finally {
      setCargando(false);
    }
  };

    const handleEliminar = (operario) => {
    iniciarEliminacion(operario);
  };

    const handleEditar = (operario) => {
    // Lógica para editar operario
    // REMOVED: console.log
  };

        if (cargando) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Cargando operarios...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Operarios</h2>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => // REMOVED: console.log
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Operario
          </button>
        </div>
      </div>

      {/* Lista */}
                        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operarios.map((operario) => (
              <tr key={operario._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {operario.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {operario.cedula}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditar(operario)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Editar operario"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(operario)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Eliminar operario"
                      disabled={eliminando}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {operarios.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay operarios registrados
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmacionEliminar {...propsConfirmacion} />
    </div>
  );
};

export default EjemploListaOperarios;
