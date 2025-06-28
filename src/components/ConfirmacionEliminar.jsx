// frontend/src/components/ConfirmacionEliminar.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Trash2, Info, ExternalLink } from 'lucide-react';

/**
 * Componente para confirmar eliminación con verificación de integridad referencial
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onConfirm - Función para confirmar eliminación
 * @param {Object} props.entidad - Datos de la entidad a eliminar
 * @param {string} props.tipoEntidad - Tipo de entidad ('operario', 'maquina', etc.)
 * @param {function} props.verificarIntegridad - Función para verificar integridad
 */
const ConfirmacionEliminar = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  entidad, 
  tipoEntidad,
  verificarIntegridad 
}) => {
  const [verificandoIntegridad, setVerificandoIntegridad] = useState(false);
  const [puedeEliminar, setPuedeEliminar] = useState(null);
  const [detallesIntegridad, setDetallesIntegridad] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Verificar integridad cuando se abre el modal
  useEffect(() => {
    if (isOpen && entidad && verificarIntegridad) {
      verificarIntegridadReferencial();
    }
  }, [isOpen, entidad]);

  const verificarIntegridadReferencial = async () => {
    setVerificandoIntegridad(true);
    try {
      const resultado = await verificarIntegridad(entidad._id || entidad.id);
      setPuedeEliminar(resultado.puedeEliminar);
      setDetallesIntegridad(resultado);
    } catch (error) {
      console.error('Error verificando integridad:', error);
      setPuedeEliminar(false);
      setDetallesIntegridad({
        mensaje: 'Error al verificar integridad referencial',
        error: true
      });
    } finally {
      setVerificandoIntegridad(false);
    }
  };

    const handleConfirmar = () => {
    if (puedeEliminar) {
      onConfirm();
    }
  };

    const getNombreEntidad = () => {
    if (!entidad) return '';
    return entidad.nombre || entidad.name || entidad.numeroOti || 'Elemento';
  };

    const getTituloModal = () => {
    const nombreEntidad = getNombreEntidad();
    return `Eliminar ${tipoEntidad}: ${nombreEntidad}`;
  };

        if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Trash2 className="w-5 h-5 text-red-600 mr-2" />
            {getTituloModal()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
                        <div className="p-6">
          {verificandoIntegridad ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Verificando integridad...</span>
            </div>
          ) : puedeEliminar === null ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Preparando verificación...</p>
            </div>
          ) : puedeEliminar ? (
            <div>
              <div className="flex items-start mb-4">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                  <p className="text-gray-900 font-medium">Confirmación de eliminación</p>
                  <p className="text-gray-600 mt-1">
                    ¿Está seguro de que desea eliminar este {tipoEntidad}? Esta acción no se puede deshacer.
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
            <div>
              <div className="flex items-start mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                  <p className="text-red-900 font-medium">No se puede eliminar</p>
                  <p className="text-red-700 mt-1">
                    {detallesIntegridad?.mensaje || 'Este elemento tiene registros asociados'}
                  </p>
                </div>
              </div>

              {detallesIntegridad?.detalles && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-red-800">
                    <p><strong>Registros afectados:</strong> {detallesIntegridad.detalles.registrosAfectados}</p>
                    <p className="mt-2">{detallesIntegridad.detalles.sugerencia}</p>
                  </div>
                </div>
              )}

              {detallesIntegridad?.registrosAfectados && detallesIntegridad.registrosAfectados.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setMostrarDetalles(!mostrarDetalles)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {mostrarDetalles ? 'Ocultar' : 'Ver'} registros afectados
                  </button>

                  {mostrarDetalles && (
                    <div className="mt-3 bg-gray-50 border rounded-lg p-3 max-h-40 overflow-y-auto">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">
                        Registros de producción que serían afectados:
                      </h4>
                      <div className="space-y-2">
                        {detallesIntegridad.registrosAfectados.map((registro, index) => (
                          <div key={index} className="text-xs text-gray-700 bg-white p-2 rounded border">
                            <p><strong>OTI:</strong> {registro.oti?.numeroOti || 'N/A'}</p>
                            <p><strong>Operario:</strong> {registro.operario?.name || 'N/A'}</p>
                            <p><strong>Fecha:</strong> {new Date(registro.fecha).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                      {detallesIntegridad.totalRegistros > detallesIntegridad.registrosAfectados.length && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... y {detallesIntegridad.totalRegistros - detallesIntegridad.registrosAfectados.length} registros más
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          {puedeEliminar && (
            <button
              onClick={handleConfirmar}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionEliminar;
