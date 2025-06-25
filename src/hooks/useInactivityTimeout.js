import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { INACTIVITY_CONFIG } from '../config/inactivityConfig';

/**
 * Hook personalizado para manejar timeout por inactividad
 * @param {number} timeoutDuration - Duración del timeout en milisegundos (por defecto 15 minutos)
 * @param {boolean} enabled - Si el timeout está habilitado (por defecto true)
 * @param {string} redirectPath - Ruta a la que redirigir (por defecto '/validate-cedula')
 */
const useInactivityTimeout = (
  timeoutDuration = INACTIVITY_CONFIG.TIMEOUT_DURATION,
  enabled = true,
  redirectPath = INACTIVITY_CONFIG.REDIRECT_PATH
) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const isActiveRef = useRef(true);

  // Función para resetear el timeout
  const resetTimeout = useCallback(() => {
    if (!enabled || !isActiveRef.current) return;

    // Limpiar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        // Limpiar datos de sesión del operario y redirigir
        localStorage.removeItem('operario');
        navigate(redirectPath);
      }
    }, timeoutDuration);
  }, [enabled, timeoutDuration, redirectPath, navigate]);

  // Eventos que indican actividad del usuario
  const events = INACTIVITY_CONFIG.ACTIVITY_EVENTS;

  // Función para manejar los eventos de actividad
  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Inicializar el timeout
    resetTimeout();

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      // Marcar como inactivo para evitar navegación después del desmontaje
      isActiveRef.current = false;
      
      // Limpiar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Remover event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, handleActivity, resetTimeout]);

  // Función para pausar/reanudar el timeout manualmente
  const pauseTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resumeTimeout = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  return {
    resetTimeout,
    pauseTimeout,
    resumeTimeout
  };
};

export default useInactivityTimeout;
