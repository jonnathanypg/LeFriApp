import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/navbar';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  MessageSquare, FileText, Briefcase, AlertTriangle, ArrowRight, 
  Send, Bot, User as UserIcon, CheckCircle2, ShieldAlert, Sparkles,
  Smartphone, MessageCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CitizenDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Array<{ title: string; source?: string }>>([]);

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { 
      role: 'assistant', 
      content: '¡Hola! Soy tu Agente Mediador Legal personal de LeFriApp. Estoy conectado a la jurisprudencia oficial y a tus canales de mensajería. ¿Qué consulta o situación jurídica deseas resolver hoy?' 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Sync any guest history if existing in localStorage
  useEffect(() => {
    const guestId = localStorage.getItem('lefri_guest_id');
    if (guestId) {
      fetch('/api/citizen/sync-guest-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ guestId })
      }).then(() => {
        localStorage.removeItem('lefri_guest_id');
        queryClient.invalidateQueries({ queryKey: ['/api/citizen/unified-history'] });
      }).catch(() => {});
    }
  }, []);

  // Fetch Connected Channels (Web, WhatsApp, Telegram)
  const { data: channels, refetch: refetchChannels } = useQuery({
    queryKey: ['/api/citizen/channels'],
    queryFn: async () => {
      const response = await fetch('/api/citizen/channels', { credentials: 'include' });
      if (!response.ok) return null;
      return await response.json();
    }
  });

  // Fetch Unified Cross-Channel History
  const { data: unifiedHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/citizen/unified-history'],
    queryFn: async () => {
      const response = await fetch('/api/citizen/unified-history', { credentials: 'include' });
      if (response.ok) return await response.json();
      return [];
    }
  });

  // Fetch Citizen Cases (matched lawyers)
  const { data: cases } = useQuery({
    queryKey: ['/api/citizen/cases'],
    queryFn: async () => {
      const response = await fetch('/api/citizen/cases', { credentials: 'include' });
      if (response.ok) return await response.json();
      return [];
    }
  });

  const handleSendChat = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/citizen/ask', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          country: user?.country || "EC",
          language: user?.language || "es"
        })
      });

      if (!response.ok) throw new Error("Error en la conexión con el agente");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.replace('data: ', ''));
              if (parsed.type === 'chunk') {
                assistantText += parsed.data;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                  return updated;
                });
              } else if (parsed.type === 'citations') {
                if (parsed.data?.citations) {
                  setActiveCitations(parsed.data.citations);
                }
              }
            } catch (e) {}
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/citizen/unified-history'] });
    } catch (err: any) {
      toast({ title: "Error", description: "No se pudo conectar con el agente mediador.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Top Channel Connectivity Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Web Channel */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Web Chat IA</p>
                <p className="text-xs text-emerald-400 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Activo & Sincronizado
                </p>
              </div>
            </div>
          </div>

          {/* Telegram Channel */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Bot de Telegram</p>
                <p className="text-xs text-slate-400">
                  {channels?.telegram?.connected ? '🟢 Vinculado' : '⚪ No vinculado'}
                </p>
              </div>
            </div>
            <a 
              href={channels?.telegram?.deepLink || "https://t.me/LeFriLegalBot"} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition flex items-center"
            >
              {channels?.telegram?.connected ? 'Abrir Bot' : 'Conectar'}
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          {/* WhatsApp Channel */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">WhatsApp Oficial</p>
                <p className="text-xs text-slate-400">
                  {channels?.whatsapp?.connected ? `🟢 Número: ...${channels?.whatsapp?.phone}` : '⚪ No vinculado'}
                </p>
              </div>
            </div>
            <a 
              href={channels?.whatsapp?.deepLink || "https://wa.me/1234567890"} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center"
            >
              {channels?.whatsapp?.connected ? 'Abrir WhatsApp' : 'Conectar'}
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Interactive Conversational Legal Chat */}
          <div className="lg:col-span-2 flex flex-col h-[650px]">
            <Card className="flex-1 flex flex-col border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-900/80 border-b border-slate-800 py-4 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-100 font-semibold">Mediador Legal Personal</CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        RAG Conectado a Códigos Orgánicos, Constitución y Tavily Search.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-950/40 text-xs">
                    Multicanal Activo
                  </Badge>
                </div>

                {activeCitations.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="text-indigo-400 flex items-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 mr-1" /> Fuentes:
                    </span>
                    {activeCitations.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 whitespace-nowrap">
                        {c.title}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>

              {/* Chat Message Stream */}
              <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/30">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-indigo-950 border border-indigo-500/30 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-400">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow' 
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-300">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-950 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                      <span>Generando orientación jurídica...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-2">
                <Input 
                  placeholder="Escribe tu consulta legal aquí..." 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                  className="bg-slate-900 border-slate-800 text-slate-100 text-sm rounded-xl"
                />
                <Button 
                  onClick={handleSendChat}
                  disabled={isStreaming || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Enviar
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Unified Cross-Channel Timeline & Case Matching */}
          <div className="space-y-6">
            
            {/* Unified History Card */}
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="py-4 px-5 border-b border-slate-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-200">Historial Omnicanal</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Web, WhatsApp y Telegram</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/citizen/unified-history'] })}
                  className="text-slate-400 hover:text-slate-200 h-8 px-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-3">
                {isLoadingHistory ? (
                  <p className="text-xs text-slate-500 text-center py-4">Cargando historial...</p>
                ) : unifiedHistory && unifiedHistory.length > 0 ? (
                  unifiedHistory.map((item: any) => (
                    <div 
                      key={item.id}
                      onClick={() => setMessages(prev => [...prev, { role: 'user', content: item.query }, { role: 'assistant', content: item.response }])}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] uppercase font-bold ${
                            item.source === 'whatsapp' ? 'text-emerald-400 border-emerald-500/30' :
                            item.source === 'telegram' ? 'text-sky-400 border-sky-500/30' :
                            'text-indigo-400 border-indigo-500/30'
                          }`}
                        >
                          {item.source}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-1">{item.query}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No hay consultas previas registradas.</p>
                )}
              </CardContent>
            </Card>

            {/* Matched Lawyers Card */}
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="py-4 px-5 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-200">Abogados Asignados</CardTitle>
                <CardDescription className="text-xs text-slate-400">Patrocinio verificado</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {cases && cases.length > 0 ? (
                  cases.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-xs font-semibold text-indigo-400">{c.title || 'Caso Legal'}</p>
                      <p className="text-xs text-slate-300 mt-1">Firma: {c.lawFirm?.name || 'Asignada'}</p>
                      <Badge className="mt-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        Estado: {c.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
                    <Briefcase className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No tienes abogados asignados actualmente.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Si tu caso requiere patrocinio legal en juzgados, la IA te derivará automáticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
