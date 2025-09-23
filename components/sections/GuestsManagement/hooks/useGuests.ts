import { useState, useCallback } from 'react';
import { Guest, GuestsResponse, GuestResponse, GuestFilters, GuestFormData } from '../types/guests.types';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false); // ✅ CAMBIADO: Inicia en false
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GuestFilters>({
    search: '',
    status: 'all',
    relation: 'all'
  });

  // Función para obtener invitados con filtros
  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query parameters
      const params = new URLSearchParams();
      if (filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.relation !== 'all') {
        params.append('relation', filters.relation);
      }
      params.append('limit', '100'); // Por ahora sin paginación

      const response = await fetch(`/api/guests?${params.toString()}`);
      const result: GuestsResponse = await response.json();

      if (result.success) {
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
  }, [filters]);

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

  // Función para actualizar filtros
  const updateFilters = (newFilters: Partial<GuestFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Función para refrescar datos
  const refresh = () => {
    fetchGuests();
  };

  // ❌ CARGA AUTOMÁTICA ELIMINADA
  // Ya no cargamos datos automáticamente al montar el componente
  // El usuario decide cuándo cargar con el botón manual

  return {
    // Estados
    guests,
    loading,
    error,
    filters,
    
    // Funciones CRUD
    createGuest,
    updateGuest,
    deleteGuest,
    
    // Funciones de control
    updateFilters,
    clearError,
    refresh,
    
    // Funciones derivadas
    filteredGuests: guests, // Ya vienen filtrados del backend
    totalGuests: guests.length,
    confirmedGuests: guests.filter(g => g.attendance?.confirmed).length,
    pendingGuests: guests.filter(g => g.status === 'pending').length,
  };
};
