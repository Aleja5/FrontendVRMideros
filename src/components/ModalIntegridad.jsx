// frontend/src/components/ModalIntegridad.jsx
import React, { useState } from 'react';
import { AlertTriangle, X, Trash2, Info, ExternalLink } from 'lucide-react';

/**
 * Componente modal simple para manejar eliminaciones con integridad referencial
 * @param {Object} props
 * @param {boolean} props.visible - Si el modal está visible
 * @param {Object} props.datos - Datos del modal
 * @param {function} props.onConfirmar - Función para confirmar eliminación
 * @param {function} props.onCancelar - Función para cancelar
 */
const ModalIntegridad = ({ visible, datos, onConfirmar, onCancelar }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  if (!visible || !datos) return null;

  const { 
    puedeEliminar, 
    nombreEntidad, 
    tipoEntidad, 
    mensaje, 
    detalles, 
    totalRegistros, 
    registrosAfectados 
  } = datos;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {puedeEliminar ? (
              <Trash2 className="w-5 h-5 text-red-600 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            )}
            {puedeEliminar ? 'Confirmar eliminación' : 'No se puede eliminar'}
          </h3>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {puedeEliminar ? (
            // Modal de confirmación
            <div>
              <div className="flex items-start mb-4">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">
                    {tipoEntidad}: {nombreEntidad}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {mensaje}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm">
                  ✅ Este {tipoEntidad} puede eliminarse sin afectar registros de producción.
                </p>
              </div>
            </div>
          ) : (
            // Modal de error de integridad
            <div>
              <div className="flex items-start mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-900 font-medium">
                    {tipoEntidad}: {nombreEntidad}
                  </p>
                  <p className="text-red-700 mt-1">
                    {mensaje}
                  </p>
                </div>
              </div>

              {detalles && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-red-800">
                    <p><strong>Tipo:</strong> {detalles.entidad}</p>
                    <p><strong>Registros afectados:</strong> {detalles.registrosAfectados || totalRegistros}</p>
                    {detalles.sugerencia && (
                      <p className="mt-2"><strong>Sugerencia:</strong> {detalles.sugerencia}</p>
                    )}
                  </div>
                </div>
              )}

              {registrosAfectados && registrosAfectados.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setMostrarDetalles(!mostrarDetalles)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {mostrarDetalles ? 'Ocultar' : 'Ver'} registros afectados ({registrosAfectados.length})
                  </button>

                  {mostrarDetalles && (
                    <div className="mt-3 bg-gray-50 border rounded-lg p-3 max-h-40 overflow-y-auto">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">
                        Registros de producción afectados:
                      </h4>
                      <div className="space-y-2">
                        {registrosAfectados.map((registro, index) => (
                          <div key={index} className="text-xs text-gray-700 bg-white p-2 rounded border">
                            <p><strong>OTI:</strong> {registro.oti?.numeroOti || 'N/A'}</p>
                            <p><strong>Operario:</strong> {registro.operario?.name || 'N/A'}</p>
                            <p><strong>Fecha:</strong> {new Date(registro.fecha).toLocaleDateString()}</p>
                            {registro.procesos && (
                              <p><strong>Procesos:</strong> {registro.procesos.map(p => p.nombre).join(', ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      {totalRegistros > registrosAfectados.length && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... y {totalRegistros - registrosAfectados.length} registros más
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  💡 <strong>¿Qué puedes hacer?</strong>
                </p>
                <ul className="text-yellow-700 text-sm mt-1 ml-4 list-disc">
                  <li>Eliminar o reasignar los registros de producción asociados</li>
                  <li>Modificar los registros para usar otros {tipoEntidad}s</li>
                  <li>Contactar al administrador si necesitas ayuda</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {puedeEliminar ? 'Cancelar' : 'Entendido'}
          </button>
          {puedeEliminar && (
            <button
              onClick={onConfirmar}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sí, eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalIntegridad;
