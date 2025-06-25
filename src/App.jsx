// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EditarProduccion from './pages/EditarProduccion';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from './pages/AdminHome';
import ConsultaJornadas from './pages/ConsultaJornadas';
import ValidateCedula from './pages/ValidateCedula';
import OperarioDashboard from './pages/OperarioDashboard';
import RegistroProduccion from './components/RegistroProduccion';

import MiJornada from './pages/MiJornada';
import HistorialJornadas from './pages/HistorialJornadas';
import AdminJornadaDetalle from './pages/AdminJornadaDetalle';

import ProtectedRoute from './components/ProtectedRoute'; 
import { useSessionMonitor } from './hooks/useSessionMonitor';
import MaquinasPage from './pages/Maquinas';
import InsumosPage from './pages/Insumos';
import ProcesosPage from './pages/Procesos';
import AreasPage from './pages/Areas';
import OperariosPage from './pages/Operarios';
import UsuariosPage from './pages/Usuarios'; 
import UsuarioForm from './components/UsuarioForm'; 
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  // Inicializar el monitor de sesión global
  useSessionMonitor();

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- INICIO DE RUTAS PROTEGIDAS: ADMIN --- */}
        {/* Cada ruta envuelta individualmente */}
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida: Admin/Jornadas */}
        <Route
          path="/admin/jornadas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ConsultaJornadas />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/maquinas" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'production']}>
          <MaquinasPage />
          </ProtectedRoute>
        } 
        />

        <Route 
          path="/admin/insumos" 
          element={
          <ProtectedRoute allowedRoles={['admin', 'production']}>
          <InsumosPage />
          </ProtectedRoute>
          } 
          />

        <Route 
          path="/admin/procesos" 
          element={
          <ProtectedRoute allowedRoles={['admin', 'production']}>
          <ProcesosPage />
          </ProtectedRoute>
        } 
        />
        <Route 
          path="/admin/areas" 
          element={
          <ProtectedRoute allowedRoles={['admin', 'production']}>
          <AreasPage />
          </ProtectedRoute>
          }
          />          
        <Route 
          path="/admin/operarios" 
          element={
          <ProtectedRoute allowedRoles={['admin']}>
          <OperariosPage />
          </ProtectedRoute>          
          } 
          />

        {/* Rutas de Usuarios */}
        <Route
          path="/admin/usuarios" // Ruta para la lista de usuarios (UsuariosPage)
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        {/* NUEVAS RUTAS PARA CREAR/EDITAR USUARIOS CON USUARIOFORM */}
        <Route
          path="/admin/usuarios/crear" // Ruta para crear un nuevo usuario
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsuarioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios/editar/:id" // Ruta para editar un usuario existente
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              {/* UsuarioForm necesitará lógica para cargar el usuario inicial basado en :id */}
              <UsuarioForm />
            </ProtectedRoute>
          }
        />

        {/* detalle de la jornada del admin */}
        <Route
          path="/admin/jornada/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'production']}>
              <AdminJornadaDetalle />
            </ProtectedRoute>
          }
        />
        {/* --- FIN DE RUTAS PROTEGIDAS: ADMIN --- */}


        {/* --- INICIO DE RUTAS PROTEGIDAS: PRODUCCIÓN (Operario) --- */}
        <Route
          path="/validate-cedula"
          element={
            <ProtectedRoute allowedRoles={['production']}>
              <ValidateCedula />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operario-dashboard"
          element={
            <ProtectedRoute allowedRoles={['production']}>
            <OperarioDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registro-produccion"
          element={
            <ProtectedRoute allowedRoles={['production']}>
              <RegistroProduccion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produccion/actualizar/:id"
          element={
            <ProtectedRoute allowedRoles={['production']}>
              <EditarProduccion />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/mi-jornada" 
          element={
          <ProtectedRoute allowedRoles={['production']}>
          <MiJornada />
          </ProtectedRoute>
        } />
        <Route 
          path="/historial-jornadas" 
          element={
          <ProtectedRoute allowedRoles={['production']}>
          <HistorialJornadas />
          </ProtectedRoute>
          } />        <Route path="/*" element={<NotFound />} /> 
        

      </Routes>
      
      {/* Toast Container para mostrar notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        enableMultiContainer={false}
        containerId="main-toast-container"
        limit={3}
        preventDuplicates={true}
      />
    </Router>
  );
}

export default App;