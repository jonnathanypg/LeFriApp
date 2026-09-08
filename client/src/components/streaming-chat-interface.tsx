import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Send, Loader2, Sparkles, Copy, Check, CornerDownLeft, Volume2, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { VoiceRecorder } from '@/components/voice-recorder';
import { toast } from '@/hooks/use-toast';
import { FormattedMarkdown } from '@/components/formatted-markdown';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  citations?: Array<{ title: string; url: string; relevance: number; source?: string }>;
  confidence?: number;
}

interface StreamingChatInterfaceProps {
  country: string;
}

// Function to format markdown text safely with clean typography
const formatMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>');
};

export function StreamingChatInterface({ country }: StreamingChatInterfaceProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Initial welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      content: t.welcomeMessage || "¡Hola! Soy tu asistente legal agéntico de LeFriApp. Cuéntame tu situación legal o duda sobre tus derechos y te orientaré con fundamentos constitucionales y normativos.",
      sender: 'ai',
      timestamp: new Date(),
    }]);
  }, [language, t.welcomeMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copiado al portapapeles" });
  };

  const handleVoiceTranscription = (text: string) => {
    setInputValue(prev => prev ? `${prev} ${text}` : text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: query,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      citations: [],
      confidence: 0
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?._id || user?.id || '66a1b2c3d4e5f6789abc1234',
        },
        body: JSON.stringify({
          query: userMessage.content,
          country,
          language: user?.language || language || 'es',
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'citations') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, citations: data.data.citations, confidence: 0.95 }
                      : msg
                  ));
                } else if (data.type === 'chunk') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: msg.content + data.data }
                      : msg
                  ));
                } else if (data.type === 'complete') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, confidence: data.data.confidence }
                      : msg
                  ));
                } else if (data.type === 'error') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: 'Lo siento, hubo un error procesando tu consulta legal. Por favor intenta de nuevo.' }
                      : msg
                  ));
                }
              } catch (e) {
                // Ignore parse errors from chunk boundaries
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: 'Hubo una interrupción al conectar con el asistente legal. Por favor verifica tu conexión y reintenta.' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestionChips = [
    { title: "Despido intempestivo", query: "¿Cuáles son mis derechos y qué indemnización me corresponde si me despiden sin previo aviso?" },
    { title: "Pensión de alimentos", query: "¿Cómo se calcula la pensión de alimentos y qué documentos necesito para solicitarla?" },
    { title: "Derecho de petición", query: "¿Cómo redactar un derecho de petición ante una entidad pública y qué plazo tienen para responder?" },
    { title: "Detención o debido proceso", query: "¿Cuáles son mis garantías constitucionales básicas si me detienen o investigan?" }
  ];

  return (
    <div className="flex flex-col h-[650px] max-w-4xl mx-auto rounded-2xl bg-slate-950/70 border border-slate-800/90 shadow-2xl overflow-hidden">
      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          const isAi = message.sender === 'ai';

          return (
            <div
              key={message.id}
              className={`flex gap-3.5 group ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {isAi && (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-950/50 mt-1 border border-indigo-400/30">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-200 ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-sm shadow-md shadow-indigo-950/30 font-normal'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
                  }`}
                >
                  <FormattedMarkdown 
                    content={message.content} 
                    isUser={isUser}
                  />

                  {/* Constitutional RAG Citations */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Fundamentos constitucionales vinculados:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.citations.map((cite, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20 text-indigo-200"
                          >
                            {cite.title} ({cite.relevance}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bubble Footer / Actions */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-500">
                  <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isAi && message.content && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-300 flex items-center gap-1"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing / Streaming Indicator */}
        {isLoading && (
          <div className="flex gap-3.5 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs text-slate-400 font-medium ml-1.5">Consultando marco jurídico y jurisprudencia...</span>
            </div>
          </div>
        )}

        {/* Suggestion Chips when only 1 message */}
        {messages.length <= 1 && (
          <div className="pt-4 space-y-2">
            <p className="text-xs text-slate-400 font-medium">Temas frecuentes de consulta:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/60 text-left transition-all duration-200 group"
                >
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">{chip.title}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{chip.query}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Claude/ChatGPT Style Input Bar with Voice Note support */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md">
        <div className="relative flex flex-col rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-inner">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.questionPlaceholder ? t.questionPlaceholder.replace('{country}', (t.countries as any)[country] || country) : `Haz tu consulta legal sobre ${country || 'Ecuador'}... (Presiona Enter para enviar)`}
            className="w-full bg-transparent border-0 focus-visible:ring-0 text-slate-100 placeholder:text-slate-500 text-sm resize-none py-3 px-4 min-h-[50px] max-h-[140px]"
            rows={1}
            disabled={isLoading}
          />

          {/* Bottom Bar inside the Input Box */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            {/* Voice Dictation (Compact Minimalist Pill) */}
            <div className="flex items-center gap-1.5">
              <VoiceRecorder
                compact={true}
                onRecordingComplete={(blob) => {
                  const formData = new FormData();
                  formData.append('file', blob, 'chat_voice.webm');
                  formData.append('audio', blob, 'chat_voice.webm');
                  fetch('/api/citizen/transcribe', { method: 'POST', body: formData })
                    .then(r => r.json())
                    .then(data => {
                      if (data.text) handleVoiceTranscription(data.text);
                    })
                    .catch(() => {
                      // Fallback to /api/voice/upload
                      fetch('/api/voice/upload', { method: 'POST', body: formData })
                        .then(r => r.json())
                        .then(data => {
                          if (data.text || data.transcription) {
                            handleVoiceTranscription(data.text || data.transcription);
                          }
                        })
                        .catch(err => console.error('Voice transcription error:', err));
                    });
                }}
              />
              <span className="hidden sm:inline text-[11px] text-slate-500">
                Escribe o dicta tu consulta
              </span>
            </div>

            {/* Send Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            Asistencia pedagógica preliminar basada en normas jurídicas.
          </span>
          <span className="hidden sm:inline">Shift + Enter para salto de línea</span>
        </div>
      </div>
    </div>
  );
}