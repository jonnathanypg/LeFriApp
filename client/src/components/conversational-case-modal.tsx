'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, FileText, Calendar, Users, ShieldAlert, Sparkles, 
  ArrowRight, ArrowLeft, CheckCircle2, CornerDownLeft, ShieldCheck, X 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversationalCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseStructured?: (caseSummary: CaseStructuredData) => void;
  caseCategory?: string;
}

export interface CaseStructuredData {
  category: string;
  summary: string;
  partiesInvolved: string;
  estimatedTimeline: string;
  urgencyLevel: 'alta' | 'media' | 'baja';
  keyQuestions: string[];
}

export function ConversationalCaseModal({
  isOpen,
  onClose,
  onCaseStructured,
  caseCategory = 'general'
}: ConversationalCaseModalProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: caseCategory || 'laboral',
    facts: '',
    incidentDate: '',
    opposingParty: '',
    evidence: '',
    urgency: 'media'
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsSynthesizing(false);
      setIsCompleted(false);
      setErrorMessage(null);
      setFormData({
        category: caseCategory || 'laboral',
        facts: '',
        incidentDate: '',
        opposingParty: '',
        evidence: '',
        urgency: 'media'
      });
    }
  }, [isOpen, caseCategory]);

  const questions = useMemo(() => [
    {
      id: 'category',
      badge: 'Paso 1 • Rama Jurídica',
      title: '¿En qué área legal se enmarca tu consulta?',
      subtitle: 'Selecciona la materia para anclar la legislación y artículos pertinentes.',
      type: 'select',
      field: 'category',
      icon: Scale,
      options: [
        { label: 'Laboral', value: 'laboral', desc: 'Despidos, liquidaciones, horas extras, acoso' },
        { label: 'Familia', value: 'familia', desc: 'Pensión alimenticia, tenencia, visitas, divorcio' },
        { label: 'Civil & Inquilinato', value: 'civil', desc: 'Contratos, deudas, arrendamientos, daños' },
        { label: 'Penal Urgente', value: 'penal', desc: 'Detenciones, citaciones de fiscalía, denuncias' }
      ]
    },
    {
      id: 'facts',
      badge: 'Paso 2 • Hechos del Caso',
      title: 'Relata lo sucedido detalladamente',
      subtitle: 'Cuéntanos los acontecimientos clave con tus propias palabras. La IA analizará los puntos jurídicos críticos.',
      type: 'textarea',
      field: 'facts',
      placeholder: 'Ej. Trabajé 3 años en la empresa X y ayer me notificaron despido verbal sin pagar mi liquidación ni sueldos del último mes...',
      icon: FileText
    },
    {
      id: 'incidentDate',
      badge: 'Paso 3 • Cronología & Plazos',
      title: '¿En qué fecha ocurrieron los hechos y hay algún plazo activo?',
      subtitle: 'El tiempo es vital en derecho (caducidad, prescripción o citaciones judiciales).',
      type: 'text',
      field: 'incidentDate',
      placeholder: 'Ej. Ocurrió el 15 de agosto. Tengo citación para el próximo lunes...',
      icon: Calendar
    },
    {
      id: 'opposingParty',
      badge: 'Paso 4 • Contraparte',
      title: '¿Quién es la otra parte involucrada?',
      subtitle: 'Identifica al empleador, empresa, familiar, arrendador o entidad contra la cual se orienta el caso.',
      type: 'text',
      field: 'opposingParty',
      placeholder: 'Ej. Empresa Comercial S.A. / Arrendador Juan Pérez',
      icon: Users
    },
    {
      id: 'evidence',
      badge: 'Paso 5 • Medios Probatorios',
      title: '¿Con qué pruebas o documentos cuentas?',
      subtitle: 'Contratos, transferencias bancarias, mensajes de WhatsApp, correos o testigos.',
      type: 'textarea',
      field: 'evidence',
      placeholder: 'Ej. Tengo copia del contrato firmado, capturas de WhatsApp con el jefe y roles de pago anteriores...',
      icon: ShieldCheck
    }
  ], []);

  const step = questions[currentStep] || questions[0];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  const handleNext = () => {
    setErrorMessage(null);
    const val = formData[step.field as keyof typeof formData] || '';

    if (step.type === 'textarea' || step.type === 'text') {
      if (!val.trim()) {
        setErrorMessage('Por favor ingresa la información solicitada para estructurar tu expediente.');
        return;
      }
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalize();
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setIsCompleted(true);
      if (onCaseStructured) {
        onCaseStructured({
          category: formData.category,
          summary: formData.facts,
          partiesInvolved: formData.opposingParty,
          estimatedTimeline: formData.incidentDate,
          urgencyLevel: 'alta',
          keyQuestions: [
            "¿Existe contrato escrito con validez legal?",
            "¿Se notificó oportunamente por medios formales?",
            "¿Se agotó la vía de mediación prejudicial?"
          ]
        });
      }
    }, 1400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl rounded-3xl">
        {/* Top Header Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white tracking-tight">
                Levantamiento de Expediente de Caso
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Experiencia Typeform Agéntica • Fundación Underlife
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="bg-slate-950 px-6 pt-4 flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-slate-400">
            {isCompleted ? 'Expediente Estructurado' : `Paso ${currentStep + 1} de ${questions.length}`}
          </span>
          <div className="flex items-center space-x-2 w-36">
            <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-teal-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: isCompleted ? '100%' : `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-7 text-right">
              {isCompleted ? '100%' : `${progressPercent}%`}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between">
          {isSynthesizing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Estructurando Diagnóstico Legal...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Indexando hechos con las leyes de la República y generando ficha técnica de derivación.
                </p>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="space-y-6 py-4">
              <div className="inline-flex items-center space-x-2 text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/30 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Expediente de Caso Listo</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Caso Tipificado con Éxito</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Hemos generado la ficha técnica inicial con los hechos, plazos y medios probatorios expuestos. Este expediente puede ser canalizado con abogados defensores o usado como minuta de partida.
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Materia:</span>
                  <span className="font-semibold text-white uppercase">{formData.category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Contraparte:</span>
                  <span className="text-slate-200">{formData.opposingParty || 'No especificada'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plazo / Cronología:</span>
                  <span className="text-slate-200">{formData.incidentDate || 'Inmediato'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25"
                >
                  Ver en Mis Procesos
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Badge & Title */}
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                    <step.icon className="w-3.5 h-3.5" />
                    <span>{step.badge}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    {step.title}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    {step.subtitle}
                  </p>
                </div>

                {/* Question Inputs */}
                <div>
                  {step.type === 'select' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {step.options?.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: opt.value }));
                            setTimeout(() => {
                              if (currentStep < questions.length - 1) {
                                setCurrentStep(prev => prev + 1);
                              }
                            }, 180);
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.category === opt.value
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-semibold text-sm text-white mb-1">{opt.label}</div>
                          <div className="text-xs text-slate-400 font-mono">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  ) : step.type === 'textarea' ? (
                    <div className="space-y-2">
                      <Textarea
                        ref={textareaRef}
                        rows={4}
                        value={formData[step.field as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
                        placeholder={step.placeholder}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-2xl p-4 text-sm sm:text-base focus-visible:ring-indigo-500 resize-none min-h-[120px]"
                        autoFocus
                      />
                      <div className="text-[11px] text-slate-500">
                        Comparte los hechos con tranquilidad; están resguardados bajo estricta confidencialidad.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        ref={inputRef}
                        value={formData[step.field as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                        placeholder={step.placeholder}
                        className="h-14 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-2xl px-4 text-base focus-visible:ring-indigo-500"
                        autoFocus
                      />
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 pl-1">
                        <CornerDownLeft className="w-3.5 h-3.5" />
                        <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter ↵</kbd></span>
                      </div>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-400 font-medium">
                    {errorMessage}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Stepper Controls */}
          {!isCompleted && !isSynthesizing && (
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Atrás</span>
                </Button>
              ) : <div />}

              <Button
                size="sm"
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 rounded-xl shadow-md shadow-indigo-600/20"
              >
                <span>{currentStep === questions.length - 1 ? 'Estructurar Expediente' : 'Siguiente'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
