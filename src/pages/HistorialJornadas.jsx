import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { toast } from "react-toastify";
import { Card, Button } from "../components/ui/index";
import { Sidebar } from "../components/Sidebar";
import { ChevronDownIcon, ChevronUpIcon, Pencil, Trash2 } from "lucide-react";
import EditarProduccion from "./EditarProduccion";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import useInactivityTimeout from "../hooks/useInactivityTimeout";

const ajustarFechaLocal = (fechaUTC) => {
  const fecha = new Date(fechaUTC);
  return new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);
};

const HistorialJornadas = () => {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJornada, setExpandedJornada] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduccion, setSelectedProduccion] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const [jornadasPerPage] = useState(5); // New state for jornadas per page

  const storedOperario = JSON.parse(localStorage.getItem('operario'));
  const operarioName = storedOperario?.name || 'Operario';

  // Hook para manejar timeout por inactividad
  useInactivityTimeout(15 * 60 * 1000); // 15 minutos

  const fetchJornadas = useCallback(async (filterDate = fechaFiltro) => { 
    try {
      setLoading(true);
      setCurrentPage(1); // Reset to first page on new fetch
      const localStoredOperario = JSON.parse(localStorage.getItem("operario"));
      if (!localStoredOperario || !localStoredOperario._id) {
        toast.error("No se encontró información del operario. Por favor, inicie sesión nuevamente.");
        navigate("/validate-cedula");
        return;
      }
      const operarioId = localStoredOperario._id;
      
      let url = `/jornadas/operario/${operarioId}`;
      const params = new URLSearchParams();
      if (filterDate) { 
        params.append('fecha', filterDate); 
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(url);
      setJornadas(response.data);
    } catch (error) {
      console.error("Error al obtener las jornadas:", error);
      toast.error("No se pudieron cargar las jornadas.");
    } finally {
      setLoading(false);
    }
  }, [navigate, fechaFiltro]); // Added fechaFiltro to dependencies

  useEffect(() => {
    fetchJornadas();
    
  }, [fetchJornadas, location]); // Add location to the dependency array
  const handleFiltrarPorFecha = async () => {
    if (!fechaFiltro) {
      toast.info("Por favor selecciona una fecha para filtrar.");
      return;
    }
    setCurrentPage(1); // Reset to first page
    await fetchJornadas(fechaFiltro); // Pass the current fechaFiltro
  };
  const handleLimpiarFiltro = async () => {
    setFechaFiltro(''); // Clear the date input
    setCurrentPage(1); // Reset to first page
    await fetchJornadas(''); // Fetch all jornadas by passing an empty string
  };

  const toggleExpand = (jornadaId) => {
    setExpandedJornada((prev) => (prev === jornadaId ? null : jornadaId));
  };

  const handleOpenEditModal = (produccion) => {
    setSelectedProduccion(produccion);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduccion(null);
  };

  const handleGuardarEditModal = async () => {
    setShowEditModal(false);
    setSelectedProduccion(null);
    await fetchJornadas();
  };

const handleEliminarActividad = async (jornadaId, actividadId) => {
  confirmAlert({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que quieres eliminar esta actividad? Esta acción es irreversible.',
    buttons: [
      {
        label: 'Sí, eliminar',
        onClick: async () => {
          try {
            await axiosInstance.delete(`/produccion/eliminar/${actividadId}`);
            toast.success("Actividad eliminada con éxito");
            await fetchJornadas();
          } catch (error) {
            toast.error("No se pudo eliminar la actividad. Intenta de nuevo más tarde.");
          }
        },
        className: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg'
      },
      {
        label: 'Cancelar',
        onClick: () => toast.info('Eliminación cancelada.'),
        className: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg'
      }
    ],
    closeOnEscape: true,
    closeOnClickOutside: true,
    overlayClassName: "custom-overlay-confirm-alert"
  });
};
      
  if (loading) return <p>Cargando historial de jornadas...</p>;

  // Pagination logic
  const indexOfLastJornada = currentPage * jornadasPerPage;
  const indexOfFirstJornada = indexOfLastJornada - jornadasPerPage;
  const currentJornadas = jornadas.filter(jornada => jornada.registros?.length > 0).slice(indexOfFirstJornada, indexOfLastJornada);
  const totalPages = Math.ceil(jornadas.filter(jornada => jornada.registros?.length > 0).length / jornadasPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex bg-gray-100 min-h-screen h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">  
        <div className="container mx-auto py-8 max-w-7xl">
        <div className="flex-1 overflow-auto p-6"> 
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-between items-center mb-6">
              {/* Título y Nombre del Operario */}
              <div className="flex-grow">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">
                  Historial de Jornadas
                </h1>
                <p className="text-md text-gray-500">
                  <span className="font-semibold">{operarioName}</span>
                </p>
              </div>
           
              <div className="flex items-end gap-4 mt-4 md:mt-0"> 
                <div>
                  <label htmlFor="fechaFiltro" className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                  <input 
                    type="date" 
                    id="fechaFiltro" 
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button 
                  onClick={handleLimpiarFiltro} 
                  disabled={loading}
                  className="bg-gray-200 gray font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-500 transition-all duration-300 cursor-pointer h-10 flex items-center disabled:opacity-50 disabled:cursor-not-allowed" // Ajuste de altura y alineación
                >
                  {loading ? 'Limpiando...' : 'Limpiar Filtro'}
                </Button>
              </div>
            </div>

            {jornadas.length > 0 ? (
              <div className="space-y-6"> 
                {currentJornadas.map((jornada) => (
                  <Card key={jornada._id} className="p-6 shadow-lg border border-gray-200 rounded-xl bg-white transition-shadow duration-300 hover:shadow-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-semibold text-gray-700">Fecha: {ajustarFechaLocal(jornada.fecha).toLocaleDateString()}</p>
                        {/* Modificación para mostrar el tiempo total desde jornada.totalTiempoActividades */}
                        <p className="text-sm text-gray-500">
                          Tiempo Total: {jornada.totalTiempoActividades && typeof jornada.totalTiempoActividades.horas === 'number' && typeof jornada.totalTiempoActividades.minutos === 'number'
                            ? `${jornada.totalTiempoActividades.horas}h ${jornada.totalTiempoActividades.minutos}m`
                            : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">Actividades: {jornada.registros?.length || 0}</p>
                      </div>
                      <Button 
                        onClick={() => toggleExpand(jornada._id)}
                        variant="outline" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                      >
                        {expandedJornada === jornada._id ? (
                          <span className="flex items-center gap-2">
                            Ocultar <ChevronUpIcon className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Ver Actividades <ChevronDownIcon className="w-5 h-5" />
                          </span>
                        )}
                      </Button>
                    </div>

                    {expandedJornada === jornada._id && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <table className="w-full divide-y divide-gray-300 table-fixed">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="py-2 pl-2 pr-1 text-left text-xs font-semibold text-gray-900" style={{width: '12%'}}>Proceso</th>
                              <th scope="col" className="px-1 py-2 text-center text-xs font-semibold text-gray-900" style={{width: '6%'}}>Min</th>
                              <th scope="col" className="px-1 py-2 text-left text-xs font-semibold text-gray-900" style={{width: '6%'}}>OTI</th>
                              <th scope="col" className="px-1 py-2 text-left text-xs font-semibold text-gray-900" style={{width: '10%'}}>Área</th>
                              <th scope="col" className="px-1 py-2 text-left text-xs font-semibold text-gray-900" style={{width: '12%'}}>Máquina</th>
                              <th scope="col" className="px-1 py-2 text-left text-xs font-semibold text-gray-900" style={{width: '12%'}}>Insumos</th>
                              <th scope="col" className="px-1 py-2 text-left text-xs font-semibold text-gray-900" style={{width: '8%'}}>Tipo</th>
                              <th scope="col" className="px-1 py-2 text-center text-xs font-semibold text-gray-900" style={{width: '7%'}}>Inicio</th>
                              <th scope="col" className="px-1 py-2 text-center text-xs font-semibold text-gray-900" style={{width: '7%'}}>Fin</th>
                              <th scope="col" className="px-1 py-2 text-left text-xs font-semibold text-gray-900" style={{width: '15%'}}>Observaciones</th>
                              <th scope="col" className="relative py-2 pl-1 pr-2 text-center text-xs font-semibold text-gray-900" style={{width: '5%'}}>
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {jornada.registros
                            .sort((a, b) => new Date(a.horaInicio) - new Date(b.horaInicio))
                            .map((actividad) => (
                              <tr key={actividad._id}>
                                <td className="py-2 pl-2 pr-1 text-xs text-gray-900" style={{width: '12%'}}>
                                  <div className="break-words leading-tight">
                                    {actividad.procesos && actividad.procesos.length > 0 ? (
                                      actividad.procesos.map(p => p.nombre).join(', ')
                                    ) : (
                                      "N/A"
                                    )}
                                  </div>
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500 text-center" style={{width: '6%'}}>
                                  {actividad.tiempo}
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500" style={{width: '6%'}}>
                                  <div className="break-words leading-tight">{actividad.oti?.numeroOti || "N/A"}</div>
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500" style={{width: '10%'}}>
                                  <div className="break-words leading-tight">{actividad.areaProduccion?.nombre || "N/A"}</div>
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500" style={{width: '12%'}}>
                                  <div className="break-words leading-tight">{actividad.maquina?.nombre || "N/A"}</div>
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500" style={{width: '12%'}}>
                                  <div className="break-words leading-tight">
                                    {actividad.insumos && actividad.insumos.length > 0 ? (
                                      actividad.insumos.map(i => i.nombre).join(', ')
                                    ) : (
                                      "N/A"
                                    )}
                                  </div>
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500" style={{width: '8%'}}>
                                  <div className="break-words leading-tight">{actividad.tipoTiempo || "N/A"}</div>
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500 text-center" style={{width: '7%'}}>
                                  {actividad.horaInicio ? new Date(actividad.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500 text-center" style={{width: '7%'}}>
                                  {actividad.horaFin ? new Date(actividad.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                                </td>
                                <td className="px-1 py-2 text-xs text-gray-500" style={{width: '15%'}}>
                                  <div className="break-words leading-tight">
                                    {actividad.observaciones || "N/A"}
                                  </div>
                                </td>
                                <td className="relative py-2 pl-1 pr-2 text-center" style={{width: '5%'}}>
                                  <div className="flex flex-col gap-1 items-center">
                                    <button
                                      onClick={() => handleOpenEditModal(actividad)}
                                      className="bg-green-200 text-green-700 font-semibold px-1 py-0.5 rounded text-xs hover:bg-green-300 transition-all duration-300 cursor-pointer w-full"
                                      title="Editar"
                                    >
                                      <Pencil size={10} className="inline" />
                                    </button>
                                    <button
                                      onClick={() => handleEliminarActividad(jornada._id, actividad._id)}
                                      className="bg-red-200 text-red-700 font-semibold px-1 py-0.5 rounded text-xs hover:bg-red-300 transition-all duration-300 cursor-pointer w-full"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={10} className="inline" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">No se encontraron jornadas</h3>
                <p className="mt-1 text-sm text-gray-500">Parece que aún no hay registros de jornadas.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-4">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showEditModal && selectedProduccion && (
        <EditarProduccion
          produccion={selectedProduccion}
          onClose={handleCloseEditModal}
          onGuardar={handleGuardarEditModal}
          invokedAsModal={true}
        />
      )}
    </div>
    </div>
  );
};

export default HistorialJornadas;
