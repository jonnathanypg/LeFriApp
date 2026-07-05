import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

interface EmergencyButtonProps {
  onEmergencyActivated?: () => void;
}

export function EmergencyButton({ onEmergencyActivated }: EmergencyButtonProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [notificationResults, setNotificationResults] = useState<any[]>([]);

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      const res = await api.sendEmergencyAlert({
        latitude,
        longitude,
        address: `${latitude}, ${longitude}`,
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      setNotificationResults(data.contactsNotified || []);
      setIsActivated(true);
      onEmergencyActivated?.();
    },
    onError: (error) => {
      console.error("Emergency alert failed:", error);
      alert("Error al enviar alerta de emergencia. Por favor intenta nuevamente.");
    },
  });

  const handleEmergencyClick = () => {
    if (window.confirm("¿Estás seguro de que deseas activar la alerta de emergencia? Se notificará a todos tus contactos de emergencia.")) {
      emergencyMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-900">
          Activar Emergencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600 mb-6">
          En caso de emergencia, presiona el botón para enviar alertas automáticas a tus 
          contactos de emergencia con tu ubicación actual.
        </p>

        <Button
          onClick={handleEmergencyClick}
          disabled={emergencyMutation.isPending}
          className={`w-full py-6 text-xl font-bold transition-all duration-200 ${
            emergencyMutation.isPending
              ? "bg-neutral-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 animate-pulse"
          }`}
          style={{
            boxShadow: emergencyMutation.isPending
              ? "none"
              : "0 0 0 0 rgba(239, 68, 68, 0.7), 0 0 20px rgba(239, 68, 68, 0.3)",
            animation: emergencyMutation.isPending 
              ? "none" 
              : "pulse 2s infinite, emergency-pulse 2s infinite",
          }}
        >
          {emergencyMutation.isPending ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              ENVIANDO ALERTAS...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-3 h-6 w-6" />
              ACTIVAR EMERGENCIA
            </>
          )}
        </Button>

        {(emergencyMutation.isPending || isActivated) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            {emergencyMutation.isPending && (
              <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  Enviando alertas de emergencia...
                </span>
              </div>
            )}

            {isActivated && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Alertas enviadas exitosamente
                  </span>
                </div>
                
                {notificationResults.map((result, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      Alerta enviada a {result.name} vía WhatsApp
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
