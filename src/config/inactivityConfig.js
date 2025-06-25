// Configuración para el timeout de inactividad
export const INACTIVITY_CONFIG = {
  // Tiempo de inactividad en milisegundos (15 minutos por defecto)
  TIMEOUT_DURATION: 15 * 60 * 1000,
  
  // Ruta de redirección cuando hay timeout
  REDIRECT_PATH: '/validate-cedula',
  
  // Páginas donde se aplica el timeout automáticamente
  OPERATOR_PAGES: [
    '/operario-dashboard',
    '/mi-jornada',
    '/historial-jornadas',
    '/registro-produccion'
  ],
  
  // Eventos que se consideran como actividad del usuario
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ]
};

export default INACTIVITY_CONFIG;
