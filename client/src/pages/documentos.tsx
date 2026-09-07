import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, Sparkles, Download, ExternalLink, Copy, Check, 
  Briefcase, AlertCircle, ShieldAlert, Users, MessageSquare, Mic, ArrowRight, FileDown,
  FolderGit2, Trash2, Clock, Plus
} from 'lucide-react';
import { Link } from 'wouter';
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
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Helper to strip markdown code block wrapping if LLM formatted it as ```markdown ... ```
  const getCleanDocumentContent = (rawContent?: string) => {
    if (!rawContent) return '';
    return rawContent
      .replace(/^```[a-zA-Z]*\n/gm, '')
      .replace(/^```$/gm, '')
      .trim();
  };

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
      queryClient.invalidateQueries({ queryKey: ['/api/citizen/documents/drafts'] });
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
    const cleanText = getCleanDocumentContent(generatedDoc.documentContent);
    navigator.clipboard.writeText(cleanText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: t.docCopied || "Copiado", description: t.explanationCopied || "Borrador legal copiado al portapapeles listo para pegar." });
  };

  const handleExportGoogleDocs = async () => {
    if (!generatedDoc?.documentContent) return;
    const cleanText = getCleanDocumentContent(generatedDoc.documentContent);
    try {
      await navigator.clipboard.writeText(cleanText);
      toast({
        title: "¡Texto legal copiado!",
        description: "Se abrió Google Docs y el borrador está en tu portapapeles. Solo presiona Ctrl+V (o Pegar).",
      });
    } catch {
      // ignore clipboard failure
    }
    const googleDocsUrl = `https://docs.google.com/document/create?title=${encodeURIComponent(generatedDoc.title || 'Documento Legal')}`;
    window.open(googleDocsUrl, '_blank');
  };

  const handleExportDocx = async () => {
    if (!generatedDoc?.documentContent) return;
    setIsExportingDocx(true);
    try {
      const cleanContent = getCleanDocumentContent(generatedDoc.documentContent);
      const response = await fetch('/api/citizen/documents/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedDoc.title || 'Documento Legal',
          content: cleanContent
        })
      });

      if (!response.ok) throw new Error('Fallo al exportar documento Word');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDoc.title || 'Documento_Legal'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: t.success || "Descargado", description: "Documento Word (.docx) generado exitosamente." });
    } catch (err: any) {
      toast({ title: t.error || "Error", description: err.message || "No se pudo generar el archivo Word.", variant: "destructive" });
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    if (!generatedDoc?.documentContent) return;
    setIsExportingPdf(true);
    try {
      const cleanContent = getCleanDocumentContent(generatedDoc.documentContent);
      const response = await fetch('/api/citizen/documents/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedDoc.title || 'Documento Legal',
          content: cleanContent
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

  const queryClient = useQueryClient();

  const { data: savedDrafts = [], isLoading: isLoadingDrafts } = useQuery<any[]>({
    queryKey: ['/api/citizen/documents/drafts'],
    queryFn: async () => {
      const res = await fetch('/api/citizen/documents/drafts');
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!user
  });

  const convertToProcessMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const res = await fetch(`/api/citizen/documents/drafts/${draftId}/convert-to-process`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Error al vincular el borrador a un proceso');
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/citizen/documents/drafts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/processes'] });
      toast({
        title: "¡Expediente de Proceso creado!",
        description: `El documento ahora forma parte de tu caso en Procesos Legales.`,
      });
      if (generatedDoc?.id) {
        setGeneratedDoc({ ...generatedDoc, processId: data.process?._id || data.process?.id });
      }
    },
    onError: (err: any) => {
      toast({
        title: t.error || "Error",
        description: err.message || "No se pudo convertir a proceso.",
        variant: "destructive"
      });
    }
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const res = await fetch(`/api/citizen/documents/drafts/${draftId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar borrador');
      return await res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/citizen/documents/drafts'] });
      if (generatedDoc?.id === deletedId) {
        setGeneratedDoc(null);
      }
      toast({ title: "Borrador eliminado", description: "El borrador legal se eliminó de tu historial." });
    }
  });

  const handleSelectSavedDraft = (draft: any) => {
    setSelectedType(draft.type || 'laboral_despido');
    setTitle(draft.title || '');
    setFacts(draft.facts || '');
    setClaimantName(draft.claimantName || '');
    setClaimantId(draft.claimantId || '');
    setOpposingParty(draft.opposingParty || '');
    setCountry(draft.country || 'EC');
    setCustomDetails(draft.customDetails || '');
    setGeneratedDoc(draft);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
      title: "Borrador cargado",
      description: `Cargado: "${draft.title}". Puedes continuar editándolo o exportándolo.`,
    });
  };

  const handleStartNewDraft = () => {
    setGeneratedDoc(null);
    setTitle('');
    setFacts('');
    setCustomDetails('');
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-400">
              {t.documentsSubtitle || "Redacta en segundos cartas, oficios formales, peticiones y minutas legales con fundamentos normativos listos para exportar a PDF y Google Docs."}
            </p>
            {generatedDoc && (
              <Button
                size="sm"
                onClick={handleStartNewDraft}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl flex items-center space-x-1.5 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Borrador</span>
              </Button>
            )}
          </div>
        </div>

        {/* Saved Drafts History Banner if authenticated */}
        {savedDrafts && savedDrafts.length > 0 && (
          <div className="mb-8 p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Mis Borradores Guardados ({savedDrafts.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Haz clic en cualquier borrador para retomarlo</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedDrafts.map((d: any) => {
                const isCurrent = generatedDoc?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectSavedDraft(d)}
                    className={`p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isCurrent
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{d.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-indigo-500/30 text-indigo-300">
                            {d.type?.replace('_', ' ')}
                          </Badge>
                          {d.processId && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/20 text-emerald-300 border-0">
                              En Proceso
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDraftMutation.mutate(d.id);
                        }}
                        className="h-6 w-6 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                      {d.facts || "Sin narrativa previa..."}
                    </p>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      <span className="text-indigo-400 hover:underline">Retomar borrador →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                      {generatedDoc.processId ? (
                        <Link href={`/processes/${generatedDoc.processId}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 rounded-lg px-2.5 py-1"
                          >
                            <FolderGit2 className="w-3.5 h-3.5 mr-1" />
                            <span>Ver en Procesos</span>
                          </Button>
                        </Link>
                      ) : generatedDoc.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => convertToProcessMutation.mutate(generatedDoc.id)}
                          disabled={convertToProcessMutation.isPending}
                          className="text-xs border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 rounded-lg px-2.5 py-1"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 mr-1" />
                          <span>{convertToProcessMutation.isPending ? 'Vinculando...' : 'Iniciar Proceso'}</span>
                        </Button>
                      )}

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
                      <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-200 max-h-[520px] overflow-y-auto leading-relaxed shadow-inner prose prose-invert prose-slate max-w-none prose-headings:text-slate-100 prose-headings:font-bold prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-hr:border-slate-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {getCleanDocumentContent(generatedDoc.documentContent)}
                        </ReactMarkdown>
                      </div>

                      {/* Export Hub Buttons */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">{t.exportDocument || "Exportar documento:"}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleExportDocx}
                            disabled={isExportingDocx}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg flex items-center space-x-1.5"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>{isExportingDocx ? (t.exportingDocx || 'Generando Word...') : (t.downloadDocx || 'Descargar Word (.docx)')}</span>
                          </Button>

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
