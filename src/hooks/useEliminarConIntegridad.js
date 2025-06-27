// frontend/src/hooks/useEliminarConIntegridad.js
import { useState } from 'react';
import { toast } from 'react-toastify';
import integridadService from '../services/integridadService';

/**
 * Hook personalizado para manejar eliminaciones con verificación de integridad referencial
 * @param {string} tipoEntidad - Tipo de entidad ('operario', 'maquina', etc.)
 * @param {function} onSuccess - Callback ejecutado después de una eliminación exitosa
 * @returns {Object} Funciones y estado para manejar eliminaciones
 */
export const useEliminarConIntegridad = (tipoEntidad, onSuccess = null) => {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [entidadAEliminar, setEntidadAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  /**
   * Inicia el proceso de eliminación mostrando el modal de confirmación
   * @param {Object} entidad - Entidad a eliminar
   */
  const iniciarEliminacion = (entidad) => {
    setEntidadAEliminar(entidad);
    setMostrarConfirmacion(true);
  };

  /**
   * Cancela el proceso de eliminación
   */
  const cancelarEliminacion = () => {
    setMostrarConfirmacion(false);
    setEntidadAEliminar(null);
  };

  /**
   * Confirma y ejecuta la eliminación
   */
  const confirmarEliminacion = async () => {
    if (!entidadAEliminar) return;

    setEliminando(true);
    try {
      // Realizar la eliminación
      const resultado = await integridadService.eliminar(tipoEntidad, entidadAEliminar._id || entidadAEliminar.id);
      
      // Mostrar mensaje de éxito
      toast.success(resultado.message || `${tipoEntidad} eliminado exitosamente`);
      
      // Cerrar modal
      setMostrarConfirmacion(false);
      setEntidadAEliminar(null);
      
      // Ejecutar callback de éxito si existe
      if (onSuccess) {
        onSuccess(entidadAEliminar);
      }
      
    } catch (error) {
      console.error(`Error eliminando ${tipoEntidad}:`, error);
      
      // Manejar diferentes tipos de error
      if (error.response?.status === 409) {
        // Conflicto de integridad referencial
        const errorData = error.response.data;
        toast.error(errorData.message || `No se puede eliminar: tiene registros asociados`);
      } else if (error.response?.status === 404) {
        toast.error(`${tipoEntidad} no encontrado`);
      } else {
        toast.error(`Error al eliminar ${tipoEntidad}. Intente nuevamente.`);
      }
    } finally {
      setEliminando(false);
    }
  };

  /**
   * Función para verificar integridad sin mostrar modal
   * @param {string} entidadId - ID de la entidad
   * @returns {Promise<Object>} Resultado de la verificación
   */
  const verificarIntegridad = async (entidadId) => {
    try {
      return await integridadService.verificarIntegridad(tipoEntidad, entidadId);
    } catch (error) {
      console.error(`Error verificando integridad de ${tipoEntidad}:`, error);
      throw error;
    }
  };

  /**
   * Función de eliminación rápida sin confirmación (para casos específicos)
   * @param {Object} entidad - Entidad a eliminar
   * @param {boolean} forzar - Si true, saltará la verificación de integridad
   */
  const eliminarDirecto = async (entidad, forzar = false) => {
    setEliminando(true);
    try {
      if (!forzar) {
        // Verificar integridad primero
        const verificacion = await verificarIntegridad(entidad._id || entidad.id);
        if (!verificacion.puedeEliminar) {
          toast.error(verificacion.mensaje || 'No se puede eliminar: tiene registros asociados');
          return false;
        }
      }

      // Realizar la eliminación
      const resultado = await integridadService.eliminar(tipoEntidad, entidad._id || entidad.id);
      
      toast.success(resultado.message || `${tipoEntidad} eliminado exitosamente`);
      
      if (onSuccess) {
        onSuccess(entidad);
      }
      
      return true;
      
    } catch (error) {
      console.error(`Error eliminando ${tipoEntidad}:`, error);
      toast.error(`Error al eliminar ${tipoEntidad}`);
      return false;
    } finally {
      setEliminando(false);
    }
  };

  return {
    // Estado
    mostrarConfirmacion,
    entidadAEliminar,
    eliminando,
    
    // Funciones principales
    iniciarEliminacion,
    cancelarEliminacion,
    confirmarEliminacion,
    
    // Funciones auxiliares
    verificarIntegridad,
    eliminarDirecto,
    
    // Props para el componente de confirmación
    propsConfirmacion: {
      isOpen: mostrarConfirmacion,
      onClose: cancelarEliminacion,
      onConfirm: confirmarEliminacion,
      entidad: entidadAEliminar,
      tipoEntidad,
      verificarIntegridad
    }
  };
};

export default useEliminarConIntegridad;
