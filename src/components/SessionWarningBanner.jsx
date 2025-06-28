import React, { useState, useEffect } from 'react';
import { getTokenTimeRemaining } from '../utils/authUtils';
import { Clock, X } from 'lucide-react';

/**
 * Componente opcional para mostrar un banner discreto de advertencia de sesión
 * Solo se muestra cuando la sesión está próxima a expirar
 */
const SessionWarningBanner = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token || !refreshToken || isDismissed) {
        setIsVisible(false);
        return;
      }

    const timeRemaining = getTokenTimeRemaining(token);
      
      // Mostrar banner cuando quedan entre 3 y 1 minutos
      if (timeRemaining <= 3 && timeRemaining > 0) {
        setTimeLeft(timeRemaining);
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsDismissed(false); // Reset dismissed state when session is refreshed
      }
    };

    // Verificar cada 30 segundos
    const interval = setInterval(checkSession, 30000);
    
    // Verificar inmediatamente
    checkSession();

    return () => clearInterval(interval);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

        if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 shadow-lg z-50 border-b border-amber-600">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Tu sesión expira en {timeLeft} minuto{timeLeft !== 1 ? 's' : ''}. Se renovará automáticamente.
          </span>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-white hover:text-amber-200 transition-colors"
          aria-label="Cerrar advertencia"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SessionWarningBanner;
