// frontend/src/services/integridadService.js
import axiosInstance from '../utils/axiosInstance';

/**
 * Servicio para manejar verificaciones de integridad referencial
 */
class IntegridadService {
  
  /**
   * Verifica si un operario puede ser eliminado
   * @param {string} operarioId - ID del operario
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarOperario(operarioId) {
    try {
      const response = await axiosInstance.get(`/operarios/${operarioId}/verificar-integridad`);
      return response.data;
    } catch (error) {
      console.error('Error verificando integridad del operario:', error);
      if (error.response?.status === 409) {
        // Conflicto de integridad referencial
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Verifica si una máquina puede ser eliminada
   * @param {string} maquinaId - ID de la máquina
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarMaquina(maquinaId) {
    try {
      const response = await axiosInstance.get(`/maquinas/${maquinaId}/verificar-integridad`);
      return response.data;
    } catch (error) {
      console.error('Error verificando integridad de la máquina:', error);
      if (error.response?.status === 409) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Verifica si un área puede ser eliminada
   * @param {string} areaId - ID del área
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarArea(areaId) {
    try {
      const response = await axiosInstance.get(`/areas/${areaId}/verificar-integridad`);
      return response.data;
    } catch (error) {
      console.error('Error verificando integridad del área:', error);
      if (error.response?.status === 409) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Verifica si un proceso puede ser eliminado
   * @param {string} procesoId - ID del proceso
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarProceso(procesoId) {
    try {
      // REMOVED: console.log('🌐 Llamando al backend para verificar proceso:', procesoId);
      const response = await axiosInstance.get(`/procesos/${procesoId}/verificar-integridad`);
      // REMOVED: console.log('📡 Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error verificando integridad del proceso:', error);
      if (error.response?.status === 409) {
        // REMOVED: console.log('⚠️ Respuesta 409 - conflicto de integridad:', error.response.data);
        return error.response.data;
      }
      // Si es error 200 pero con puedeEliminar: false, también lo retornamos
      if (error.response?.data) {
        // REMOVED: console.log('ℹ️ Respuesta con datos de error:', error.response.data);
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Verifica si un insumo puede ser eliminado
   * @param {string} insumoId - ID del insumo
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarInsumo(insumoId) {
    try {
      const response = await axiosInstance.get(`/insumos/${insumoId}/verificar-integridad`);
      return response.data;
    } catch (error) {
      console.error('Error verificando integridad del insumo:', error);
      if (error.response?.status === 409) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Función genérica para verificar integridad según el tipo de entidad
   * @param {string} tipoEntidad - Tipo de entidad ('operario', 'maquina', etc.)
   * @param {string} entidadId - ID de la entidad
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarIntegridad(tipoEntidad, entidadId) {
    switch (tipoEntidad) {
      case 'operario':
        return this.verificarOperario(entidadId);
      case 'maquina':
        return this.verificarMaquina(entidadId);
      case 'area':
        return this.verificarArea(entidadId);
      case 'proceso':
        return this.verificarProceso(entidadId);
      case 'insumo':
        return this.verificarInsumo(entidadId);
      default:
        throw new Error(`Tipo de entidad no soportado: ${tipoEntidad}`);
    }
  }

  /**
   * Elimina un operario (con verificación previa ya realizada)
   * @param {string} operarioId - ID del operario
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarOperario(operarioId) {
    try {
      const response = await axiosInstance.delete(`/operarios/${operarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando operario:', error);
      throw error;
    }
  }

  /**
   * Elimina una máquina (con verificación previa ya realizada)
   * @param {string} maquinaId - ID de la máquina
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarMaquina(maquinaId) {
    try {
      const response = await axiosInstance.delete(`/maquinas/${maquinaId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando máquina:', error);
      throw error;
    }
  }

  /**
   * Elimina un área (con verificación previa ya realizada)
   * @param {string} areaId - ID del área
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarArea(areaId) {
    try {
      const response = await axiosInstance.delete(`/areas/${areaId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando área:', error);
      throw error;
    }
  }

  /**
   * Elimina un proceso (con verificación previa ya realizada)
   * @param {string} procesoId - ID del proceso
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarProceso(procesoId) {
    try {
      const response = await axiosInstance.delete(`/procesos/${procesoId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando proceso:', error);
      throw error;
    }
  }

  /**
   * Elimina un insumo (con verificación previa ya realizada)
   * @param {string} insumoId - ID del insumo
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarInsumo(insumoId) {
    try {
      const response = await axiosInstance.delete(`/insumos/${insumoId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando insumo:', error);
      throw error;
    }
  }

  /**
   * Función genérica para eliminar según el tipo de entidad
   * @param {string} tipoEntidad - Tipo de entidad
   * @param {string} entidadId - ID de la entidad
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminar(tipoEntidad, entidadId) {
    switch (tipoEntidad) {
      case 'operario':
        return this.eliminarOperario(entidadId);
      case 'maquina':
        return this.eliminarMaquina(entidadId);
      case 'area':
        return this.eliminarArea(entidadId);
      case 'proceso':
        return this.eliminarProceso(entidadId);
      case 'insumo':
        return this.eliminarInsumo(entidadId);
      default:
        throw new Error(`Tipo de entidad no soportado: ${tipoEntidad}`);
    }
  }
}

// Exportar una instancia única del servicio
const integridadService = new IntegridadService();
export default integridadService;
