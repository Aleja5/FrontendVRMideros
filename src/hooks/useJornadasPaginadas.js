import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import axiosInstance from '../utils/axiosInstance';

export const useJornadasPaginadas = (initialItemsPerPage = 10) => {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: initialItemsPerPage
  });
  
  const [filters, setFilters] = useState({
    search: "",
    fechaInicio: "",
    fechaFin: ""
  });

  // Función optimizada para fetch
  const fetchJornadas = useCallback(async (
    page = 1,
    customFilters = filters,
    showLoading = true,
    includeRegistros = false
  ) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        includeRegistros: includeRegistros ? 'true' : 'false'
      });

      Object.entries(customFilters).forEach(([key, value]) => {
        if (value) {
          const paramMap = {
            search: 'operario',
            fechaInicio: 'fechaInicio', 
            fechaFin: 'fechaFin'
          };
          params.append(paramMap[key] || key, value);
        }
      });

      if (showLoading) {
        params.append('t', Date.now().toString());
      }

      const response = await axiosInstance.get(`/jornadas-paginadas?${params}`);
      
      setJornadas(response.data.jornadas || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: initialItemsPerPage
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error fetching jornadas:', error);
      setError(error.message || 'Error al cargar jornadas');
      setJornadas([]);
      throw error;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filters, pagination.itemsPerPage, initialItemsPerPage]);

  // Debounced search
  const debouncedFetch = useCallback(
    debounce((page, filters) => {
      fetchJornadas(page, filters, true, false);
    }, 500),
    [fetchJornadas]
  );

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      debouncedFetch(1, updatedFilters);
      return updatedFilters;
    });
  }, [debouncedFetch]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchJornadas(newPage, filters, true, false);
  }, [fetchJornadas, filters]);

  // Refresh manual
  const refresh = useCallback(() => {
    fetchJornadas(pagination.currentPage, filters, true, false);
  }, [fetchJornadas, pagination.currentPage, filters]);

  // Auto refresh sin loading
  const autoRefresh = useCallback(() => {
    fetchJornadas(pagination.currentPage, filters, false, false);
  }, [fetchJornadas, pagination.currentPage, filters]);

  // Export data
  const exportData = useCallback(async () => {
    return await fetchJornadas(1, filters, false, true);
  }, [fetchJornadas, filters]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  return {
    // Data
    jornadas,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    updateFilters,
    changePage,
    refresh,
    autoRefresh,
    exportData,
    
    // Utils
    fetchJornadas
  };
};