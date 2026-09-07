import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onUploadSuccess?: (result: { id: string; url: string; filename: string; text?: string; transcription?: string }) => void;
  onTranscriptionComplete?: (text: string) => void;
  title?: string;
  maxDuration?: number; // in seconds
  autoUpload?: boolean;
  compact?: boolean;
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  onUploadSuccess,
  onTranscriptionComplete,
  title,
  maxDuration = 60,
  autoUpload = false,
  compact = false
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
      formData.append('file', blobToUpload, 'voice_note.webm');
      formData.append('type', 'consultation');

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      onUploadSuccess?.(result);
      if (result.text || result.transcription) {
        onTranscriptionComplete?.(result.text || result.transcription);
      }
    } catch (error: any) {
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

  // Compact / Inline Minimalist Pill Mode
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-[11px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">
            {error}
          </span>
        )}

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {!isRecording && !audioBlob && (
          <Button
            type="button"
            size="sm"
            onClick={startRecording}
            className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 shadow-sm transition-all duration-200 text-xs font-medium flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.startRecording || "Grabar"}</span>
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 bg-rose-950/30 border border-rose-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-medium text-rose-300">
                {formatDuration(duration)}
              </span>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={pauseRecording}
              className="h-6 w-6 p-0 text-slate-300 hover:text-white hover:bg-slate-800/60"
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={stopRecording}
              className="h-6 w-6 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-900/40"
            >
              <Square className="w-3 h-3 fill-rose-500 text-rose-500" />
            </Button>
          </div>
        )}

        {audioBlob && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={playAudio}
              className="h-6 w-6 p-0 text-slate-200 hover:text-white hover:bg-slate-800"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-indigo-400" />}
            </Button>

            <span className="text-[11px] font-mono text-slate-400">
              {formatDuration(duration)}
            </span>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={deleteRecording}
              className="h-6 w-6 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
            >
              <Trash2 className="w-3 h-3" />
            </Button>

            {!autoUpload && (
              <Button
                type="button"
                size="sm"
                onClick={() => uploadRecording()}
                disabled={isUploading}
                className="h-6 px-2 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium ml-1"
              >
                {isUploading ? (
                  <span className="animate-spin text-[10px]">⏳</span>
                ) : (
                  <Send className="w-2.5 h-2.5" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Modern Minimalist Card/Block Mode
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-4 shadow-lg text-slate-100 transition-all duration-200">
      {title && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Mic className="w-4 h-4" />
            </div>
            <span>{title}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {t.maxDuration || "Máx 1:00"}
          </span>
        </div>
      )}

      {error && (
        <Alert className="mb-3 border-red-500/30 bg-red-950/40 text-red-300 py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Control Area */}
      <div className="flex flex-col items-center justify-center py-2 space-y-3">
        {!isRecording && !audioBlob && (
          <Button
            type="button"
            onClick={startRecording}
            className="group relative h-12 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-medium shadow-md shadow-rose-900/20 border border-rose-400/20 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2.5"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
            <Mic className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">{t.startRecording || "Iniciar Grabación"}</span>
          </Button>
        )}

        {isRecording && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-3 py-2 bg-rose-950/20 border border-rose-500/25 rounded-xl">
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {isPaused ? (vr.recordingPaused || "Pausado") : (vr.recording || "Grabando...")}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-slate-200">
                {formatDuration(duration)}
              </span>
            </div>

            {/* Progress line */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                type="button"
                onClick={pauseRecording}
                variant="outline"
                className="h-9 px-4 rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs font-medium flex items-center gap-2"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPaused ? (vr.resume || "Reanudar") : (vr.pause || "Pausar")}</span>
              </Button>
              
              <Button
                type="button"
                onClick={stopRecording}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-2 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{vr.stop || "Finalizar"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        {audioBlob && audioUrl && (
          <div className="w-full space-y-3">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={playAudio}
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-white border border-indigo-500/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-indigo-400" />}
                </Button>
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    {isPlaying ? (vr.pause || "Reproduciendo") : (vr.play || "Reproducir")}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {formatDuration(duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={deleteRecording}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.delete || "Eliminar"}</span>
                </Button>
                
                {!autoUpload && (
                  <Button
                    type="button"
                    onClick={() => uploadRecording()}
                    disabled={isUploading}
                    size="sm"
                    className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isUploading ? (vr.uploading || "Subiendo...") : (vr.send || "Usar")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      {!isRecording && !audioBlob && (
        <p className="text-center text-[11px] text-slate-400 mt-2">
          {t.pressMicrophoneToRecord || "Presiona para grabar tu nota de voz"}
        </p>
      )}
    </div>
  );
}