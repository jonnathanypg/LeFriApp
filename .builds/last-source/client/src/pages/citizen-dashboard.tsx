import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/navbar';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  MessageSquare, FileText, Briefcase, AlertTriangle, ArrowRight, 
  Send, Bot, User as UserIcon, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CitizenDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: '¡Hola! Soy tu Agente Mediador Legal personal de LeFri. Estoy aquí para ayudarte a comprender tus derechos, responsabilidades y crear borradores educativos de documentos. ¿Qué consulta legal tienes hoy?' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch Citizen Consultations (RAG history)
  const { data: consultations } = useQuery({
    queryKey: ['/api/consultations'],
    queryFn: async () => {
      const response = await api.getConsultations();
      if (!response.ok) throw new Error("Failed to load consultations");
      return await response.json();
    }
  });

  // Fetch Citizen Cases (matched lawyers)
  const { data: cases } = useQuery({
    queryKey: ['/api/citizen/cases'],
    queryFn: async () => {
      // Endpoint created for lawyers matching
      const response = await fetch('/api/citizen/cases', { credentials: 'include' });
      if (response.ok) {
        return await response.json();
      }
      return [];
    }
  });

  // Ask Question Mutation (Mediator Chat)
  const askMutation = useMutation({
    mutationFn: async (query: string) => {
      // Call standard ask endpoint or specific mediator chat
      // We will make a direct fetch to the new /api/processes/general/chat or /api/ask
      // Let's use the streaming ask or generalized chat. For Simplicity we fetch a post
      const response = await fetch('/api/ask', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          country: user?.country || "EC",
          language: user?.language || "es"
        })
      });
      if (!response.ok) throw new Error("Failed to get response");
      
      // Since ask is SSE, we can do a simple read or handle normal JSON.
      // The backend /api/ask uses SSE streaming. For the client chat view, we can call it or parse standard response.
      // For this chat bubble, let's process standard fetch to /api/processes/general/chat if it exists or parse SSE
      return response;
    }
  });

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      // Simple fetch call to AI general process chat (coordinator)
      const response = await fetch('/api/ask', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          country: user?.country || "EC",
          language: user?.language || "es"
        })
      });

      if (!response.ok) throw new Error("Error en la conexión");
      
      // Read response. It returns SSE stream. For simplicity of chat bubble, we parse JSON chunks or read text
      // Let's implement SSE reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let assistantText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // SSE responses look like: data: {"type":"chunk","data":"..."}
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
              }
            } catch (e) {
              // Ignore parse errors on malformed lines
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/consultations'] });
    } catch (err: any) {
      toast({ title: "Error", description: "No se pudo conectar con el agente mediador.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: AI Conversational Mediator */}
        <div className="lg:col-span-2 flex flex-col h-[75vh] space-y-4">
          <Card className="shadow border-neutral-200 flex flex-col flex-grow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-blue-100" />
                <div>
                  <CardTitle className="text-lg">Mediador Legal Personal</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">
                    RAG Inteligente conectado a Tavily Web Search y Constitute Project.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {/* Chat message bubbles */}
            <CardContent className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-[80%] text-sm shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                      : 'bg-white text-neutral-800 border-neutral-100 rounded-tl-none leading-relaxed'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            
            {/* Chat Input form */}
            <div className="p-4 border-t bg-white flex items-center space-x-2">
              <Input 
                placeholder="Escribe tu consulta o duda legal aquí..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="text-sm rounded-xl"
              />
              <Button 
                onClick={handleSendChat}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right column: Emergency Alert, Legal Drafts & Assigned Lawyers */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Emergency Panic Button */}
          <Card className="shadow border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Alerta de Emergencia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-700 mb-4 leading-relaxed">
                Envía tu ubicación exacta y un mensaje predefinido con IA a tus contactos de emergencia vía WhatsApp con un solo clic.
              </p>
              <Button 
                onClick={() => setLocation('/emergencia')} 
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-5 rounded-xl shadow-lg shadow-red-200"
              >
                <AlertTriangle className="w-4 h-4 mr-2" /> Configurar / Activar Alerta
              </Button>
            </CardContent>
          </Card>

          {/* B2C Central Channels Info card */}
          <Card className="shadow border-indigo-200 bg-indigo-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-indigo-900 flex items-center space-x-2 text-sm">
                <Bot className="w-5 h-5 text-indigo-600" />
                <span>Asistente en tu Bolsillo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-indigo-800 leading-relaxed">
                ¡Interactúa con tu cuenta de LeFriApp directamente por redes sociales! Consulta tus borradores, procesos educativos y chatea con la IA escribiendo desde tu número registrado (<strong>{user?.phone || 'No registrado en tu perfil'}</strong>).
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-white border border-indigo-100 rounded-xl text-xs">
                  <span className="font-semibold text-neutral-700">WhatsApp Oficial</span>
                  <Badge className="bg-emerald-600 text-white font-medium hover:bg-emerald-600 text-[10px]">Escribir</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white border border-indigo-100 rounded-xl text-xs">
                  <span className="font-semibold text-neutral-700">Telegram Bot</span>
                  <Badge className="bg-sky-600 text-white font-medium hover:bg-sky-600 text-[10px]">Iniciar Bot</Badge>
                </div>
              </div>
              <p className="text-[10px] text-indigo-500 italic mt-1">
                *Asegúrate de agregar tu número de teléfono en tu perfil para que el sistema te identifique.
              </p>
            </CardContent>
          </Card>

          {/* Assigned Lawyer Reference card */}
          {cases && cases.length > 0 && (
            <Card className="shadow border-indigo-200 bg-indigo-50/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-indigo-900 flex items-center space-x-2 text-sm">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Tu Abogado Conectado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cases.map((c: any) => (
                  <div key={c._id} className="p-3 bg-white border border-indigo-100 rounded-xl space-y-2 shadow-sm text-xs">
                    <p className="font-bold text-neutral-800 text-sm">{c.title}</p>
                    <p className="text-neutral-500">{c.description}</p>
                    <div className="flex items-center text-emerald-600 font-semibold mt-1">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Lead de Abogado asignado
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Educational Drafts vault */}
          <Card className="shadow border-neutral-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center">
                <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Borradores de Documentos
              </CardTitle>
              <CardDescription className="text-xs">
                Contratos, reclamos y escritos simulados generados por la IA en tus consultas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {consultations && consultations.length > 0 ? (
                consultations
                  .filter((c: any) => c.query.toLowerCase().includes('documento') || c.query.toLowerCase().includes('redacta') || c.query.toLowerCase().includes('contrato'))
                  .map((c: any, index: number) => (
                    <div key={index} className="p-3 bg-neutral-50 border rounded-xl flex items-center justify-between text-xs hover:bg-neutral-100 transition-colors">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-neutral-700 truncate capitalize">{c.query}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-indigo-600 text-white text-[9px] hover:bg-indigo-600 font-semibold cursor-pointer">
                        Ver Texto
                      </Badge>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-neutral-400 italic">No tienes borradores creados aún. Pídele al mediador: "Redacta un contrato de alquiler..." o similar.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
