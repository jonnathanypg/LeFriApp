import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { ChatMessage, ConsultationResponse } from '@/types';
import { Send, Mic, Bot, Circle } from 'lucide-react';

interface ChatInterfaceProps {
  country: string;
  processId?: string;
}

export function ChatInterface({ country, processId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: processId 
        ? 'Hello! I\'m your legal assistant specialized in process guidance. I have access to your current process information and can help you with specific questions about your case. What would you like to know?'
        : 'Hello! I\'m your legal assistant. You can ask me any questions about laws, rights, or legal processes. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const askQuestion = useMutation({
    mutationFn: async (query: string) => {
      const response = await api.askQuestion({
        query,
        country,
        language: user?.language || 'es',
      });
      return await response.json() as ConsultationResponse;
    },
    onSuccess: (data, query) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          content: data.response,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let response;
      
      if (processId) {
        // Use process-specific chat endpoint
        response = await fetch(`/api/processes/${processId}/chat`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '66a1b2c3d4e5f6789abc1234'
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) throw new Error('Error en la consulta del proceso');

        const data = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'ai',
          timestamp: new Date(),
          citations: data.citations || [],
          confidence: data.confidence || 0,
          nextSteps: data.nextSteps
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Use general consultation
        response = await fetch('/api/ask', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, country, language: 'es' }),
        });

        if (!response.ok) throw new Error('Error en la consulta');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No se pudo leer la respuesta');

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: '',
          sender: 'ai',
          timestamp: new Date(),
          citations: [],
          confidence: 0,
        };

        setMessages(prev => [...prev, assistantMessage]);

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'chunk') {
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantMessage.id 
                          ? { ...msg, content: msg.content + data.data }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'Error al procesar la consulta. Intenta nuevamente.',
        sender: 'ai',
        timestamp: new Date(),
        error: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: question,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    askQuestion.mutate(question);
  };

  const quickQuestions = [
    '¿Cuáles son mis derechos laborales básicos?',
    '¿Cómo inicio un proceso de divorcio?',
    '¿Qué necesito para crear un contrato?',
    '¿Cómo presentar una demanda?',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-96 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">Asistente Legal IA</CardTitle>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <Circle className="w-2 h-2 fill-current" />
                  <span>En línea</span>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.sender === 'ai' && (
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-2xl p-3 max-w-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.sender === 'user' && user && (
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {askQuestion.isPending && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-neutral-100 rounded-2xl rounded-tl-sm p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu consulta legal aquí..."
                  className="pr-12 bg-neutral-100 border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
                  disabled={askQuestion.isPending}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-neutral-500 hover:text-blue-500"
                  onClick={() => alert('Funcionalidad de voz en desarrollo')}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || askQuestion.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left justify-start text-sm text-neutral-700 hover:bg-neutral-100 h-auto p-2 whitespace-normal"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Legal Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recursos Legales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xs">📖</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Constitución Nacional</p>
                <p className="text-xs text-neutral-500">Actualizada 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xs">⚖️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Código Civil</p>
                <p className="text-xs text-neutral-500">Reforma reciente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
