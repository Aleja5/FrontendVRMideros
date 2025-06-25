import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getTokenTimeRemaining, refreshTokenIfNeeded } from '../utils/authUtils';

// Variables globales para controlar las notificaciones
let sessionWarningActive = false;
let sessionToastId = null;
let monitorInterval = null;

/**
 * Hook personalizado para monitorear la sesión sin duplicados
 * Usa variables globales para asegurar que solo haya una instancia activa
 */
export const useSessionMonitor = () => {
  const isActiveRef = useRef(false);

  useEffect(() => {
    // Solo permitir una instancia activa del monitor
    if (sessionWarningActive || isActiveRef.current) {
      return;
    }

    isActiveRef.current = true;
    sessionWarningActive = true;

    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Si no hay refresh token, no monitoreamos
      if (!refreshToken) {
        return;
      }
      
      if (token) {
        const timeRemaining = getTokenTimeRemaining(token);
        
        // Mostrar advertencia solo una vez cuando quedan 3 minutos o menos
        if (timeRemaining <= 3 && timeRemaining > 0 && !sessionToastId) {
          // Mostrar toast con ID único para evitar duplicados
          sessionToastId = toast.warning(
            `⏰ Tu sesión expira en ${timeRemaining} minuto${timeRemaining !== 1 ? 's' : ''}. Se renovará automáticamente.`,
            {
              toastId: 'session-warning-main',
              position: "top-center",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              onClose: () => {
                sessionToastId = null;
              }
            }
          );
        }
        
        // Auto-renovar token cuando quedan 2 minutos
        if (timeRemaining <= 2 && timeRemaining > 0) {
          try {
            const success = await refreshTokenIfNeeded();
            if (success) {
              // Limpiar advertencia existente
              if (sessionToastId) {
                toast.dismiss(sessionToastId);
                sessionToastId = null;
              }
              
              // Mostrar confirmación de renovación
              toast.success('🔄 Sesión renovada automáticamente', {
                toastId: 'session-renewed',
                autoClose: 3000,
                position: "top-right"
              });
              
              console.log('🔄 Token renovado automáticamente');
            }
          } catch (error) {
            console.error('❌ Error al renovar token automáticamente:', error);
          }
        }
        
        // Limpiar advertencias si el token se renovó exitosamente
        if (timeRemaining > 10) {
          if (sessionToastId) {
            toast.dismiss(sessionToastId);
            sessionToastId = null;
          }
        }
      }
    };

    // Iniciar el monitoreo cada 30 segundos
    monitorInterval = setInterval(checkSession, 30000);
    
    // Verificar inmediatamente
    checkSession();

    // Cleanup al desmontar
    return () => {
      isActiveRef.current = false;
      sessionWarningActive = false;
      
      if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
      }
      
      if (sessionToastId) {
        toast.dismiss(sessionToastId);
        sessionToastId = null;
      }
    };
  }, []);

  // Función para renovar manualmente la sesión
  const renewSession = async () => {
    try {
      const success = await refreshTokenIfNeeded();
      if (success) {
        if (sessionToastId) {
          toast.dismiss(sessionToastId);
          sessionToastId = null;
        }
        
        toast.success('✅ Sesión renovada exitosamente', {
          toastId: 'manual-session-renewal',
          autoClose: 2000
        });
        
        return true;
      } else {
        toast.error('❌ Error al renovar sesión', {
          toastId: 'session-renewal-error',
          autoClose: 3000
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error al renovar sesión:', error);
      toast.error('❌ Error al renovar sesión', {
        toastId: 'session-renewal-error',
        autoClose: 3000
      });
      
      return false;
    }
  };

  return { renewSession };
};

// Función para limpiar el estado global (útil para testing)
export const clearSessionMonitor = () => {
  sessionWarningActive = false;
  
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  
  if (sessionToastId) {
    toast.dismiss(sessionToastId);
    sessionToastId = null;
  }
};
