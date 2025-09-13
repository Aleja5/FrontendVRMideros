import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx-js-style';
import axiosInstance from '../utils/axiosInstance';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Button, Card } from '../components/ui';
import DetalleJornadaModal from '../components/DetalleJornadaModal';
import { SidebarAdmin } from '../components/SidebarAdmin';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { REFRESH_CONFIG } from '../utils/refreshConfig';

// Helper function to parse date strings as local dates at midnight
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  // Assuming dateString is in 'YYYY-MM-DD' format from input type="date"
  // or a full ISO string from the backend that needs to be treated as local
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed
};

    const ConsultaJornadas = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true); // Combined loading state for this page
  const [jornadaSearch, setJornadaSearch] = useState("");
  const [jornadaFechaInicio, setJornadaFechaInicio] = useState("");
  const [jornadaFechaFin, setJornadaFechaFin] = useState("");  
  const [selectedJornadaId, setSelectedJornadaId] = useState(null);
  const [jornadasTablePage, setJornadasTablePage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const jornadasTableItemsPerPage = 5; // Or your preferred number

  const fetchJornadas = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }

        try {
      // Add cache-busting parameter
      const timestamp = Date.now();      const response = await axiosInstance.get(`/jornadas?t=${timestamp}`);
      setJornadas(response.data);
      setLastUpdated(new Date());
      // REMOVED: console.log
    } catch (error) {
      console.error('Error al cargar jornadas:', error);
      if (showLoadingSpinner) {
        toast.error('No se pudieron cargar las jornadas. Intenta de nuevo más tarde.');
      }
      setJornadas([]); // Ensure jornadas is an array on error
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  }, []);  useEffect(() => {
    // Initial load
    fetchJornadas();
  }, [fetchJornadas]);

  // Setup auto-refresh using custom hook
  useAutoRefresh(() => {
    fetchJornadas(false); // Don't show loading spinner for auto-refresh
  }, REFRESH_CONFIG.PAGES.CONSULTA_JORNADAS);

  const exportarJornadasExcel = () => {
    // Función para convertir minutos a horas decimales
    const minutosAHorasDecimales = (minutos) => {
      if (minutos <= 0) return 0;
      return parseFloat((minutos / 60).toFixed(2));
    };

    // Usar directamente las jornadas ya filtradas en lugar de aplicar filtros nuevamente
    const jornadasFiltradasParaExportar = filteredJornadas;

    if (jornadasFiltradasParaExportar.length === 0) {
      toast.info('No hay jornadas para exportar con los filtros aplicados.');
      return;
    }

    const datosParaExcel = [];

    jornadasFiltradasParaExportar.forEach(j => {
      const fechaJornada = parseLocalDate(j.fecha);
      const fechaStr = fechaJornada ? fechaJornada.toLocaleDateString() : 'N/A';
      const operarioNombre = j.operario?.name || 'N/A';
      
      // Calcular horarios de jornada
      const horaInicioJornada = j.horaInicio ? new Date(j.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
      const horaFinJornada = j.horaFin ? new Date(j.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
      
      // Calcular duración total de jornada en minutos
      let tiempoTotalJornadaMinutos = 0;
      if (j.horaInicio && j.horaFin) {
        const inicio = new Date(j.horaInicio);
        let fin = new Date(j.horaFin);
        
        // Si la hora de fin es menor que la de inicio, asumimos que es del día siguiente
        if (fin <= inicio) {
          fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
        }
        
        tiempoTotalJornadaMinutos = Math.round((fin - inicio) / (1000 * 60));
      }
      
      const tiempoTotalJornadaFormateado = tiempoTotalJornadaMinutos > 0 
        ? `${Math.floor(tiempoTotalJornadaMinutos / 60)}h ${tiempoTotalJornadaMinutos % 60}m`
        : '';

      // Buscar permisos laborales en los registros
      const permisos = j.registros?.filter(registro => 
        registro.tipoTiempo === 'Permiso Laboral'
      ) || [];

      if (permisos.length > 0) {
        // Si hay permisos, crear una fila por cada permiso
        permisos.forEach(permiso => {
          const horaInicioPermiso = permiso.horaInicio ? new Date(permiso.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
          const horaFinPermiso = permiso.horaFin ? new Date(permiso.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
          const tipoPermiso = permiso.tipoPermiso || '';
          const tiempoPermisoMinutos = permiso.tiempo || 0;
          const tiempoPermisoFormateado = tiempoPermisoMinutos > 0 
            ? `${Math.floor(tiempoPermisoMinutos / 60)}h ${tiempoPermisoMinutos % 60}m`
            : '';
          
          // Calcular tiempo efectivo según el tipo de permiso
          let tiempoEfectivoMinutos;
          let tiempoEfectivoFormateado;
          
          if (tipoPermiso === 'permiso remunerado') {
            // Para permisos remunerados, NO descontar del tiempo total
            tiempoEfectivoMinutos = tiempoTotalJornadaMinutos;
            tiempoEfectivoFormateado = tiempoTotalJornadaFormateado;
          } else {
            // Para permisos NO remunerados, SÍ descontar del tiempo total
            tiempoEfectivoMinutos = tiempoTotalJornadaMinutos - tiempoPermisoMinutos;
            tiempoEfectivoFormateado = tiempoEfectivoMinutos > 0 
              ? `${Math.floor(tiempoEfectivoMinutos / 60)}h ${tiempoEfectivoMinutos % 60}m`
              : '';
          }
          
          // Convertir tiempo efectivo a horas decimales
          const tiempoEfectivoHorasDecimales = minutosAHorasDecimales(tiempoEfectivoMinutos);

          datosParaExcel.push({
            'Fecha': fechaStr,
            'Operario': operarioNombre,
            'Inicio jornada': horaInicioJornada,
            'Fin Jornada': horaFinJornada,
            'Total Jornada': tiempoTotalJornadaFormateado,
            'Inicio Permiso': horaInicioPermiso,
            'Fin Permiso': horaFinPermiso,
            'Total Permiso': tiempoPermisoFormateado,
            'Tipo de permiso': tipoPermiso,
            'Observaciones Permiso': permiso.observaciones || '',
            'Tiempo Total a Pagar': tiempoEfectivoFormateado,
            'Tiempo Total a Pagar EN HORAS': tiempoEfectivoHorasDecimales
          });
        });
      } else {
        // Si no hay permisos, crear una fila con datos de jornada solamente
        // Convertir tiempo total de jornada a horas decimales
        const tiempoTotalHorasDecimales = minutosAHorasDecimales(tiempoTotalJornadaMinutos);
        
        datosParaExcel.push({
          'Fecha': fechaStr,
          'Operario': operarioNombre,
          'Inicio jornada': horaInicioJornada,
          'Fin Jornada': horaFinJornada,
          'Total Jornada': tiempoTotalJornadaFormateado,
          'Inicio Permiso': '-',
          'Fin Permiso': '-',
          'Total Permiso': '-',
          'Tipo de permiso': '-',
          'Observaciones Permiso': '-',
          'Tiempo Total a Pagar': tiempoTotalJornadaFormateado,
          'Tiempo Total a Pagar EN HORAS': tiempoTotalHorasDecimales
        });
      }
    });

    try {
      const ws = XLSX.utils.json_to_sheet(datosParaExcel);
      
      // Configurar el ancho de las columnas
      const columnWidths = [
        { wch: 12 }, // Fecha
        { wch: 30 }, // Operario
        { wch: 10 }, // Inicio jornada
        { wch: 10 }, // Fin Jornada
        { wch: 15 }, // Total Jornada
        { wch: 10 }, // Inicio Permiso
        { wch: 10 }, // Fin Permiso
        { wch: 15 }, // Total Permiso
        { wch: 20 }, // Tipo de permiso  
        { wch: 20 }, // Observaciones Permiso      
        { wch: 15 }, // Tiempo Total a Pagar
        { wch: 20 }  // Tiempo Total a Pagar EN HORAS (formato decimal)
      ];
      ws['!cols'] = columnWidths;

      // Aplicar estilos a las celdas
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
          if (!ws[cellAddress]) continue;
          
          // Estilo para headers (fila 0)
          if (R === 0) {
            ws[cellAddress].s = {
              fill: { fgColor: { rgb: "4A90E2" } },
              font: { bold: true, color: { rgb: "FFFFFF" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          } else {
            // Estilo base para celdas de datos
            let cellStyle = {
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
              },
              alignment: { vertical: "center" }
            };
            
            // Aplicar colores específicos a columnas de totales
            if (C === 4) { // Total Jornada
              cellStyle.fill = { fgColor: { rgb: "E8F5E8" } };
              cellStyle.font = { color: { rgb: "2E7D32" } };
            } else if (C === 8) { // Total Permiso
              cellStyle.fill = { fgColor: { rgb: "FFF3E0" } };
              cellStyle.font = { color: { rgb: "F57C00" } };
            } else if (C === 9 || C === 10) { // Tiempo Total y EN MINUTOS
              cellStyle.fill = { fgColor: { rgb: "F3E5F5" } };
              cellStyle.font = { color: { rgb: "7B1FA2" } };
            }
            
            ws[cellAddress].s = cellStyle;
          }
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registro de Jornadas y Permisos');
      XLSX.writeFile(wb, 'registro_jornadas_y_permisos_laborales.xlsx');
      
      // Mensaje de éxito más informativo
      const cantidadJornadas = jornadasFiltradasParaExportar.length;
      const totalFilas = datosParaExcel.length;
      toast.success(`✅ Excel exportado exitosamente: ${cantidadJornadas} jornada${cantidadJornadas !== 1 ? 's' : ''} (${totalFilas} registro${totalFilas !== 1 ? 's' : ''} de detalle)`);
    } catch (error) {
      console.error("Error al exportar jornadas a Excel:", error);
      toast.error('Error al exportar jornadas a Excel. Intente de nuevo.');
    }
  };

    const handleJornadasPageChange = (newPage) => {
    setJornadasTablePage(newPage);
  };

    const filteredJornadas = jornadas
    .filter(j => {
      const tieneRegistros = j.registros && j.registros.length > 0;
      const coincideBusquedaOperario = !jornadaSearch || (j.operario?.name || "").toLowerCase().includes(jornadaSearch.toLowerCase());
      
      let coincideRangoFechas = true;
      const fechaJornada = parseLocalDate(j.fecha);

      if (jornadaFechaInicio) {
        const fechaInicioFiltro = parseLocalDate(jornadaFechaInicio);
        if (fechaJornada && fechaInicioFiltro && fechaJornada < fechaInicioFiltro) {
          coincideRangoFechas = false;
        }
      }

        if (coincideRangoFechas && jornadaFechaFin) {
        const fechaFinFiltro = parseLocalDate(jornadaFechaFin);
        if (fechaJornada && fechaFinFiltro && fechaJornada > fechaFinFiltro) {
          coincideRangoFechas = false;
        }
      }
      return tieneRegistros && coincideBusquedaOperario && coincideRangoFechas;
    })
    .sort((a, b) => {
      const dateA = parseLocalDate(a.fecha) || new Date(0);
      const dateB = parseLocalDate(b.fecha) || new Date(0);
      return dateB - dateA; // Sort by most recent date
    });

  const indexOfLastJornada = jornadasTablePage * jornadasTableItemsPerPage;
  const indexOfFirstJornada = indexOfLastJornada - jornadasTableItemsPerPage;
  const currentJornadas = filteredJornadas.slice(indexOfFirstJornada, indexOfLastJornada);
  const totalFilteredJornadas = filteredJornadas.length;

  // Calcular estadísticas de permisos
  const jornadasConPermisos = filteredJornadas.filter(j => 
    j.registros?.some(registro => registro.tipoTiempo === 'Permiso Laboral')
  );
  
  const totalPermisos = filteredJornadas.reduce((total, j) => {
    const permisos = j.registros?.filter(registro => registro.tipoTiempo === 'Permiso Laboral') || [];
    return total + permisos.length;
  }, 0);

  const tipoPermisosStats = {};
  filteredJornadas.forEach(j => {
    const permisos = j.registros?.filter(registro => registro.tipoTiempo === 'Permiso Laboral') || [];
    permisos.forEach(permiso => {
      const tipo = permiso.tipoPermiso || 'Sin especificar';
      tipoPermisosStats[tipo] = (tipoPermisosStats[tipo] || 0) + 1;
    });
  });

  return (
    <>    
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 h-screen">
          <SidebarAdmin />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">Consulta de Jornadas</h1>
                <p className="text-base md:text-lg text-gray-500 mt-1">Visualiza, filtra y exporta las jornadas registradas.</p>
            </div>
            <Card className="p-4 shadow-lg border border-gray-100">              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-700">Jornadas Registradas</h2>
                  {lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Última actualización: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fetchJornadas(true)} 
                    className="shadow-sm self-start sm:self-center text-sm px-3 py-2"
                    disabled={loading}
                  >
                    {loading ? '🔄' : '↻'} Actualizar
                  </Button>
                  <Button variant="outline" onClick={exportarJornadasExcel} className="shadow-sm self-start sm:self-center">
                    Exportar a Excel ({filteredJornadas.length})
                  </Button>
                </div>
              </div>
              {/* Filtros rápidos */}
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Buscar por operario..."
                  className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  value={jornadaSearch}
                  onChange={e => {
                    setJornadaSearch(e.target.value);
                    setJornadasTablePage(1); // Reset page on filter change
                  }}
                />
                <input
                  type="date"
                  placeholder="Fecha Inicio"
                  className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  value={jornadaFechaInicio}
                  onChange={e => {
                    setJornadaFechaInicio(e.target.value);
                    setJornadasTablePage(1); // Reset page on filter change
                  }}
                  title="Fecha de inicio"
                />
                <input
                  type="date"
                  placeholder="Fecha Fin"
                  className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  value={jornadaFechaFin}
                  onChange={e => {
                    setJornadaFechaFin(e.target.value);
                    setJornadasTablePage(1); // Reset page on filter change
                  }}
                  title="Fecha de fin"
                />
              </div>
              
              {loading && currentJornadas.length === 0 ? (
                 <div className="flex justify-center items-center py-8">
                    <span className="loader border-gray-500"></span>
                    <span className="ml-2 text-gray-500">Cargando jornadas...</span>
                </div>
              ) : !loading && currentJornadas.length === 0 ? (
                <p className="text-center py-4 text-gray-600">No se encontraron jornadas con los filtros aplicados o no hay jornadas con actividades registradas.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full bg-white rounded text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 font-semibold text-gray-800 text-left">Fecha</th>
                        <th className="p-3 font-semibold text-gray-800 text-left">Operario</th>
                        <th className="p-3 font-semibold text-gray-800 text-center">Jornada <br />Hora Inicio - Hora Fin</th>
                        <th className="p-3 font-semibold text-gray-800 text-center">Permisos <br />Hora Inicio - Hora Fin</th>
                        <th className="p-3 font-semibold text-gray-800 text-left">Tipo Permiso</th>
                        <th className="p-3 font-semibold text-gray-800 text-left">Observaciones de Permiso</th>
                        <th className="p-3 font-semibold text-gray-800 text-left">Tiempo Total</th>
                        <th className="p-3 font-semibold text-gray-800 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentJornadas.map((j, idx) => {
                        // Calcular información de permisos
                        const permisos = j.registros?.filter(registro => 
                          registro.tipoTiempo === 'Permiso Laboral'
                        ) || [];
                        
                        // Datos de la jornada
                        const fechaStr = parseLocalDate(j.fecha)?.toLocaleDateString() || 'N/A';
                        const operarioNombre = j.operario?.name || 'N/A';
                        
                        // Jornada: Hora Inicio - Hora Fin
                        const horaJornada = j.horaInicio && j.horaFin ? (
                          (new Date(j.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })) +
                          ' - ' +
                          (new Date(j.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
                        ) : 'N/A';
                        
                        // Permisos: Hora Inicio - Hora Fin
                        const horaPermiso = permisos.length > 0 ? (
                          permisos.map(p => 
                            `${p.horaInicio ? new Date(p.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--'} - ${p.horaFin ? new Date(p.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--'}`
                          ).join('\n')
                        ) : '-';
                        
                        // Tipo de Permiso
                        const tipoPermiso = permisos.length > 0 ? (
                          permisos.map(p => p.tipoPermiso || 'Sin especificar').join('\n')
                        ) : '-';
                        
                        // Observaciones de Permiso
                        const observacionesPermiso = permisos.length > 0 ? (
                          permisos.map(p => p.observaciones || 'Sin observaciones').join('\n')
                        ) : '-';
                        
                        // Usar el tiempo efectivo calculado por el backend
                        const tiempoEfectivo = j.tiempoEfectivoAPagar || { horas: 0, minutos: 0 };
                        const tiempoTotalAPagar = `${tiempoEfectivo.horas}h ${tiempoEfectivo.minutos}m`;
                        
                        

                        return (
                          <tr key={j._id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                            {/* Fecha */}
                            <td className="p-3 whitespace-nowrap">
                              {fechaStr}
                            </td>
                            
                            {/* Operario */}
                            <td className="p-3 whitespace-nowrap">
                              {operarioNombre}
                            </td>
                            
                            {/* Jornada - Hora Inicio - Hora Fin */}
                            <td className="p-3 whitespace-nowrap text-center">
                              {horaJornada}
                            </td>
                            
                            {/* Permisos - Hora Inicio - Hora Fin */}
                            <td className="p-3 text-center" style={{ whiteSpace: 'pre-line' }}>
                              {horaPermiso}
                            </td>
                            
                            {/* Tipo Permiso */}
                            <td className="p-3" style={{ whiteSpace: 'pre-line' }}>
                              {tipoPermiso}
                            </td>
                            
                            {/* Observaciones de Permiso */}
                            <td className="p-3 max-w-xs" style={{ whiteSpace: 'pre-line' }}>
                              <div className="truncate" title={observacionesPermiso}>
                                {observacionesPermiso}
                              </div>
                            </td>
                            
                            {/* Tiempo Total a Pagar */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium text-green-600">{tiempoTotalAPagar}</span>
                                {permisos.some(p => p.tipoPermiso === 'permiso NO remunerado') && (
                                  <span className="text-xs text-gray-500">
                                    (Descontado permiso no remunerado)
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            {/* Acciones */}
                            <td className="p-3 whitespace-nowrap text-center">
                              <Button
                                onClick={() => navigate(`/admin/jornada/${j._id}`)}                                                          
                                className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 rounded transition-colors bg-indigo-50 hover:bg-indigo-100"
                              >
                                Ver Detalles
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalFilteredJornadas > jornadasTableItemsPerPage && !loading && (
                <div className="bg-white p-4 shadow-md rounded-b-lg border-t border-gray-200 mt-2 flex justify-center sticky bottom-0 z-10">
                  <Pagination
                    currentPage={jornadasTablePage}
                    totalResults={totalFilteredJornadas}
                    itemsPerPage={jornadasTableItemsPerPage}
                    onPageChange={handleJornadasPageChange}
                  />
                </div>
              )}

              {selectedJornadaId && (
                <DetalleJornadaModal
                  jornadaId={selectedJornadaId}
                  onClose={() => setSelectedJornadaId(null)}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
      <style>{`
        .loader {
          border: 4px solid #e0e7ef; /* light gray */
          border-top: 4px solid #3b82f6; /* blue-500 */
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default ConsultaJornadas;
