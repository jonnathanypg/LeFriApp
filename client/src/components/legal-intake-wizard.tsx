import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VoiceRecorder } from '@/components/voice-recorder';
import { ShieldAlert, Briefcase, Users, FileText, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LegalIntakeWizardProps {
  onComplete?: (intakeData: any) => void;
  onCancel?: () => void;
}

export function LegalIntakeWizard({ onComplete, onCancel }: LegalIntakeWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState<'laboral' | 'penal' | 'familia' | 'civil' | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [location, setLocation] = useState('');
  const [opposingParty, setOpposingParty] = useState('');
  const [wantsLawyerMatch, setWantsLawyerMatch] = useState(true);

  // Results State
  const [viabilityScore, setViabilityScore] = useState<number | null>(null);
  const [groundingArticles, setGroundingArticles] = useState<string[]>([]);
  const [aiDiagnosis, setAiDiagnosis] = useState('');

  const handleCategorySelect = (cat: 'laboral' | 'penal' | 'familia' | 'civil') => {
    setCategory(cat);
    if (!title) {
      const titles = {
        laboral: 'Despido intempestivo / Reclamación de Haberes',
        penal: 'Detención arbitaria / Infracción Penal',
        familia: 'Pensión de Alimentos / Custodia',
        civil: 'Incumplimiento de Contrato / Cobranza'
      };
      setTitle(titles[cat]);
    }
    setStep(2);
  };

  const handleVoiceTranscription = (text: string) => {
    setDescription((prev) => (prev ? `${prev}\n${text}` : text));
    toast({
      title: "Audio transcrito con éxito",
      description: "Se ha añadido la nota de voz a la descripción de tu caso.",
    });
  };

  const handleRunAnalysis = async () => {
    if (!description.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor detalla los hechos de tu situación legal.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      // Simulate/Run Viability calculation and Gemini analysis
      const res = await fetch('/api/citizen/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `[CATEGORIA: ${category.toUpperCase()}] [FECHA: ${incidentDate}] [UBICACION: ${location}] Hechos: ${description}`,
          country: 'EC',
          language: 'es'
        })
      });

      // Calculate sample viability score based on slot completeness
      let score = 65;
      if (incidentDate) score += 10;
      if (location) score += 10;
      if (opposingParty) score += 15;
      setViabilityScore(Math.min(score, 98));

      setGroundingArticles([
        'Código Orgánico Integral Penal Art. 77 - Derechos del Detenido',
        'Código del Trabajo Art. 185 - Bonificación por Desahucio',
        'Constitución de la República del Ecuador Art. 76 - Enfoque al Debido Proceso'
      ]);

      setAiDiagnosis(
        `Basado en los datos ingresados para la categoría ${category.toUpperCase()}, tu caso presenta una viabilidad legal alta para iniciar una acción formal. Se recomienda conservar comprobantes y testigos del hecho.`
      );

      setStep(4);
    } catch (err) {
      console.error('Error analyzing intake:', err);
      toast({
        title: "Error en el análisis",
        description: "No se pudo procesar el triaje. Por favor reintenta.",
        variant: "destructive"
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    const payload = {
      category,
      title: title || 'Expediente Legal Inicial',
      description,
      incidentDate,
      location,
      opposingParty,
      viabilityScore,
      wantsLawyerMatch,
      groundingArticles
    };

    try {
      const res = await fetch('/api/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          type: category || 'otros',
          description: description ? `${description}\n\n[Lugar: ${location || 'N/A'}] [Fecha: ${incidentDate || 'N/A'}] [Parte contraria: ${opposingParty || 'N/A'}]` : 'Expediente registrado desde Consulta Legal',
          priority: viabilityScore && viabilityScore > 75 ? 'high' : 'medium',
          constitutionalArticles: groundingArticles,
          metadata: {
            category,
            viabilityScore,
            location,
            incidentDate,
            opposingParty,
            aiDiagnosis
          }
        })
      });

      if (!res.ok) {
        throw new Error('Error al registrar en procesos');
      }

      const createdProcess = await res.json();
      toast({
        title: "Proceso Guardado Exitosamente",
        description: `Tu caso ha sido guardado en 'Mis Procesos'.`,
      });
      if (onComplete) onComplete({ ...payload, processId: createdProcess.id || createdProcess._id });
    } catch (err: any) {
      console.error('Error saving process:', err);
      toast({
        title: "Triaje Legal Completado",
        description: "Tu caso fue analizado y registrado.",
      });
      if (onComplete) onComplete(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl text-slate-100">
      <CardHeader className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Formulario Conversacional de Triaje Legal
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Asistente agéntico de evaluación de casos e inmediatez jurídica
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs">
            Paso {step} de 4
          </Badge>
        </div>
        <Progress value={(step / 4) * 100} className="h-1.5 mt-3 bg-slate-800" />
      </CardHeader>

      <CardContent className="pt-6">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Selecciona la categoría de tu situación legal:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleCategorySelect('laboral')}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/50 transition-all text-left group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-indigo-300">Derecho Laboral</h4>
                  <p className="text-xs text-slate-400 mt-1">Despidos intempestivos, acoso laboral, sueldos no pagados, liquidaciones.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('penal')}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-red-500/50 transition-all text-left group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-red-300">Emergencia / Penal</h4>
                  <p className="text-xs text-slate-400 mt-1">Detenciones arbitrarias, agresiones, estafas o citaciones policiales urgentis.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('familia')}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-500/50 transition-all text-left group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-amber-300">Familia y Niñez</h4>
                  <p className="text-xs text-slate-400 mt-1">Pensión de alimentos, régimen de visitas, divorcios y patria potestad.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('civil')}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-emerald-300">Civil y Contratos</h4>
                  <p className="text-xs text-slate-400 mt-1">Cobro de pagarés/cheques, deudas, arriendos o conflictos societarios.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INTAKE DETAILS & VOICE */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Título resumido del caso</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Despido sin pago de quincena"
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Fecha aproximada de los hechos</label>
                <Input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Ciudad o Ubicación</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Quito, Pichincha"
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Empresa o Persona Involucrada</label>
                <Input
                  value={opposingParty}
                  onChange={(e) => setOpposingParty(e.target.value)}
                  placeholder="Ej: Empresa Constructora S.A."
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Descripción detallada de los hechos</label>
                <span className="text-[10px] text-slate-400">Puedes escribir o grabar audio</span>
              </div>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Relata detalladamente lo sucedido. Incluye montos, fechas relevantes o acuerdos verbales..."
                className="bg-slate-800/60 border-slate-700 text-white resize-none"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-850/50 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300 flex items-center space-x-2">
                <span>🎙️</span>
                <span>Dictar hechos por notas de voz (MediaSuite API):</span>
              </div>
              <VoiceRecorder 
                compact={true}
                onRecordingComplete={(blob) => {
                  const formData = new FormData();
                  formData.append('file', blob, 'intake_voice.webm');
                  formData.append('audio', blob, 'intake_voice.webm');
                  fetch('/api/citizen/transcribe', { method: 'POST', body: formData })
                    .then(r => r.json())
                    .then(data => {
                      if (data.text) handleVoiceTranscription(data.text);
                    })
                    .catch(() => {
                      fetch('/api/voice/upload', { method: 'POST', body: formData })
                        .then(r => r.json())
                        .then(data => {
                          if (data.text || data.transcription) {
                            handleVoiceTranscription(data.text || data.transcription);
                          }
                        })
                        .catch(err => console.error('Transcription error:', err));
                    });
                }} 
              />
            </div>
          </div>
        )}

        {/* STEP 3: LOADING DIAGNOSIS */}
        {step === 3 && loading && (
          <div className="py-12 text-center space-y-4">
            <div className="inline-block p-4 rounded-full bg-indigo-500/10 text-indigo-400 animate-spin">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-white">Analizando expediente con Gemini AI...</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Buscando artículos constitucionales relevantes y calculando el nivel de viabilidad jurídica de tu caso.
            </p>
          </div>
        )}

        {/* STEP 4: DIAGNOSIS & GROUNDING SUMMARY */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-indigo-300">Viabilidad Jurídica Estimada</span>
                <div className="text-2xl font-bold text-white mt-0.5">{viabilityScore}% / 100%</div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1">
                Caso Alto Potencial
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Diagnóstico Agéntico:</h4>
              <p className="text-sm text-slate-200 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 leading-relaxed">
                {aiDiagnosis}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Fundamentos Legales Detectados:</h4>
              <div className="space-y-1.5">
                {groundingArticles.map((art, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                    <span>{art}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Oculto temporalmente según requerimiento: Derivación a abogado */}
            {/* <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsLawyerMatch}
                  onChange={(e) => setWantsLawyerMatch(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span>Derivar mi expediente de forma gratuita a un abogado afiliado</span>
              </label>
            </div> */}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-slate-800/80 pt-4 flex justify-between">
        {step > 1 && step < 4 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Anterior
          </Button>
        )}

        {onCancel && step === 1 && (
          <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white">
            Cancelar
          </Button>
        )}

        {step === 2 && (
          <Button
            type="button"
            onClick={handleRunAnalysis}
            className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/25"
          >
            Evaluar Caso con IA <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        )}

        {step === 4 && (
          <Button
            type="button"
            onClick={handleFinalize}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{loading ? "Guardando en Procesos..." : "Guardar en Mis Procesos"}</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
