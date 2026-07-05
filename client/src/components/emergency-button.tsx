import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEmergency } from '@/hooks/use-emergency';
import { VoiceRecorder } from '@/components/voice-recorder';
import { AlertTriangle, CheckCircle, MapPin, Mic, Send } from 'lucide-react';
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
    if (window.confirm(t.emergencyConfirmMessage)) {
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
      setTimeout(() => {
        const emergencyStatus = {
          status: result.status,
          contactsNotified: result.contactsNotified,
          location: result.location
        };
      }, 100);

      setShowVoiceModal(false);
      setVoiceBlob(null);
      
    } catch (error) {
      console.error('Emergency with voice error:', error);
      alert(t.emergencyVoiceError);
    } finally {
      setIsSendingWithVoice(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t.emergencyActivate}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-neutral-600">
          {t.emergencyDescription}
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleActivateEmergency}
            disabled={isActivating || isSendingWithVoice}
            className={`w-full py-6 px-8 text-xl font-bold transition-all duration-200 ${
              isActivating || isSendingWithVoice
                ? 'bg-neutral-400 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600 emergency-pulse'
            }`}
          >
            <AlertTriangle className="w-6 h-6 mr-3" />
            {isActivating ? t.sendingAlerts : t.emergencyActivate}
          </Button>

          <Button
            onClick={handleVoiceEmergency}
            disabled={isActivating || isSendingWithVoice}
            variant="outline"
            className={`w-full py-4 px-6 text-lg font-semibold transition-all duration-200 border-2 ${
              isActivating || isSendingWithVoice
                ? 'border-neutral-300 text-neutral-400 cursor-not-allowed'
                : 'border-red-500 text-red-600 hover:bg-red-50'
            }`}
          >
            <Mic className="w-5 h-5 mr-2" />
            {t.emergencyActivateWithVoice}
          </Button>
        </div>

        {status && (
          <Alert className={`${
            status.status === 'sent' ? 'border-green-200 bg-green-50' : 
            status.status === 'failed' ? 'border-red-200 bg-red-50' : 
            'border-yellow-200 bg-yellow-50'
          }`}>
            <AlertDescription>
              {status.status === 'sending' && (
                <div className="flex items-center space-x-2">
                  <div className="loader"></div>
                  <span className="text-sm font-medium text-yellow-700">
                    {t.sendingAlerts}
                  </span>
                </div>
              )}
              
              {status.status === 'sent' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {t.alertsSentSuccess}
                    </span>
                  </div>
                  
                  {status.location && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <MapPin className="w-4 h-4" />
                      <span>{t.locationObtained}: {status.location.address || t.coordinatesSent}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {status.contactsNotified.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{t.alertSentTo} {contact.name} {t.viaWhatsApp}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={resetStatus}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    {t.close}
                  </Button>
                </div>
              )}
              
              {status.status === 'failed' && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    {t.emergencyError}
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6" />
                <span>{t.emergencyActivateWithVoice}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {t.emergencyVoiceDescription}
              </p>
              
              <VoiceRecorder
                title={t.emergencyVoiceNote}
                maxDuration={60}
                onRecordingComplete={setVoiceBlob}
              />
              
              {voiceBlob && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => setShowVoiceModal(false)}
                    variant="outline"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={sendEmergencyWithVoice}
                    disabled={isSendingWithVoice}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSendingWithVoice ? t.sending : t.sendAlert}
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
