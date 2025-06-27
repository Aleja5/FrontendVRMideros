// frontend/src/hooks/useEliminarConIntegridadSimple.js
import { useState } from 'react';
import { toast } from 'react-toastify';
import integridadService from '../services/integridadService';

/**
 * Hook más simple para manejar eliminaciones con verificación de integridad referencial
 * @returns {Object} Funciones y estado para manejar eliminaciones
 */
const useEliminarConIntegridad = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [datosModal, setDatosModal] = useState(null);

  /**
   * Maneja el proceso de eliminación
   * @param {string} entidadId - ID de la entidad a eliminar
   * @param {string} nombreEntidad - Nombre de la entidad
   * @param {string} tipoEntidad - Tipo de entidad ('operario', 'maquina', etc.)
   * @param {function} onEliminar - Callback a ejecutar después de la eliminación exitosa
   */
  const manejarEliminacion = async (entidadId, nombreEntidad, tipoEntidad, onEliminar) => {
    try {
      console.log('🔍 Verificando integridad para:', { entidadId, nombreEntidad, tipoEntidad });
      
      // Verificar integridad referencial
      const verificacion = await integridadService.verificarIntegridad(tipoEntidad, entidadId);
      
      console.log('📊 Resultado de verificación:', verificacion);
      
      if (!verificacion.puedeEliminar) {
        // Mostrar modal con información de por qué no se puede eliminar
        console.log('❌ No se puede eliminar - mostrando modal de error');
        setDatosModal({
          puedeEliminar: false,
          entidadId,
          nombreEntidad,
          tipoEntidad,
          mensaje: verificacion.mensaje,
          detalles: verificacion.detalles,
          totalRegistros: verificacion.totalRegistros || verificacion.registrosAfectados,
          registrosAfectados: verificacion.registrosAfectados || []
        });
      } else {
        // Mostrar modal de confirmación para eliminación
        console.log('✅ Se puede eliminar - mostrando modal de confirmación');
        setDatosModal({
          puedeEliminar: true,
          entidadId,
          nombreEntidad,
          tipoEntidad,
          mensaje: `¿Está seguro de que desea eliminar ${tipoEntidad} "${nombreEntidad}"?`,
          onEliminar
        });
      }
      
      setModalVisible(true);
    } catch (error) {
      console.error('Error verificando integridad:', error);
      toast.error(`Error al verificar integridad de ${tipoEntidad}`);
    }
  };

  /**
   * Confirma y ejecuta la eliminación
   */
  const confirmarEliminacion = async () => {
    if (!datosModal || !datosModal.puedeEliminar) return;
    
    try {
      await integridadService.eliminar(datosModal.tipoEntidad, datosModal.entidadId);
      toast.success(`${datosModal.tipoEntidad} "${datosModal.nombreEntidad}" eliminado exitosamente`);
      
      // Cerrar modal
      setModalVisible(false);
      setDatosModal(null);
      
      // Ejecutar callback de la página padre para recargar la lista
      if (datosModal.onEliminar) {
        datosModal.onEliminar(datosModal.entidadId);
      }
    } catch (error) {
      console.error('Error eliminando:', error);
      toast.error(`Error al eliminar ${datosModal.tipoEntidad}`);
    }
  };

  /**
   * Cancela la eliminación
   */
  const cancelarEliminacion = () => {
    setModalVisible(false);
    setDatosModal(null);
  };

  return {
    modalVisible,
    datosModal,
    manejarEliminacion,
    confirmarEliminacion,
    cancelarEliminacion
  };
};

export default useEliminarConIntegridad;
