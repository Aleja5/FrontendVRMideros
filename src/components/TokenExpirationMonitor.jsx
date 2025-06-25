import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getTokenTimeRemaining, refreshTokenIfNeeded } from '../utils/authUtils';

// Variable global para evitar múltiples alertas simultáneas
let globalWarningShown = false;
let globalToastId = null;

/**
 * Componente que monitorea la expiración del token y permite renovación
 * Con refresh tokens, las notificaciones son menos agresivas
 */
const TokenExpirationMonitor = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const hasWarnedRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Si no hay refresh token, no monitoreamos (será manejado por el interceptor)
      if (!refreshToken) return;
      
      if (token) {
        const timeRemaining = getTokenTimeRemaining(token);
        
        // Solo mostrar warning si quedan menos de 3 minutos Y no hemos advertido globalmente
        if (timeRemaining <= 3 && timeRemaining > 0 && !hasWarnedRef.current && !globalWarningShown) {
          setTimeLeft(timeRemaining);
          setShowWarning(true);
          hasWarnedRef.current = true;
          globalWarningShown = true;
          
          // Cerrar cualquier toast anterior
          if (globalToastId) {
            toast.dismiss(globalToastId);
          }
          
          // Mostrar nuevo toast con ID único
          globalToastId = toast.warning(`⏰ Tu sesión expira en ${timeRemaining} minuto${timeRemaining !== 1 ? 's' : ''}. Se renovará automáticamente.`, {
            toastId: 'session-expiry-warning', // ID único para evitar duplicados
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => {
              globalToastId = null;
            }
          });
        }
        
        // Auto-renovar si quedan menos de 2 minutos
        if (timeRemaining <= 2 && timeRemaining > 0) {
          const success = await refreshTokenIfNeeded();
          if (success) {
            setShowWarning(false);
            hasWarnedRef.current = false;
            globalWarningShown = false;
            if (globalToastId) {
              toast.dismiss(globalToastId);
              globalToastId = null;
            }
            console.log('🔄 Token renovado proactivamente');
          }
        }
        
        // Reset warning si el token se renovó exitosamente
        if (timeRemaining > 3) {
          setShowWarning(false);
          hasWarnedRef.current = false;
          globalWarningShown = false;
          if (globalToastId) {
            toast.dismiss(globalToastId);
            globalToastId = null;
          }
        }
      }
    };

    // Verificar cada 30 segundos (más frecuente para mejor UX)
    intervalRef.current = setInterval(checkTokenExpiration, 30000);
    
    // Verificar inmediatamente al montar el componente
    checkTokenExpiration();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Sin dependencias para evitar re-ejecuciones

  const handleExtendSession = async () => {
    const success = await refreshTokenIfNeeded();
    if (success) {
      setShowWarning(false);
      hasWarnedRef.current = false;
      globalWarningShown = false;
      if (globalToastId) {
        toast.dismiss(globalToastId);
        globalToastId = null;
      }
      toast.success('✅ Sesión extendida exitosamente', {
        toastId: 'session-extended', // ID único
        autoClose: 2000
      });
    } else {
      toast.error('❌ Error al extender sesión', {
        toastId: 'session-extend-error', // ID único
        autoClose: 3000
      });
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (globalToastId) {
        toast.dismiss(globalToastId);
        globalToastId = null;
      }
      globalWarningShown = false;
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50 max-w-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            Tu sesión expira en {timeLeft} minuto{timeLeft !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Se renovará automáticamente
          </p>
          <button
            onClick={handleExtendSession}
            className="mt-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
          >
            Renovar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpirationMonitor;
