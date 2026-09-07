import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/navbar';
import { VoiceRecorder } from '@/components/voice-recorder';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { 
  FileText, Sparkles, Download, ExternalLink, Copy, Check, 
  Briefcase, AlertCircle, ShieldAlert, Users, MessageSquare, Mic, ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DOCUMENT_TYPES = [
  { id: 'laboral_despido', title: 'Reclamo por Despido Intempestivo / Liquidación', category: 'Laboral', icon: Briefcase },
  { id: 'reclamo_consumidor', title: 'Reclamo Administrativo del Consumidor / Cobros Indebidos', category: 'Consumo', icon: AlertCircle },
  { id: 'derecho_peticion', title: 'Oficio Formal de Derecho de Petición / Acceso a la Información', category: 'Público', icon: FileText },
  { id: 'denuncia_general', title: 'Minuta de Denuncia o Noticia Criminis', category: 'Penal', icon: ShieldAlert },
  { id: 'pension_alimentos', title: 'Solicitud / Oficio de Fijación o Aumento de Alimentos', category: 'Familia', icon: Users },
];

export default function DocumentosPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const DOCUMENT_TYPES = [
    { id: 'laboral_despido', title: t.docTypeLabor || 'Reclamo por Despido Intempestivo / Liquidación', category: t.docTypeLaborCat || 'Laboral', icon: Briefcase },
    { id: 'reclamo_consumidor', title: t.docTypeConsumer || 'Reclamo Administrativo del Consumidor / Cobros Indebidos', category: t.docTypeConsumerCat || 'Consumo', icon: AlertCircle },
    { id: 'derecho_peticion', title: t.docTypePetition || 'Oficio Formal de Derecho de Petición / Acceso a la Información', category: t.docTypePetitionCat || 'Público', icon: FileText },
    { id: 'denuncia_general', title: t.docTypeComplaint || 'Minuta de Denuncia o Noticia Criminis', category: t.docTypeComplaintCat || 'Penal', icon: ShieldAlert },
    { id: 'pension_alimentos', title: t.docTypeChildSupport || 'Solicitud / Oficio de Fijación o Aumento de Alimentos', category: t.docTypeChildSupportCat || 'Familia', icon: Users },
  ];

  const [selectedType, setSelectedType] = useState('laboral_despido');
  const [claimantName, setClaimantName] = useState(user?.name || '');
  const [claimantId, setClaimantId] = useState('');
  const [opposingParty, setOpposingParty] = useState('');
  const [title, setTitle] = useState('');
  const [facts, setFacts] = useState('');
  const [country, setCountry] = useState(user?.country || 'EC');
  const [customDetails, setCustomDetails] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/citizen/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          title: title || DOCUMENT_TYPES.find(d => d.id === selectedType)?.title,
          facts,
          claimantName,
          claimantId,
          opposingParty,
          country,
          language: language || user?.language || 'es',
          customDetails
        })
      });
      if (!res.ok) throw new Error('Error al redactar el documento');
      return await res.json();
    },
    onSuccess: (data) => {
      setGeneratedDoc(data);
      toast({
        title: t.docGeneratedSuccess || "¡Documento redactado con éxito!",
        description: t.docGeneratedSuccessDesc || "Revisa el borrador legal a la derecha para descargarlo o exportarlo."
      });
    },
    onError: (err: any) => {
      toast({
        title: t.error || "Error",
        description: err.message || "No se pudo generar el documento.",
        variant: "destructive"
      });
    }
  });

  const handleVoiceTranscription = (text: string) => {
    setFacts(prev => prev ? `${prev}\n${text}` : text);
    toast({
      title: t.audioTranscribed || "Audio transcrito",
      description: t.audioTranscribedDesc || "Los hechos dictados se han añadido a la descripción."
    });
  };

  const handleCopy = () => {
    if (!generatedDoc?.documentContent) return;
    navigator.clipboard.writeText(generatedDoc.documentContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: t.docCopied || "Copiado", description: t.explanationCopied || "Borrador legal copiado al portapapeles." });
  };

  const handleExportGoogleDocs = () => {
    if (!generatedDoc?.documentContent) return;
    const encoded = encodeURIComponent(generatedDoc.documentContent);
    const googleDocsUrl = `https://docs.google.com/document/create?title=${encodeURIComponent(generatedDoc.title || 'Documento Legal')}&body=${encoded}`;
    window.open(googleDocsUrl, '_blank');
  };

  const handleExportPdf = async () => {
    if (!generatedDoc?.documentContent) return;
    setIsExportingPdf(true);
    try {
      const response = await fetch('/api/citizen/documents/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedDoc.title,
          content: generatedDoc.documentContent
        })
      });

      if (!response.ok) throw new Error('Fallo al exportar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDoc.title || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: t.success || "Descargado", description: "Documento PDF generado exitosamente." });
    } catch (err: any) {
      toast({ title: t.error || "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              {t.documentsTitle || "Estudio de Borradores de Documentos, Oficios y Denuncias"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.documentsSubtitle || "Redacta en segundos cartas, oficios formales, peticiones y minutas legales con fundamentos normativos listos para exportar a PDF y Google Docs."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Drafter Form */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900 border-slate-800 rounded-2xl">
              <CardHeader className="p-5 border-b border-slate-800">
                <CardTitle className="text-base text-white">{t.docStep1Title || "1. Tipo de Documento Legal"}</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {t.docStep1Subtitle || "Selecciona la plantilla legal adecuada para tu caso."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DOCUMENT_TYPES.map((dt) => {
                    const isSelected = selectedType === dt.id;
                    const Icon = dt.icon;
                    return (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setSelectedType(dt.id)}
                        className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-xs font-semibold text-slate-200 leading-tight">{dt.title}</div>
                          <span className="text-[10px] text-slate-500">{dt.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 rounded-2xl">
              <CardHeader className="p-5 border-b border-slate-800">
                <CardTitle className="text-base text-white">{t.docStep2Title || "2. Datos del Compareciente y Hechos"}</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {t.docStep2Subtitle || "Ingresa los detalles para que la IA estructure el escrito con precisión."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      {t.claimantFullName || "Nombre Completo del Solicitante"}
                    </label>
                    <Input
                      value={claimantName}
                      onChange={(e) => setClaimantName(e.target.value)}
                      placeholder={t.claimantFullNamePlaceholder || "Ej: Juan Carlos Pérez"}
                      className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      {t.claimantIdNumber || "C.I. / DNI / Pasaporte"}
                    </label>
                    <Input
                      value={claimantId}
                      onChange={(e) => setClaimantId(e.target.value)}
                      placeholder={t.claimantIdPlaceholder || "Ej: 1720394821"}
                      className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {t.opposingPartyLabel || "Empresa, Institución o Persona Reclamada"}
                  </label>
                  <Input
                    value={opposingParty}
                    onChange={(e) => setOpposingParty(e.target.value)}
                    placeholder={t.opposingPartyPlaceholder || "Ej: Banco Nacional / Empresa Constructora / Ex-Cónyuge"}
                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      {t.factsNarrative || "Hechos y Antecedentes (Narrativa)"}
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {t.factsWriteOrDictate || "Escribe o dicta por voz"}
                    </span>
                  </div>
                  <Textarea
                    rows={4}
                    value={facts}
                    onChange={(e) => setFacts(e.target.value)}
                    placeholder={t.factsPlaceholder || "Detalla lo sucedido: fechas de ingreso o despido, montos adeudados, cláusulas no respetadas..."}
                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl resize-none"
                  />
                </div>

                {/* Voice Dictation Button */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>{t.voiceDictationLabel || "Dictado de hechos por voz (MediaSuite STT):"}</span>
                  </div>
                  <VoiceRecorder 
                    compact={true}
                    onRecordingComplete={(blob) => {
                      const formData = new FormData();
                      formData.append('file', blob, 'facts_voice.webm');
                      formData.append('audio', blob, 'facts_voice.webm');
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
                            .catch(err => console.error('Dictation error:', err));
                        });
                    }} 
                  />
                </div>

                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !facts.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-5 font-semibold text-sm shadow-md shadow-indigo-500/20"
                >
                  {generateMutation.isPending ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.btnGeneratingDoc || "Redactando Documento Legal con IA..."}</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{t.btnGenerateDoc || "Generar Borrador Formal"}</span>
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Document Preview & Export Hub */}
          <div className="lg:col-span-6">
            <div className="sticky top-20">
              <Card className="bg-slate-900 border-slate-800 rounded-2xl min-h-[600px] flex flex-col">
                <CardHeader className="p-5 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white">{t.docPreviewTitle || "Vista Previa del Borrador Legal"}</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {t.docPreviewSubtitle || "Listo para firmar, personalizar o exportar directamente."}
                    </CardDescription>
                  </div>

                  {generatedDoc && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg px-2.5 py-1"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {isCopied ? (t.docCopied || 'Copiado') : (t.docCopy || 'Copiar')}
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  {!generatedDoc ? (
                    <div className="py-24 text-center space-y-3 my-auto">
                      <FileText className="w-12 h-12 text-slate-700 mx-auto" />
                      <p className="text-sm font-medium text-slate-300">{t.noDocGenerated || "Ningún documento generado aún"}</p>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        {t.noDocGeneratedDesc || "Completa el formulario y haz clic en 'Generar Borrador Formal' para ver la redacción jurídica aquí."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 max-h-[480px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                        {generatedDoc.documentContent}
                      </div>

                      {/* Export Hub Buttons */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">{t.exportDocument || "Exportar documento:"}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={handleExportPdf}
                            disabled={isExportingPdf}
                            className="bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg flex items-center space-x-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isExportingPdf ? (t.exportingPdf || 'Exportando...') : (t.downloadPdf || 'Descargar PDF')}</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={handleExportGoogleDocs}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg flex items-center space-x-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{t.openGoogleDocs || "Abrir en Google Docs"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
