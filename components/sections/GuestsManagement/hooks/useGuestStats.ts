import { useState, useCallback } from 'react';
import { GuestStats, StatsResponse } from '../types/guests.types';

export const useGuestStats = () => {
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(false); // ✅ CAMBIADO: Inicia en false
  const [error, setError] = useState<string | null>(null);

  // Función para obtener estadísticas
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/guests/stats');
      const result: StatsResponse = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión al cargar estadísticas');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar estadísticas
  const refresh = () => {
    fetchStats();
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // ❌ CARGA AUTOMÁTICA ELIMINADA
  // Ya no cargamos estadísticas automáticamente al montar el componente
  
  // ❌ AUTO-REFRESH ELIMINADO
  // Ya no hay actualización automática cada 30 segundos

  return {
    // Estados
    stats,
    loading,
    error,
    
    // Funciones
    refresh,
    clearError,
    
    // Datos derivados para fácil acceso
    totalGuests: stats?.overview.totalGuests || 0,
    totalConfirmed: stats?.overview.totalConfirmed || 0,
    totalPending: stats?.overview.totalPending || 0,
    confirmationRate: stats?.overview.confirmationRate || 0,
    totalGuestCount: stats?.overview.totalGuestCount || 0,
    
    // Indicadores de estado
    hasData: stats !== null,
    isStale: stats ? (Date.now() - new Date(stats.generatedAt).getTime()) > 60000 : false, // Datos > 1 minuto
  };
};
