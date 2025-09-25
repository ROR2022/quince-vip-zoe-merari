import { useState, useCallback, useEffect } from 'react';
import { Guest, GuestsResponse, GuestResponse, GuestFilters, GuestFormData } from '../types/guests.types';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false); // ✅ CAMBIADO: Inicia en false
  const [error, setError] = useState<string | null>(null);
  
  // 🔄 NUEVO: Separar filtros temporales de los aplicados
  const [tempFilters, setTempFilters] = useState<GuestFilters>({
    search: '',
    status: 'all',
    relation: 'all'
  });
  
  const [appliedFilters, setAppliedFilters] = useState<GuestFilters>({
    search: '',
    status: 'all',
    relation: 'all'
  });

  // Función para obtener invitados con filtros
  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Usar appliedFilters para la API
      const params = new URLSearchParams();
      if (appliedFilters.search.trim()) {
        params.append('search', appliedFilters.search.trim());
      }
      if (appliedFilters.status !== 'all') {
        params.append('status', appliedFilters.status);
      }
      if (appliedFilters.relation !== 'all') {
        params.append('relation', appliedFilters.relation);
      }
      params.append('limit', '100'); // Por ahora sin paginación

      // 🐛 DEBUG: Log para verificar filtros
      console.log('🔍 Fetching guests with applied filters:', {
        search: appliedFilters.search,
        status: appliedFilters.status,
        relation: appliedFilters.relation,
        url: `/api/guests?${params.toString()}`
      });

      const response = await fetch(`/api/guests?${params.toString()}`);
      const result: GuestsResponse = await response.json();

      if (result.success) {
        console.log('✅ Guests fetched successfully:', {
          totalFound: result.data.guests.length,
          appliedFilters: { search: appliedFilters.search, status: appliedFilters.status, relation: appliedFilters.relation }
        });
        setGuests(result.data.guests);
      } else {
        setError(result.error || 'Error al cargar invitados');
      }
    } catch (err) {
      setError('Error de conexión al cargar invitados');
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]); // ✅ Dependencia cambiada a appliedFilters

  // Función para crear invitado
  const createGuest = async (guestData: GuestFormData): Promise<Guest | null> => {
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      const result: GuestResponse = await response.json();

      if (result.success) {
        // Refrescar la lista
        await fetchGuests();
        return result.data;
      } else {
        setError(result.error || 'Error al crear invitado');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al crear invitado');
      console.error('Error creating guest:', err);
      return null;
    }
  };

  // Función para actualizar invitado
  const updateGuest = async (id: string, guestData: Partial<GuestFormData>): Promise<Guest | null> => {
    try {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      const result: GuestResponse = await response.json();

      if (result.success) {
        // Actualizar la lista local
        setGuests(prev => prev.map(guest => 
          guest._id === id ? result.data : guest
        ));
        return result.data;
      } else {
        setError(result.error || 'Error al actualizar invitado');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al actualizar invitado');
      console.error('Error updating guest:', err);
      return null;
    }
  };

  // Función para eliminar invitado
  const deleteGuest = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
      });

      const result: GuestResponse = await response.json();

      if (result.success) {
        // Remover de la lista local
        setGuests(prev => prev.filter(guest => guest._id !== id));
        return true;
      } else {
        setError(result.error || 'Error al eliminar invitado');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al eliminar invitado');
      console.error('Error deleting guest:', err);
      return false;
    }
  };

  // 🔄 Función para actualizar filtros temporales (UI)
  const updateTempFilters = (newFilters: Partial<GuestFilters>) => {
    console.log('🔄 Updating temp filters:', { 
      previous: tempFilters, 
      new: newFilters, 
      merged: { ...tempFilters, ...newFilters } 
    });
    setTempFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 🔄 Función para aplicar filtros (ejecutar la búsqueda)
  const applyFilters = () => {
    console.log('🚀 Applying filters:', tempFilters);
    setAppliedFilters(tempFilters);
  };

  // 🔄 Función para limpiar filtros
  const clearFilters = () => {
    console.log('🧹 Clearing filters');
    const emptyFilters = { search: '', status: 'all' as const, relation: 'all' as const };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Función para refrescar datos
  const refresh = () => {
    fetchGuests();
  };

  // ✅ NUEVO: useEffect para ejecutar fetchGuests cuando appliedFilters cambian
  useEffect(() => {
    // Solo ejecutar si hay filtros aplicados
    if (appliedFilters.search.trim() || appliedFilters.status !== 'all' || appliedFilters.relation !== 'all' || guests.length > 0) {
      fetchGuests();
    }
  }, [fetchGuests, appliedFilters.search, appliedFilters.status, appliedFilters.relation]);

  // ❌ CARGA AUTOMÁTICA ELIMINADA
  // Ya no cargamos datos automáticamente al montar el componente
  // El usuario decide cuándo cargar con el botón manual

  return {
    // Estados
    guests,
    loading,
    error,
    tempFilters,        // ✅ Filtros temporales (UI)
    appliedFilters,     // ✅ Filtros aplicados (API)
    
    // Funciones CRUD
    createGuest,
    updateGuest,
    deleteGuest,
    
    // Funciones de control
    updateTempFilters,  // ✅ Para actualizar filtros en UI
    applyFilters,       // ✅ Para ejecutar la búsqueda
    clearFilters,       // ✅ Para limpiar filtros
    clearError,
    refresh,
    
    // Funciones derivadas
    filteredGuests: guests, // Ya vienen filtrados del backend
    totalGuests: guests.length,
    confirmedGuests: guests.filter(g => g.attendance?.confirmed).length,
    pendingGuests: guests.filter(g => g.status === 'pending').length,
    
    // ✅ Helper para saber si hay filtros pendientes de aplicar
    hasUnappliedChanges: JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters),
  };
};
