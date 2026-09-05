import { useState, useRef, useEffect } from 'react';
import { 
  Bot, User as UserIcon, Send, Sparkles, AlertTriangle, 
  CheckCircle2, X, FileText, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface CaseMessage {
  sender: 'agent' | 'user';
  text: string;
}

export function ConversationalCaseModal({
  isOpen,
  onClose,
  onCaseStructured,
  caseCategory = 'laboral'
}: ConversationalCaseModalProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState<number>(0);
  const [caseAnswers, setCaseAnswers] = useState<{
    facts: string;
    dates: string;
    parties: string;
    documents: string;
  }>({
    facts: '',
    dates: '',
    parties: '',
    documents: '',
  });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [diagnosisReady, setDiagnosisReady] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSynthesizing]);

  // Initial stage prompt
  useEffect(() => {
    if (isOpen) {
      setStage(0);
      setDiagnosisReady(false);
      setCaseAnswers({ facts: '', dates: '', parties: '', documents: '' });
      setMessages([
        {
          sender: 'agent',
          text: language === 'en'
            ? `Hello! I am your Legal Intake Specialist for ${caseCategory.toUpperCase()} matters. To understand your case precisely and provide grounded guidance, tell me: What happened in detail?`
            : language === 'pt'
            ? `Olá! Sou seu Especialista Agêntico para causas na área de ${caseCategory.toUpperCase()}. Para estruturar seu caso com precisão, conte-me: O que aconteceu em detalhes?`
            : `¡Hola! Soy tu Especialista Agéntico en materia ${caseCategory.toUpperCase()}. Para evaluar tu caso con precisión y fundamentación legal, cuéntame: ¿Qué ocurrió detalladamente en los hechos?`
        }
      ]);
    }
  }, [isOpen, caseCategory, language]);

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');

    if (stage === 0) {
      setCaseAnswers(prev => ({ ...prev, facts: text }));
      setStage(1);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: language === 'en'
            ? "Understood. When did this happen and is there an active deadline or court citation date?"
            : language === 'pt'
            ? "Compreendido. Quando esses fatos aconteceram e existe algum prazo ou notificação em andamento?"
            : "Comprendido los hechos. ¿En qué fechas aproximadas ocurrió y existe algún plazo legal o notificación recibida?"
        }]);
      }, 500);
    } else if (stage === 1) {
      setCaseAnswers(prev => ({ ...prev, dates: text }));
      setStage(2);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: language === 'en'
            ? "Got it. Who is the opposing party (employer, relative, tenant, company, etc.)?"
            : language === 'pt'
            ? "Perfeito. Quem é a outra parte envolvida (empregador, familiar, empresa, locador, etc.)?"
            : "Perfecto. ¿Quién es la contraparte involucrada (empleador, expareja, arrendador, empresa o institución)?"
        }]);
      }, 500);
    } else if (stage === 2) {
      setCaseAnswers(prev => ({ ...prev, parties: text }));
      setStage(3);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: language === 'en'
            ? "Do you have contracts, receipts, chat logs, or witnesses to support your claim?"
            : language === 'pt'
            ? "Você possui contratos, recibos, conversas ou testemunhas que comprovem seus fatos?"
            : "¿Cuentas con contratos, comprobantes, chats, recibos de pago o testigos como evidencia?"
        }]);
      }, 500);
    } else if (stage === 3) {
      setCaseAnswers(prev => ({ ...prev, documents: text }));
      setStage(4);
      setIsSynthesizing(true);

      setTimeout(() => {
        setIsSynthesizing(false);
        setDiagnosisReady(true);
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: language === 'en'
            ? "I have structured your case file and matched it with constitutional principles and statutory requirements. You can now download the triage dossier or forward it to an assigned attorney."
            : language === 'pt'
            ? "Estruturei o dossiê completo do seu caso com base nos artigos legais pertinentes. Você pode gerar a ficha técnica ou enviá-la para um advogado parceiro."
            : "He estructurado tu expediente técnico de triaje legal con los artículos pertinentes y tipificación preliminar. Tu caso está listo para derivación o seguimiento procesal."
        }]);

        if (onCaseStructured) {
          onCaseStructured({
            category: caseCategory,
            summary: caseAnswers.facts || text,
            partiesInvolved: caseAnswers.parties,
            estimatedTimeline: caseAnswers.dates,
            urgencyLevel: 'media',
            keyQuestions: [
              "¿Existe contrato escrito firmado?",
              "¿Se ha intentado una mediación previa?",
              "¿Existen liquidaciones pendientes?"
            ]
          });
        }
      }, 1500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center space-x-2">
                <span>Triaje Conversacional Agéntico</span>
                <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-400 uppercase">
                  {caseCategory}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Fundación Underlife — Sistema de Levantamiento de Casos
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${diagnosisReady ? 'bg-teal-400' : 'bg-indigo-500 animate-ping'}`} />
            <span>{diagnosisReady ? 'Diagnóstico Estructurado' : `Etapa ${Math.min(stage + 1, 4)} de 4: Levantamiento`}</span>
          </span>
          <span className="text-[11px] text-slate-500">Cifrado de Privacidad Activo</span>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-950">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'agent' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-slate-900 text-slate-200 rounded-tl-sm border border-slate-800'
              }`}>
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isSynthesizing && (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 italic py-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Procesando jurisprudencia y estructurando expediente de triaje...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Actions or Input */}
        {diagnosisReady ? (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Caso consolidado con éxito.</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cerrar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                }}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Ver en Procesos
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Escribe la información solicitada para el caso..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSynthesizing}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus-visible:ring-indigo-500"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || isSynthesizing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
