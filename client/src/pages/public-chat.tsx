import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { 
  Bot, User as UserIcon, Send, Scale, ShieldAlert, Sparkles, 
  MessageSquare, ArrowRight, Share2, CheckCircle2, Phone, Download, Lock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FormattedMarkdown } from '@/components/formatted-markdown';
import { Footer } from '@/components/footer';

export default function PublicChat() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [guestId, setGuestId] = useState<string>('');
  const [activeCitations, setActiveCitations] = useState<Array<{ title: string; source?: string }>>([]);

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; citations?: any[] }>>([
    { 
      role: 'assistant', 
      content: '¡Hola! Soy tu **Asistente Legal de Emergencia y Triaje** en LeFriApp. Brindo orientación jurídica inicial gratuita y fundamentada en ley para ciudadanos.\n\n¿Qué duda o situación legal tienes hoy? Puedes consultar sobre temas laborales, familiares, penales o contractuales.' 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or get guestId from localStorage
  useEffect(() => {
    let storedGuest = localStorage.getItem('lefri_guest_id');
    if (!storedGuest) {
      storedGuest = 'guest_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      localStorage.setItem('lefri_guest_id', storedGuest);
    }
    setGuestId(storedGuest);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query || isLoading) return;

    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);
    const newCount = queryCount + 1;
    setQueryCount(newCount);

    try {
      const response = await fetch('/api/citizen/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query,
          country: user?.country || 'EC',
          language: user?.language || 'es',
          guestId: user ? undefined : guestId
        })
      });

      if (!response.ok) throw new Error('Error al conectar con el asistente legal');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let assistantFull = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.type === 'chunk') {
                assistantFull += data.data;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantFull };
                  return updated;
                });
              } else if (data.type === 'citations') {
                if (data.data?.citations) {
                  setActiveCitations(data.data.citations);
                }
              } else if (data.type === 'complete') {
                // If soft onboarding trigger
                if (!user && newCount >= 3) {
                  setTimeout(() => setShowAuthModal(true), 2500);
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error de Conexión',
        description: 'No pudimos procesar tu consulta en este momento. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const urlResponse = await api.getGoogleAuthUrl();
      const { authUrl } = await urlResponse.json();
      window.location.href = authUrl;
    } catch (e) {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setLocation('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                LeFriApp
              </span>
              <span className="ml-2 text-xs uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Público & Gratuito
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <Button 
                onClick={() => setLocation('/citizen/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md text-xs sm:text-sm"
              >
                Mi Panel Ciudadano
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/login')}
                  className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  onClick={() => setLocation('/login')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm shadow-md"
                >
                  Registrarme Gratis
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Banner Quick Triage */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button 
            onClick={() => handleQuickPrompt('Me despidieron de mi trabajo sin justificación y no quieren pagarme liquidación. ¿Cuáles son mis derechos y cuánto me corresponde?')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all hover:border-indigo-500/50 group"
          >
            <div className="text-indigo-400 font-semibold text-xs flex items-center mb-1">
              ⚖️ Laboral
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2">
              Despido intempestivo, finiquitos y liquidación.
            </p>
          </button>

          <button 
            onClick={() => handleQuickPrompt('Tengo una emergencia: la policía detuvo a un familiar en flagrancia. ¿Cuáles son los derechos y plazos legales inmediatos?')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all hover:border-rose-500/50 group"
          >
            <div className="text-rose-400 font-semibold text-xs flex items-center mb-1">
              🚨 Penal / SOS
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2">
              Detención, flagrancia y derechos del debido proceso.
            </p>
          </button>

          <button 
            onClick={() => handleQuickPrompt('¿Cómo se calcula la pensión de alimentos para mis hijos según la tabla oficial y qué documentos necesito?')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all hover:border-amber-500/50 group"
          >
            <div className="text-amber-400 font-semibold text-xs flex items-center mb-1">
              👨‍👩‍👧 Familia
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2">
              Pensión alimenticia SUPA, visitas y patria potestad.
            </p>
          </button>

          <button 
            onClick={() => handleQuickPrompt('Firmé un contrato de arrendamiento y el arrendador no me devuelve la garantía. ¿Qué procedimiento legal debo seguir?')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all hover:border-cyan-500/50 group"
          >
            <div className="text-cyan-400 font-semibold text-xs flex items-center mb-1">
              📑 Civil / Contratos
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2">
              Arrendamientos, garantías y cobro de pagarés.
            </p>
          </button>
        </div>

        {/* Chat Box Container */}
        <Card className="flex-1 flex flex-col border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden min-h-[550px]">
          {/* Active Citations Bar */}
          {activeCitations.length > 0 && (
            <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-indigo-400 font-medium flex items-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Fuentes Jurídicas:
              </span>
              {activeCitations.map((c, i) => (
                <Badge key={i} variant="outline" className="bg-slate-900/80 border-indigo-500/30 text-slate-300 text-[11px] whitespace-nowrap">
                  {c.title}
                </Badge>
              ))}
            </div>
          )}

          {/* Messages Stream */}
          <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`p-4 rounded-2xl max-w-[85%] text-sm sm:text-base leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <FormattedMarkdown content={msg.content} isUser={msg.role === 'user'} />
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300 border border-slate-700">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                  <span>Analizando jurisprudencia y redactando respuesta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Chat Input Section */}
          <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur">
            <div className="flex items-center space-x-2">
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Escribe tu duda legal aquí (ej: Me despidieron, pensión de alimentos, contrato)..."
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-indigo-500"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={isLoading || !chatInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 sm:px-5 flex-shrink-0"
              >
                <Send className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Consultar</span>
              </Button>
            </div>
            
            <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Orientación jurídica con Inteligencia Artificial. No constituye patrocinio letrado definitivo.</span>
              {!user && (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Guardar este caso en mi cuenta
                </button>
              )}
            </div>
          </div>
        </Card>
      </main>

      {/* Soft-Onboarding Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
              <Scale className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Guarda tu Caso y Conecta tus Canales</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Has realizado consultas gratuitas. Guarda tu historial legal para retomarlo en cualquier momento o continuar por WhatsApp / Telegram.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleGoogleAuth}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-xl py-5 flex items-center justify-center space-x-2 shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google (1 Clic)</span>
            </Button>

            <Button 
              onClick={() => setLocation('/login')}
              variant="outline"
              className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl py-5"
            >
              Iniciar o Registrarme con Correo
            </Button>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <a 
                href="https://t.me/LeFriLegalBot" 
                target="_blank" 
                rel="noreferrer"
                className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-400 flex items-center justify-center space-x-1.5 text-xs hover:bg-sky-950/60 transition"
              >
                <span>Chatear en Telegram</span>
              </a>
              <a 
                href="https://wa.me/1234567890?text=Hola,%20deseo%20orientacion%20legal%20gratuita" 
                target="_blank" 
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center space-x-1.5 text-xs hover:bg-emerald-950/60 transition"
              >
                <span>Chatear en WhatsApp</span>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
