import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEmergency } from '@/hooks/use-emergency';
import { VoiceRecorder } from '@/components/voice-recorder';
import { AlertTriangle, CheckCircle, MapPin, Mic, Send, ShieldAlert, Radio } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export function EmergencyButton() {
  const { status, activateEmergency, isActivating, resetStatus } = useEmergency();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isSendingWithVoice, setIsSendingWithVoice] = useState(false);
  const { language } = useLanguage();
  const t = useTranslations(language);

  const handleActivateEmergency = () => {
    if (window.confirm(t.emergencyConfirmMessage || "¿Confirmas activar la alerta de emergencia legal SOS?")) {
      activateEmergency();
    }
  };

  const handleVoiceEmergency = () => {
    setShowVoiceModal(true);
  };

  const sendEmergencyWithVoice = async () => {
    if (!voiceBlob) return;

    setIsSendingWithVoice(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

      const formData = new FormData();
      formData.append('voiceNote', voiceBlob, 'emergency_voice.webm');
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('address', address);

      const response = await fetch('/api/emergency/with-voice', {
        method: 'POST',
        headers: {
          'X-User-Id': '1',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Emergency API error: ${response.status}`);
      }

      const result = await response.json();
      resetStatus();
      setShowVoiceModal(false);
      setVoiceBlob(null);
      
    } catch (error) {
      console.error('Emergency with voice error:', error);
      alert(t.emergencyVoiceError || "Error al enviar alerta con audio.");
    } finally {
      setIsSendingWithVoice(false);
    }
  };

  return (
    <Card className="border border-red-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden text-slate-100">
      <CardHeader className="border-b border-red-500/20 bg-red-950/20 pb-4">
        <CardTitle className="text-xl font-bold flex items-center space-x-2.5 text-red-400">
          <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <span>{t.emergencyActivate || "Alerta de Emergencia Jurídica SOS"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <p className="text-sm text-slate-300 leading-relaxed">
          {t.emergencyDescription || "Al activar la emergencia SOS, transmitiremos tu ubicación GPS en tiempo real y una alerta instantánea vía WhatsApp a tus contactos de emergencia y abogados de guardia."}
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleActivateEmergency}
            disabled={isActivating || isSendingWithVoice}
            className={`w-full py-6 px-8 text-lg font-bold rounded-xl transition-all duration-300 shadow-xl ${
              isActivating || isSendingWithVoice
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/30 border border-red-400/40 ring-4 ring-red-500/20 animate-pulse'
            }`}
          >
            <AlertTriangle className="w-6 h-6 mr-3 text-white" />
            {isActivating ? (t.sendingAlerts || "Transmitiendo Alerta SOS...") : (t.emergencyActivate || "ACTIVAR ALERTA SOS INMEDIATA")}
          </Button>

          <Button
            onClick={handleVoiceEmergency}
            disabled={isActivating || isSendingWithVoice}
            variant="outline"
            className={`w-full py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-200 border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 ${
              isActivating || isSendingWithVoice
                ? 'border-slate-800 text-slate-500 cursor-not-allowed'
                : ''
            }`}
          >
            <Mic className="w-4 h-4 mr-2 text-red-400" />
            {t.emergencyActivateWithVoice || "Dictar Audio de Emergencia (MediaSuite)"}
          </Button>
        </div>

        {status && (
          <Alert className={`rounded-xl border ${
            status.status === 'sent' ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300' : 
            status.status === 'failed' ? 'border-red-500/30 bg-red-950/30 text-red-300' : 
            'border-amber-500/30 bg-amber-950/30 text-amber-300'
          }`}>
            <AlertDescription>
              {status.status === 'sending' && (
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-amber-400 animate-spin" />
                  <span className="text-xs font-medium text-amber-300">
                    {t.sendingAlerts || "Enviando alertas vía WhatsApp y SMS..."}
                  </span>
                </div>
              )}
              
              {status.status === 'sent' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">
                      {t.alertsSentSuccess || "¡Alertas transmitidas con éxito!"}
                    </span>
                  </div>
                  
                  {status.location && (
                    <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{t.locationObtained || "Ubicación transmitida"}: {status.location.address || t.coordinatesSent}</span>
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    {status.contactsNotified.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2 text-xs text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t.alertSentTo || "Notificado"} {contact.name} ({contact.phone})</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={resetStatus}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    {t.close || "Cerrar"}
                  </Button>
                </div>
              )}
              
              {status.status === 'failed' && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-medium text-red-300">
                    {t.emergencyError || "Fallo en el envío de la alerta. Reintenta."}
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
          <DialogContent className="max-w-lg border border-slate-800 bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-red-400 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{t.emergencyActivateWithVoice || "Grabar Nota de Voz de Emergencia"}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Describe brevemente tu situación de riesgo. La nota de voz será procesada por MediaSuite STT y enviada junto a tu ubicación a tus contactos.
              </p>
              
              <VoiceRecorder
                title={t.emergencyVoiceNote || "Grabadora SOS (MediaSuite API)"}
                maxDuration={60}
                onRecordingComplete={setVoiceBlob}
              />
              
              {voiceBlob && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <Button
                    onClick={() => setShowVoiceModal(false)}
                    variant="outline"
                    className="border-slate-700 bg-slate-800 text-slate-300"
                  >
                    {t.cancel || "Cancelar"}
                  </Button>
                  <Button
                    onClick={sendEmergencyWithVoice}
                    disabled={isSendingWithVoice}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/20"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSendingWithVoice ? (t.sending || "Transmitiendo...") : (t.sendAlert || "Transmitir Alerta SOS")}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
