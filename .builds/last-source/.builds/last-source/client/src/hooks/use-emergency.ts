import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EmergencyStatus } from '@/types';

export function useEmergency() {
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const queryClient = useQueryClient();

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // Synchronize queued alerts when coming back online
  const syncOfflineQueue = async () => {
    if (!navigator.onLine) return;
    try {
      const localQueue = JSON.parse(localStorage.getItem('lefri_emergency_queue') || '[]');
      if (localQueue.length === 0) return;

      console.log(`[Local-First] Syncing ${localQueue.length} offline emergency alerts...`);
      for (const alert of localQueue) {
        await api.sendEmergencyAlert({
          latitude: alert.latitude,
          longitude: alert.longitude,
          address: alert.address + ' (Sincronizado desde cola offline)',
        });
      }
      localStorage.removeItem('lefri_emergency_queue');
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    }
  };

  // Add event listener for online status
  useState(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', syncOfflineQueue);
      // Sync immediately on load if online
      syncOfflineQueue();
      
      return () => {
        window.removeEventListener('online', syncOfflineQueue);
      };
    }
  });

  const activateEmergency = useMutation({
    mutationFn: async () => {
      setStatus({ status: 'sending', contactsNotified: [] });
      
      try {
        const location = await getCurrentLocation().catch(() => ({ latitude: 0, longitude: 0 }));
        
        // Get address from coordinates using reverse geocoding (simplified)
        const address = location.latitude !== 0 
          ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`
          : 'Ubicación desconocida';
        
        if (!navigator.onLine) {
          throw new Error('Dispositivo sin conexión a internet.');
        }

        const response = await api.sendEmergencyAlert({
          latitude: location.latitude,
          longitude: location.longitude,
          address,
        });
        
        const result = await response.json();
        setStatus({ ...result, status: 'sent' });
        
        return result;
      } catch (error) {
        console.warn('Emergency alert failed or offline. Queuing locally.', error);
        
        // Local queue backup (Local-first)
        const queuedAlert = {
          id: `local_${Date.now()}`,
          timestamp: new Date().toISOString(),
          latitude: 0,
          longitude: 0,
          address: 'Guardado localmente (Sin conexión)',
          status: 'queued'
        };

        try {
          const localQueue = JSON.parse(localStorage.getItem('lefri_emergency_queue') || '[]');
          localQueue.push(queuedAlert);
          localStorage.setItem('lefri_emergency_queue', JSON.stringify(localQueue));
        } catch (e) {
          console.error('Failed to save to local queue', e);
        }

        setStatus({ 
          status: 'queued_offline', 
          contactsNotified: [],
          message: 'Sin conexión a Internet. La alerta ha sido encolada localmente y se enviará automáticamente cuando recuperes la conexión. Por favor, llama a emergencias o envía un mensaje SMS directo si es posible.'
        } as any);

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    },
  });

  const resetStatus = () => setStatus(null);

  return {
    status,
    activateEmergency: activateEmergency.mutate,
    isActivating: activateEmergency.isPending,
    resetStatus,
  };
}
