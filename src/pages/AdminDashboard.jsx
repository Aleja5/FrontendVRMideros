import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/filters/FilterPanel';
import * as XLSX from 'xlsx';
import { SidebarAdmin } from '../components/SidebarAdmin';
import axiosInstance from '../utils/axiosInstance';
import Pagination from '../components/Pagination'; 
import { toast } from 'react-toastify';
import { Button, Card } from '../components/ui';
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

const columnOptions = [
  { key: 'fecha', label: 'Fecha', defaultVisible: true },
  { key: 'proceso', label: 'Proceso', defaultVisible: true },
  { key: 'maquina', label: 'Máquina', defaultVisible: false },
  { key: 'area', label: 'Área', defaultVisible: false },
  { key: 'insumos', label: 'Insumos', defaultVisible: false },
  { key: 'observaciones', label: 'Observaciones', defaultVisible: false },
  { key: 'tipoTiempo', label: 'Tipo de Tiempo', defaultVisible: true },
  { key: 'tiempo', label: 'Tiempo (min)', defaultVisible: true },
];

const AdminDashboard = () => {
  const [resultados, setResultados] = useState([]);
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalHorasFiltrado, setTotalHorasFiltrado] = useState(0); // Tiempo total de todos los registros filtrados
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Define cuántos resultados mostrar por página
  const [totalResults, setTotalResults] = useState(0); // Para saber cuántos resultados totales hay
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null); // New state for active filters
  const [currentFiltersDisplay, setCurrentFiltersDisplay] = useState(null); // Información legible de los filtros
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // Estado para controlar el FilterPanel
  const [otiMap, setOtiMap] = useState(new Map()); // Mapa de _id -> numeroOti
 
  // State for individual column visibility
  const [columnVisibility, setColumnVisibility] = useState(
    columnOptions.reduce((acc, col) => {
      acc[col.key] = col.defaultVisible;
      return acc;
    }, {})
  );
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const handleColumnToggle = (columnKey) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Función para manejar cambios en el otiMap
  const handleOtiMapChange = (newOtiMap) => {
    setOtiMap(newOtiMap);
  };

  const getTipoTiempoBadge = (tipoTiempo) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    if (tipoTiempo) {
      const lowerTipoTiempo = tipoTiempo.toLowerCase();
      if (lowerTipoTiempo.includes('operacion') || lowerTipoTiempo.includes('operación')) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
      } else if (lowerTipoTiempo.includes('preparacion') || lowerTipoTiempo.includes('preparación')) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
      } else if (lowerTipoTiempo.includes('alimentacion') || lowerTipoTiempo.includes('alimentación')) {
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
      }  else if (lowerTipoTiempo.includes('mantenimiento')) {
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
      }
    }

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor} whitespace-nowrap`}>
        {tipoTiempo || 'N/A'}
      </span>
    );
  };

  const calcularTotalHoras = (data) => {
    if (Array.isArray(data)) {
      const total = data.reduce((sum, r) => sum + (r.tiempo || 0), 0);
      setTotalHoras(total);
    } else {
      setTotalHoras(0);
    }
  };

  // Función para obtener el tiempo total de TODOS los registros filtrados (sin paginación)
  const obtenerTiempoTotalFiltrado = async (filtros) => {
    try {
      const filtrosAjustados = { ...filtros };
      
      // Manejo correcto de fechas para evitar problemas de zona horaria
      if (filtros.fechaInicio) {
        const date = new Date(filtros.fechaInicio);
        const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        filtrosAjustados.fechaInicio = fechaLocal;
      }
      if (filtros.fechaFin) {
        const date = new Date(filtros.fechaFin);
        const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        filtrosAjustados.fechaFin = fechaLocal;
      }

      const params = {
        page: 1,
        limit: 50000, // Obtener todos los registros
        t: Date.now(),
        ...filtrosAjustados,
      };

      const response = await axiosInstance.get('/produccion/buscar-produccion', { params });
      
      if (response.data.resultados && Array.isArray(response.data.resultados)) {
        const tiempoTotal = response.data.resultados.reduce((sum, r) => sum + (r.tiempo || 0), 0);
        setTotalHorasFiltrado(tiempoTotal);
        console.log('🔢 Tiempo total filtrado calculado:', tiempoTotal, 'minutos');
      } else {
        setTotalHorasFiltrado(0);
      }
    } catch (error) {
      console.error('Error al calcular tiempo total filtrado:', error);
      setTotalHorasFiltrado(0);
    }
  };

  // Función para construir la información legible de los filtros usando datos de los resultados
  const construirFiltrosDisplay = async (filtros) => {
    const displayFilters = {};
    
    try {
      // Para cada filtro, construir la información legible
      for (const [key, value] of Object.entries(filtros)) {
        if (!value || value === '') continue;
        
        switch (key) {
          case 'oti':
            // Buscar el número de OTI en los resultados actuales primero
            const otiEncontrada = resultados.find(r => r.oti?._id === value);
            if (otiEncontrada && otiEncontrada.oti?.numeroOti) {
              displayFilters[key] = otiEncontrada.oti.numeroOti;
            } else if (otiMap && otiMap.has(value)) {
              // Usar el otiMap como segunda opción
              displayFilters[key] = otiMap.get(value);
            } else {
              // Crear una petición directa al endpoint específico de OTI
              try {
                const response = await axiosInstance.get(`/produccion/oti/${value}`);
                displayFilters[key] = response.data.numeroOti || value;
              } catch (error) {
                console.error('Error al buscar OTI por ID:', error);
                displayFilters[key] = value; // Mostrar el ID como fallback
              }
            }
            break;
            
          case 'operario':
            // Buscar en los resultados actuales primero
            const operarioEncontrado = resultados.find(r => r.operario?._id === value);
            if (operarioEncontrado && operarioEncontrado.operario?.name) {
              displayFilters[key] = operarioEncontrado.operario.name;
            } else {
              // Si no está en los resultados actuales, hacer petición HTTP
              try {
                const response = await axiosInstance.get(`/operarios/${value}`);
                displayFilters[key] = response.data.name || value;
              } catch (error) {
                displayFilters[key] = value;
              }
            }
            break;
            
          case 'proceso':
            // Buscar en los resultados actuales primero
            const procesoEncontrado = resultados.find(r => 
              r.procesos && r.procesos.some(p => p._id === value)
            );
            if (procesoEncontrado) {
              const proceso = procesoEncontrado.procesos.find(p => p._id === value);
              displayFilters[key] = proceso?.nombre || value;
            } else {
              // Si no está en los resultados actuales, hacer petición HTTP
              try {
                const response = await axiosInstance.get(`/procesos/${value}`);
                displayFilters[key] = response.data.nombre || value;
              } catch (error) {
                displayFilters[key] = value;
              }
            }
            break;
            
          case 'areaProduccion':
            // Buscar en los resultados actuales primero
            const areaEncontrada = resultados.find(r => r.areaProduccion?._id === value);
            if (areaEncontrada && areaEncontrada.areaProduccion?.nombre) {
              displayFilters[key] = areaEncontrada.areaProduccion.nombre;
            } else {
              // Si no está en los resultados actuales, hacer petición HTTP
              try {
                const response = await axiosInstance.get(`/areas/${value}`);
                displayFilters[key] = response.data.nombre || value;
              } catch (error) {
                displayFilters[key] = value;
              }
            }
            break;
            
          case 'maquina':
            // Buscar en los resultados actuales primero
            const maquinaEncontrada = resultados.find(r => r.maquina?._id === value);
            if (maquinaEncontrada && maquinaEncontrada.maquina?.nombre) {
              displayFilters[key] = maquinaEncontrada.maquina.nombre;
            } else {
              // Si no está en los resultados actuales, hacer petición HTTP
              try {
                const response = await axiosInstance.get(`/maquinas/${value}`);
                displayFilters[key] = response.data.nombre || value;
              } catch (error) {
                displayFilters[key] = value;
              }
            }
            break;
            
          case 'fechaInicio':
          case 'fechaFin':
            // Para fechas, formatear para mejor legibilidad
            displayFilters[key] = new Date(value).toLocaleDateString();
            break;
            
          default:
            displayFilters[key] = value;
        }
      }
      
      return displayFilters;
    } catch (error) {
      console.error('Error al construir filtros display:', error);
      return filtros; // Fallback a los filtros originales
    }
  };

    const handleBuscar = async (filtrosRecibidos, filtrosDisplay = null) => {
        setLoading(true);
        setError(null);
        setCurrentPage(1); 
        setCurrentFilters(filtrosRecibidos);

        try {
            const filtrosAjustados = { ...filtrosRecibidos };
            
            // Manejo correcto de fechas para evitar problemas de zona horaria
            if (filtrosRecibidos.fechaInicio) {
                const date = new Date(filtrosRecibidos.fechaInicio);
                // Usar formato YYYY-MM-DD para evitar conversión de zona horaria
                const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                filtrosAjustados.fechaInicio = fechaLocal;
                console.log('🗓️ Fecha inicio procesada:', {
                    original: filtrosRecibidos.fechaInicio,
                    procesada: fechaLocal,
                    local: date.toLocaleDateString()
                });
            }
            if (filtrosRecibidos.fechaFin) {
                const date = new Date(filtrosRecibidos.fechaFin);
                // Usar formato YYYY-MM-DD para evitar conversión de zona horaria
                const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                filtrosAjustados.fechaFin = fechaLocal;
                console.log('🗓️ Fecha fin procesada:', {
                    original: filtrosRecibidos.fechaFin,
                    procesada: fechaLocal,
                    local: date.toLocaleDateString()
                });
            }            

            const params = {
                page: 1, 
                limit: itemsPerPage,
                t: Date.now(), // Cache-busting parameter
                ...filtrosAjustados,
            };

            const response = await axiosInstance.get('/produccion/buscar-produccion', { params });

            if (response.data.resultados && Array.isArray(response.data.resultados)) {
                let resultadosOrdenados = response.data.resultados;

                // Siempre ordenar por fecha del más reciente al más antiguo
                resultadosOrdenados = resultadosOrdenados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                setResultados(resultadosOrdenados);
                calcularTotalHoras(resultadosOrdenados);
                setTotalResults(response.data.totalResultados || response.data.totalResults || 0);
                setLastUpdated(new Date());

                // Calcular tiempo total de TODOS los registros filtrados
                await obtenerTiempoTotalFiltrado(filtrosRecibidos);
                
                // Los filtros display se construirán automáticamente en el useEffect
            } else {
                setResultados([]);
                setTotalHoras(0);
                setTotalResults(0);
                setTotalHorasFiltrado(0);
                setCurrentFiltersDisplay(null);
                toast.info(response.data?.msg || 'Sin resultados para los filtros aplicados.');
            }
        } catch (err) {
            setError('No se pudo buscar los registros. Intenta de nuevo más tarde.');
            setResultados([]);
            setTotalHoras(0);
            setTotalResults(0);
            setTotalHorasFiltrado(0);
            setCurrentFiltersDisplay(null);
            toast.error('No se pudo buscar los registros. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };
  // 🔄 Cargar producciones (filtered or all)
  const cargarProducciones = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      let response;      if (currentFilters && Object.keys(currentFilters).length > 0) {
        // Fetch filtered data
        const filtrosAjustados = { ...currentFilters };
        
        // Manejo correcto de fechas para evitar problemas de zona horaria
        if (currentFilters.fechaInicio) {
            const date = new Date(currentFilters.fechaInicio);
            const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            filtrosAjustados.fechaInicio = fechaLocal;
        }
        if (currentFilters.fechaFin) {
            const date = new Date(currentFilters.fechaFin);
            const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            filtrosAjustados.fechaFin = fechaLocal;
        }

        const params = {
          page: currentPage,
          limit: itemsPerPage,
          t: Date.now(), // Cache-busting parameter
          ...filtrosAjustados,
        };
        response = await axiosInstance.get('/produccion/buscar-produccion', { params });
      } else {
        // Fetch all data (paginated)
        response = await axiosInstance.get(`/admin/admin-producciones?page=${currentPage}&limit=${itemsPerPage}&t=${Date.now()}`);
      }

      if (response.data.resultados && Array.isArray(response.data.resultados)) {
        // Siempre ordenar por fecha del más reciente al más antiguo
        const resultadosOrdenados = response.data.resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        setResultados(resultadosOrdenados);
        setTotalResults(response.data.totalResultados || response.data.totalResults || 0);
        calcularTotalHoras(resultadosOrdenados);
        setLastUpdated(new Date());
        console.log('🔄 Datos de producción actualizados:', resultadosOrdenados.length);

        // Si hay filtros activos, calcular tiempo total filtrado
        if (currentFilters && Object.keys(currentFilters).length > 0) {
          await obtenerTiempoTotalFiltrado(currentFilters);
          // Los filtros display se construirán automáticamente en el useEffect
        } else {
          // Si no hay filtros, el tiempo total de la página es el mismo que el filtrado
          setTotalHorasFiltrado(0); // Reset cuando no hay filtros
          setCurrentFiltersDisplay(null); // Reset display filters
        }
      } else {
        setResultados([]);
        setTotalResults(0);
        setTotalHoras(0);
        setTotalHorasFiltrado(0);
      }    } catch (error) {
      console.error('Error al cargar producciones:', error);
      
      // Mejorar el mensaje de error basado en el tipo de error
      let errorMessage = "No se pudieron cargar los registros. Intenta de nuevo más tarde.";
      
      if (error.message?.includes('sesión ha expirado')) {
        errorMessage = "Tu sesión ha expirado. Redirigiendo al login...";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      } else if (error.response?.status === 403) {
        errorMessage = "No tienes permisos para acceder a esta información.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Error del servidor. Intenta nuevamente más tarde.";
      }
      
      setError(errorMessage);
      setResultados([]);
      setTotalResults(0);
      setTotalHoras(0);
      setTotalHorasFiltrado(0);
      
      if (showLoadingSpinner) {
        toast.error(errorMessage);
      }
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  }, [currentPage, itemsPerPage, currentFilters]);  useEffect(() => {
    // Initial load
    cargarProducciones();
  }, [cargarProducciones]);

  // Efecto para construir filtros display cuando cambien los resultados o filtros
  useEffect(() => {
    const construirDisplayAsync = async () => {
      if (currentFilters && Object.keys(currentFilters).length > 0 && resultados.length > 0) {
        const displayFilters = await construirFiltrosDisplay(currentFilters);
        setCurrentFiltersDisplay(displayFilters);
      }
    };
    
    construirDisplayAsync();
  }, [resultados, currentFilters]);

  // Setup auto-refresh using custom hook
  useAutoRefresh(() => {
    cargarProducciones(false); // Don't show loading spinner for auto-refresh
  }, REFRESH_CONFIG.PAGES.ADMIN_DASHBOARD);

  const exportarExcel = async () => {
    try {
      let allResults = [];      if (currentFilters && Object.keys(currentFilters).length > 0) {
        // Si hay filtros, pedir todos los resultados filtrados (sin paginación)
        const filtrosAjustados = { ...currentFilters };
          // Manejo correcto de fechas para evitar problemas de zona horaria
        if (currentFilters.fechaInicio) {
          const date = new Date(currentFilters.fechaInicio);
          const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          filtrosAjustados.fechaInicio = fechaLocal;
        }
        if (currentFilters.fechaFin) {
          const date = new Date(currentFilters.fechaFin);
          const fechaLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          filtrosAjustados.fechaFin = fechaLocal;
        }        const params = {
          page: 1,
          limit: 10000, // Asume que nunca habrá más de 10,000 resultados filtrados
          t: Date.now(), // Cache-busting parameter
          ...filtrosAjustados,
        };
        const response = await axiosInstance.get('/produccion/buscar-produccion', { params });
        allResults = response.data.resultados || [];      } else {
        // Si no hay filtros, pedir todos los resultados (sin paginación)
        const response = await axiosInstance.get(`/admin/admin-producciones?page=1&limit=10000&t=${Date.now()}`);
        allResults = response.data.resultados || [];
      }
      if (!allResults.length) {
        toast.info('No hay datos para exportar.');
        return;
      }      const rows = allResults.map((r) => ({
        Fecha: new Date(r.fecha).toISOString().split('T')[0],
        Area: r.areaProduccion?.nombre || '',
        OTI: r.oti?.numeroOti || (r.oti?._id && otiMap.has(r.oti._id) ? otiMap.get(r.oti._id) : r.oti?._id || ''),
        Proceso: r.procesos && r.procesos.length > 0 ? r.procesos.map(p => p.nombre).join(', ') : '',
        Maquina: r.maquina?.nombre || '',
        Insumos: r.insumos && r.insumos.length > 0 ? r.insumos.map(i => i.nombre).join(', ') : '',
        Operario: r.operario?.name || '',
        'Tipo de Tiempo': r.tipoTiempo || '',
        'Hora Inicio': r.horaInicio ? new Date(r.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        'Hora Fin': r.horaFin ? new Date(r.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        Tiempo: r.tiempo,
        Observaciones: r.observaciones || '',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Producción');
      XLSX.writeFile(wb, 'produccion.xlsx');
    } catch (error) {
      toast.error('No se pudo exportar el Excel. Intenta de nuevo más tarde.');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // No direct fetch here, useEffect will handle it due to currentPage change
    console.log("Página cambiada a:", newPage);
  };


  return (
    <>    
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"> {/* Changed min-h-screen to h-screen */}
        
        <div className="flex bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 h-screen">
          <SidebarAdmin />
        </div>

        {/* Contenido principal con scroll y ancho flexible */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="container mx-auto px-4 py-8 flex flex-col flex-grow overflow-hidden">
            {/* Encabezado */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 flex-shrink-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">Consultas de Producción</h1>
                <p className="text-lg text-gray-500 mt-2">Panel de consulta y exportación de registros de producción</p>
              </div>
              <div className="flex gap-3 mt-2 md:mt-0">
                {/* Botón para mostrar/ocultar filtros en móvil */}
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="md:hidden bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                  </svg>
                  {isFilterPanelOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </button>
                {/* Styled Exportar Excel button */}
                <button
                  onClick={exportarExcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-down"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m15 15-3 3-3-3"/></svg>
                  <span className="hidden sm:inline">Exportar Excel</span>
                  <span className="sm:hidden">Excel</span>
                </button>
              </div>
            </div>

            {/* Contenedor principal con scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* Filtros */}
              <div className={`mb-4 transition-all duration-300 ${isFilterPanelOpen ? 'block' : 'hidden'} md:block`}>
                <Card className="p-3 bg-white shadow-lg rounded-lg">
                  <FilterPanel onBuscar={handleBuscar} onExportar={exportarExcel} onOtiMapChange={handleOtiMapChange} />
                </Card>
              </div>

              {/* Resultados */}
              <Card className="mb-8 p-4 bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: '600px' }}>                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 flex-shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-blue-700">Resultados</h2> {/* Increased text size */}
                  {lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Última actualización: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}                </div>
                <div className="flex items-center gap-4"> {/* Grouped button and total */}
                  <Button 
                    variant="outline" 
                    onClick={() => cargarProducciones(true)} 
                    className="shadow-sm text-sm px-3 py-2"
                    disabled={loading}
                  >
                    {loading ? '🔄' : '↻'} Actualizar
                  </Button>
                  <div className="relative inline-block text-left">
                    {/* Styled Configurar Columnas button */}
                    <Button
                      onClick={() => setIsColumnDropdownOpen(prev => !prev)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg shadow-sm hover:shadow transition duration-150 ease-in-out flex items-center gap-2 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                      Columnas
                    </Button>
                    {isColumnDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          {columnOptions.map(col => (
                            <label key={col.key} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left cursor-pointer" role="menuitem">
                              <input
                                type="checkbox"
                                checked={!!columnVisibility[col.key]}
                                onChange={() => handleColumnToggle(col.key)}
                                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" // Added focus:ring-offset-0
                              />
                              {col.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sección de Resumen de Tiempo Total */}
              {(currentFilters && Object.keys(currentFilters).length > 0) && (
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-blue-800">Resumen de Filtros Aplicados</h3>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200">
                        <span className="text-sm text-gray-600">Registros encontrados:</span>
                        <span className="ml-2 text-lg font-bold text-blue-700">{totalResults}</span>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200">
                        <span className="text-sm text-gray-600">Tiempo total:</span>
                        <span className="ml-2 text-lg font-bold text-green-700">
                          {totalHorasFiltrado} min
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({(totalHorasFiltrado / 60).toFixed(1)}h)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mostrar filtros activos */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex flex-wrap gap-2">
                      {currentFiltersDisplay && Object.entries(currentFiltersDisplay).map(([key, value]) => {
                        if (!value || value === '') return null;
                        
                        let displayKey = key;
                        let displayValue = value;
                        
                        // Formatear nombres de filtros para mejor legibilidad
                        switch (key) {
                          case 'fechaInicio':
                            displayKey = 'Fecha inicio';
                            break;
                          case 'fechaFin':
                            displayKey = 'Fecha fin';
                            break;
                          case 'oti':
                            displayKey = 'OTI';
                            break;
                          case 'operario':
                            displayKey = 'Operario';
                            break;
                          case 'areaProduccion':
                            displayKey = 'Área';
                            break;
                          case 'maquina':
                            displayKey = 'Máquina';
                            break;
                          case 'proceso':
                            displayKey = 'Proceso';
                            break;
                        }
                        
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {displayKey}: {displayValue}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Contenedor de tabla con scroll vertical y horizontal optimizado */}
              <div className="flex-grow border border-gray-200 rounded-lg overflow-hidden table-container">
              {loading ? (
                <div className="flex justify-center items-center h-full min-h-[200px]">
                  <span className="loader border-blue-500"></span>
                  <span className="ml-3 text-blue-600 text-lg">Cargando registros...</span>
                </div>              
              ) : (
                <>
                  {resultados.length > 0 ? (
                    <div className="h-full overflow-x-auto overflow-y-auto table-scroll-container" style={{ minHeight: '200px' }}>                        <table className="w-full bg-white text-sm" style={{ minWidth: '1200px' }}>{/* Ancho mínimo fijo para garantizar scroll horizontal */}
                          <thead className="bg-gray-100 sticky top-0 z-10">{/* Darker gray for header, ensured no space before tr */}
                            <tr>
                              {/* Adjusted padding, text alignment, and font style for th */}
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '100px'}}>OTI</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '120px'}}>Operario</th>
                              {columnVisibility.fecha && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '100px'}}>Fecha</th>}
                              {columnVisibility.proceso && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '150px'}}>Proceso</th>}
                              {columnVisibility.maquina && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '120px'}}>Máquina</th>}
                              {columnVisibility.area && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '120px'}}>Área</th>}
                              {columnVisibility.insumos && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '150px'}}>Insumos</th>}
                              {columnVisibility.observaciones && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '200px'}}>Observaciones</th>}
                              {columnVisibility.tipoTiempo && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '120px'}}>Tipo de Tiempo</th>}
                              {columnVisibility.tiempo && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap" style={{minWidth: '100px'}}>Tiempo (min)</th>}
                            </tr>
                          </thead>{/* Ensured no space after thead */}
                          <tbody className="bg-white divide-y divide-gray-200">{/* Ensured no space before tr */}
                            {resultados.map((r, idx) => (
                              <tr
                                key={r._id}
                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                              >{/* Ensured no space before td */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{minWidth: '100px'}}>{r.oti?.numeroOti || (r.oti?._id && otiMap.has(r.oti._id) ? otiMap.get(r.oti._id) : r.oti?._id || 'N/A')}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{minWidth: '120px'}}>{r.operario?.name || 'N/A'}</td>
                                {columnVisibility.fecha ? <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{minWidth: '100px'}}>{new Date(r.fecha).toISOString().split('T')[0]}</td> : null}
                                {columnVisibility.proceso ? (
                                  <td className="px-4 py-4 text-sm text-gray-700" style={{minWidth: '150px'}}>
                                    <div className="break-words">
                                      {r.procesos && r.procesos.length > 0 ? (
                                        r.procesos.map(p => p.nombre).join(', ')
                                      ) : (
                                        'N/A'
                                      )}
                                    </div>
                                  </td>
                                ) : null}
                                {columnVisibility.maquina ? <td className="px-4 py-4 text-sm text-gray-700" style={{minWidth: '120px'}}><div className="break-words">{r.maquina?.nombre || 'N/A'}</div></td> : null}
                                {columnVisibility.area ? <td className="px-4 py-4 text-sm text-gray-700" style={{minWidth: '120px'}}><div className="break-words">{r.areaProduccion?.nombre || 'N/A'}</div></td> : null}
                                {columnVisibility.insumos ? (
                                  <td className="px-4 py-4 text-sm text-gray-700" style={{minWidth: '150px'}}>
                                    <div className="break-words">
                                      {r.insumos && r.insumos.length > 0 ? r.insumos.map(i => i.nombre).join(', ') : 'N/A'}
                                    </div>
                                  </td>
                                ) : null}
                                {columnVisibility.observaciones ? <td className="px-4 py-4 text-sm text-gray-700" style={{minWidth: '200px'}}><div className="break-words">{r.observaciones || ''}</div></td> : null}
                                {columnVisibility.tipoTiempo ? <td className="px-4 py-4 text-sm text-gray-700 text-center" style={{minWidth: '120px'}}>{getTipoTiempoBadge(r.tipoTiempo)}</td> : null}
                                {columnVisibility.tiempo ? <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600" style={{minWidth: '100px'}}>{r.tiempo} min</td> : null}
                              </tr>
                            ))}
                          </tbody>{/* Ensured no space after tbody */}
                        </table>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-full min-h-[200px]">
                      <p className="py-8 text-center text-gray-500">No se encontraron registros con los filtros aplicados.</p>
                    </div>
                  )}
                </>
              )}           
              </div> {/* This closes the table container with scroll */}

              {totalResults > itemsPerPage && !loading && ( // Added !loading condition here
                // Consistent pagination container style
                <div className="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200 sm:px-6 mt-auto rounded-b-lg flex-shrink-0">
                  <Pagination
                    currentPage={currentPage}
                    totalResults={totalResults}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </Card>
            </div>
          </div>
        </div>
      </div>      
      {/* Loader CSS */}
      <style>{`
        .loader {
          border: 4px solid #e0e7ef; /* Lighter border */
          border-top: 4px solid #3b82f6; /* Blue accent */
          border-radius: 50%;
          width: 32px; /* Slightly smaller */
          height: 32px; /* Slightly smaller */
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Asegurar que el scroll horizontal sea siempre visible en móvil */
        @media (max-width: 768px) {
          .table-scroll-container {
            overflow-x: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .table-scroll-container::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          .table-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .table-scroll-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          .table-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
          
          /* Altura fija para móvil que permita ver la tabla completa */
          .table-container {
            height: 350px !important;
            max-height: 350px !important;
          }
        }
        
        /* Para tablet y desktop */
        @media (min-width: 769px) {
          .table-container {
            height: 500px !important;
            max-height: 500px !important;
          }
        }
      `}</style>      
    </>    
  );
};

export default AdminDashboard;
