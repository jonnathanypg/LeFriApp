import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onUploadSuccess?: (result: { id: string; url: string; filename: string }) => void;
  title?: string;
  maxDuration?: number; // in seconds
  autoUpload?: boolean;
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  onUploadSuccess,
  title = "Grabador de Voz",
  maxDuration = 60,
  autoUpload = false
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = useTranslations(language);
  const vr = t.voiceRecorder || {};

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete?.(blob);
        
        if (autoUpload) {
          uploadRecording(blob);
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Record in 100ms chunks
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        timerRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 1;
            if (newDuration >= maxDuration) {
              stopRecording();
            }
            return newDuration;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
  };

  const uploadRecording = async (blob?: Blob) => {
    const blobToUpload = blob || audioBlob;
    if (!blobToUpload) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blobToUpload, 'voice_note.webm');
      formData.append('type', 'emergency');

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        headers: {
          'x-user-id': '66a1b2c3d4e5f6789abc1234',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      onUploadSuccess?.(result);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error al subir la grabación. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (duration / maxDuration) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-3">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
            >
              <Mic className="w-5 h-5 mr-2" />
              {t.startRecording}
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                variant="outline"
                className="px-4 py-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? vr.resume : vr.pause}
              </Button>
              
              <Button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
              >
                <Square className="w-4 h-4 mr-2" />
                {vr.stop}
              </Button>
            </>
          )}
        </div>

        {/* Duration and Progress */}
        {(isRecording || audioBlob) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{vr.duration}: {formatDuration(duration)}</span>
              <span>{t.maxDuration}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isRecording ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium">
              {isPaused ? vr.recordingPaused : vr.recording}
            </span>
          </div>
        )}

        {/* Audio Playback */}
        {audioBlob && audioUrl && (
          <div className="space-y-3">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={playAudio}
                variant="outline"
                className="px-4 py-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? vr.pause : vr.play}
              </Button>
              
              <Button
                onClick={deleteRecording}
                variant="outline"
                className="px-4 py-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t.delete}
              </Button>
              
              {!autoUpload && (
                <Button
                  onClick={() => uploadRecording()}
                  disabled={isUploading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                >
                  <Send className="w-4 h-4 mr-1" />
                  {isUploading ? vr.uploading : vr.send}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Upload Status */}
        {isUploading && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="loader"></div>
            <span>{vr.uploading}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>{t.pressMicrophoneToRecord}</p>
          <p>{t.maxDuration}</p>
        </div>
      </CardContent>
    </Card>
  );
}