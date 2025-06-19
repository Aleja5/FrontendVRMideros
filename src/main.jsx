import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css'; // Importa estilos globales

// Debug de configuración (solo en desarrollo)
if (import.meta.env.DEV) {
    import('./debug.js');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);