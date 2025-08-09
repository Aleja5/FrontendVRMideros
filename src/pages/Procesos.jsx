import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProcesoForm from '../components/ProcesoForm';
import ProcesosList from '../components/ProcesosList';
import Pagination from '../components/Pagination';
import { SidebarAdmin } from '../components/SidebarAdmin';
import { PlusCircle } from 'lucide-react';

const ProcesoPage = ({ currentPage: propCurrentPage, totalResults: propTotalResults, itemsPerPage = 5 }) => {
    const [procesos, setProcesos] = useState([]);
    const [modo, setModo] = useState('listar'); // 'listar', 'crear', 'editar'
    const [procesoAEditar, setProcesoAEditar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [searchText, setSearchText] = useState(''); // Para la búsqueda de procesos
    const [filteredProcesos, setFilteredProcesos] = useState([]);
    const [currentPage, setCurrentPage] = useState(propCurrentPage || 1);
    const [totalResults, setTotalResults] = useState(propTotalResults || 0);
    const [estadoFiltro, setEstadoFiltro] = useState('activo');

    const cargarProcesos = useCallback(async (page = 1, search = '', estado = 'activo') => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/procesos?page=${page}&limit=${itemsPerPage}&search=${search}&estado=${estado}`);
            setProcesos(response.data.procesos);
            setTotalPages(response.data.totalPages);
            setTotalResults(response.data.totalResults);
        } catch (error) {
            console.error('Error al cargar los procesos:', error);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        cargarProcesos(currentPage, searchText, estadoFiltro); // Llama a cargarProcesos con los valores correctos
    }, [currentPage, cargarProcesos, searchText, estadoFiltro]); // Se ejecuta cada vez que currentPage, searchText o estadoFiltro cambian      


    useEffect(() => {
        if (procesos && Array.isArray(procesos)) {
            if (searchText) {
                const filtered = procesos.filter(procesos =>
                    procesos.nombre.toLowerCase().includes(searchText.toLowerCase())
                );
                setFilteredProcesos(filtered);
            } else {
                setFilteredProcesos(procesos);
            }
        } else {
            setFilteredProcesos([]); // O algún otro valor por defecto seguro
        }
    }, [searchText, procesos]);

    const handleSearchTextChange = (event) => {
        setSearchText(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Función para cambiar el filtro de estado
    const handleEstadoChange = (nuevoEstado) => {
        setEstadoFiltro(nuevoEstado);
        setCurrentPage(1);
        setSearchText('');
    };

    // Función para cambiar el estado de un proceso
    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/procesos/${id}/estado`, {
                estado: nuevoEstado
            });
            cargarProcesos(currentPage, searchText, estadoFiltro);
        } catch (error) {
            console.error('Error al cambiar estado del proceso:', error);
        }
    };

    const handleCrear = () => {
        setModo('crear');
    };

    const handleEditar = (proceso) => {
        setProcesoAEditar(proceso);
        setModo('editar');
    };

    const handleGuardar = async (proceso) => {
        try {
            if (procesoAEditar) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/procesos/${procesoAEditar._id}`, proceso);
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/procesos`, proceso);
            }
            cargarProcesos(currentPage, searchText, estadoFiltro); // Recarga con la página, búsqueda y estado actuales
            setModo('listar');
            setProcesoAEditar(null);
        } catch (error) {
            console.error('Error al guardar el proceso:', error);
        }
    };

    const handleEliminar = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/procesos/${id}`);
            cargarProcesos(currentPage, searchText, estadoFiltro); // Recarga con la página, búsqueda y estado actuales
        } catch (error) {
            console.error('Error al eliminar el proceso:', error);
        }
    };

    const handleCancelar = () => {
        setModo('listar');
        setProcesoAEditar(null);
    };

    return (
        <>
            <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 h-screen">
                <SidebarAdmin />

                <div className="flex-1 overflow-auto">
                    <div className="container mx-auto px-4 py-6">
                        {/* Header Card Mejorado */}
                        <div className="bg-gradient-to-r from-white to-gray-50 shadow-2xl rounded-3xl p-6 md:p-8 border border-gray-100 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">Gestión de Procesos</h1>
                                    <p className="text-gray-600 mt-2 text-lg">Administra y controla todos los procesos de producción de la planta</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <button
                                        onClick={handleCrear}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
                                    >
                                        <PlusCircle size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                        Crear Nuevo Proceso
                                    </button>

                                    {/* Filtros de Estado */}
                                    <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
                                        <button
                                            onClick={() => handleEstadoChange('activo')}
                                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${estadoFiltro === 'activo'
                                                ? 'bg-green-500 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:bg-white hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${estadoFiltro === 'activo' ? 'bg-green-200' : 'bg-green-400'
                                                }`}></div>
                                            Activos
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoFiltro === 'activo'
                                                ? 'bg-green-400 text-green-50'
                                                : 'bg-green-100 text-green-600'
                                                }`}>
                                                {estadoFiltro === 'activo' ? totalResults : '...'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleEstadoChange('inactivo')}
                                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${estadoFiltro === 'inactivo'
                                                ? 'bg-red-500 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:bg-white hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${estadoFiltro === 'inactivo' ? 'bg-red-200' : 'bg-red-400'
                                                }`}></div>
                                            Inactivos
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoFiltro === 'inactivo'
                                                ? 'bg-red-400 text-red-50'
                                                : 'bg-red-100 text-red-600'
                                                }`}>
                                                {estadoFiltro === 'inactivo' ? totalResults : '...'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleEstadoChange('todos')}
                                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${estadoFiltro === 'todos'
                                                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:bg-white hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${estadoFiltro === 'todos' ? 'bg-blue-200' : 'bg-blue-400'
                                                }`}></div>
                                            Todos
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoFiltro === 'todos'
                                                ? 'bg-blue-400 text-blue-50'
                                                : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {estadoFiltro === 'todos' ? totalResults : '...'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {modo === 'listar' && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                        <label htmlFor="searchText" className="sr-only">
                                            Buscar por Nombre:
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="searchText"
                                                value={searchText}
                                                onChange={handleSearchTextChange}
                                                placeholder="Buscar procesos..."
                                                className="appearance-none block w-full sm:w-80 pl-12 pr-4 py-3 text-gray-700 leading-tight border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-md"
                                            />
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Card */}
                        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-100">                            {loading ? (
                            <div className="flex justify-center items-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
                                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-gray-600 absolute top-0 left-0"></div>
                                </div>
                                <span className="ml-4 text-lg text-gray-600 font-medium">Cargando procesos...</span>
                            </div>
                        ) : (
                            <>
                                {modo === 'listar' && (
                                    <div className="space-y-6">
                                        {/* Estadísticas rápidas */}
                                        {!searchText && (
                                            <div className="bg-gradient-to-r from-white-50 to-gray-100 rounded-2xl p-6 border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-blue-100 p-3 rounded-xl">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-800">Total de Procesos</h3>
                                                            <p className="text-gray-600">Procesos de producción definidos</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-3xl font-bold text-blue-600">{totalResults}</span>
                                                        <p className="text-sm text-gray-500">activos</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <ProcesosList
                                            procesos={filteredProcesos}
                                            onEditar={handleEditar}
                                            onEliminar={handleEliminar}
                                            onCambiarEstado={handleCambiarEstado}
                                            estadoActual={estadoFiltro}
                                        />
                                    </div>
                                )}

                                {filteredProcesos.length > 0 && modo === 'listar' && searchText && (
                                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm font-medium text-green-800">
                                                {filteredProcesos.length} resultado{filteredProcesos.length !== 1 ? 's' : ''} encontrado{filteredProcesos.length !== 1 ? 's' : ''} para "{searchText}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {totalResults > 0 && modo === 'listar' && !searchText && totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                                            <Pagination
                                                totalResults={totalResults}
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                itemsPerPage={itemsPerPage}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(modo === 'crear' || (modo === 'editar' && procesoAEditar)) && (
                                    <div className="mt-8">
                                        <div className="bg-gradient-to-r from-gray-50 rounded-2xl shadow-inner border border-gray-200 overflow-hidden">
                                            <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white/20 p-2 rounded-lg">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modo === 'crear' ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                                                            </svg>
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-white">
                                                            {modo === 'crear' ? 'Crear Nuevo Proceso' : 'Editar Proceso'}
                                                        </h2>
                                                    </div>
                                                    {modo === 'editar' && (
                                                        <button
                                                            onClick={() => setModo('listar')}
                                                            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                            </svg>
                                                            Volver a la lista
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <ProcesoForm
                                                    procesoInicial={modo === 'editar' ? procesoAEditar : undefined}
                                                    onGuardar={handleGuardar}
                                                    onCancelar={handleCancelar}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProcesoPage;















