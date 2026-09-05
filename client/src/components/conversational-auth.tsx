import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Bot, User as UserIcon, Send, ArrowRight, Shield, CheckCircle2, 
  Sparkles, Lock, Mail, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversationalAuthProps {
  initialMode?: 'login' | 'register';
  onSwitchToTraditional?: () => void;
}

type AuthStep = 
  | 'intro'
  | 'choose_mode'
  | 'login_email'
  | 'login_password'
  | 'reg_name'
  | 'reg_email'
  | 'reg_password'
  | 'confirm_password'
  | 'submitting'
  | 'success';

interface Message {
  sender: 'assistant' | 'user';
  text: string;
}

export function ConversationalAuth({ initialMode = 'login', onSwitchToTraditional }: ConversationalAuthProps) {
  const [, setLocation] = useLocation();
  const { login, setLoading, isLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<AuthStep>(initialMode === 'register' ? 'reg_name' : 'login_email');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (initialMode === 'register') {
      setMessages([
        {
          sender: 'assistant',
          text: language === 'en' 
            ? "Hello! I'm your Legal Agent Assistant. Let's create your account in 3 simple steps to access personalized legal consultations and emergency alerts. What is your full name?"
            : language === 'pt'
            ? "Olá! Sou seu Assistente Jurídico Inteligente. Vamos criar sua conta em 3 etapas simples para que você acesse consultas e alertas de emergência. Qual é o seu nome completo?"
            : "¡Hola! Soy tu Asistente Agéntico de LeFriApp. Creemos tu cuenta en 3 sencillos pasos para que puedas acceder a tus consultas legales personalizadas y alertas de emergencia. ¿Cuál es tu nombre completo?"
        }
      ]);
      setStep('reg_name');
    } else {
      setMessages([
        {
          sender: 'assistant',
          text: language === 'en'
            ? "Welcome back to LeFriApp. To continue with your legal consultations and cases, please tell me your registered email address."
            : language === 'pt'
            ? "Bem-vindo de volta ao LeFriApp. Para acessar suas consultas e casos, por favor informe seu e-mail cadastrado."
            : "¡Bienvenido de vuelta a LeFriApp! Para continuar con tus orientaciones y casos legales, por favor indícame tu correo electrónico registrado."
        }
      ]);
      setStep('login_email');
    }
  }, [initialMode, language]);

  const handleSend = async () => {
    const val = inputValue.trim();
    if (!val) return;

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: step.includes('password') ? '••••••••' : val }]);
    setInputValue('');

    if (step === 'login_email') {
      if (!val.includes('@') || !val.includes('.')) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: language === 'en' 
              ? "That doesn't look like a valid email. Please check and try again:"
              : language === 'pt'
              ? "Esse e-mail parece inválido. Por favor, verifique e tente novamente:"
              : "Ese no parece un correo electrónico válido. Por favor revísalo e intenta de nuevo:"
          }]);
        }, 300);
        return;
      }
      setFormData(prev => ({ ...prev, email: val }));
      setStep('login_password');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en' 
            ? `Thanks. Now enter your password for ${val}:`
            : language === 'pt'
            ? `Obrigado. Agora digite sua senha de acesso para ${val}:`
            : `Gracias. Ahora ingresa tu contraseña de acceso para ${val}:`
        }]);
      }, 300);
    } else if (step === 'login_password') {
      const email = formData.email;
      const password = val;
      setStep('submitting');
      setLoading(true);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en' ? "Verifying your credentials..." : language === 'pt' ? "Verificando suas credenciais..." : "Verificando tus credenciales con el servidor seguro..."
        }]);
      }, 200);

      try {
        const response = await api.login({ email, password });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al iniciar sesión');
        }

        login(data.user);
        setStep('success');
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en' 
            ? "Access granted! Redirecting you to your legal dashboard..." 
            : language === 'pt'
            ? "Acesso confirmado! Redirecionando para o seu painel..."
            : "¡Acceso verificado con éxito! Te estoy redirigiendo a tu panel legal..."
        }]);
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1000);
      } catch (err: any) {
        setStep('login_password');
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en'
            ? `Could not log in: ${err.message || 'Invalid credentials'}. Please try entering your password again:`
            : language === 'pt'
            ? `Não foi possível entrar: ${err.message || 'Credenciais inválidas'}. Tente digitar sua senha novamente:`
            : `No se pudo ingresar: ${err.message || 'Credenciales inválidas'}. Por favor vuelve a ingresar tu contraseña:`
        }]);
      } finally {
        setLoading(false);
      }
    } else if (step === 'reg_name') {
      if (val.length < 2) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: language === 'en' ? "Please enter a valid name:" : language === 'pt' ? "Por favor informe um nome válido:" : "Por favor ingresa un nombre válido:"
          }]);
        }, 300);
        return;
      }
      setFormData(prev => ({ ...prev, name: val }));
      setStep('reg_email');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en'
            ? `Nice to meet you, ${val}! What is your email address?`
            : language === 'pt'
            ? `Prazer em conhecer você, ${val}! Qual é o seu e-mail?`
            : `¡Un gusto saludarte, ${val}! ¿Cuál es tu correo electrónico?`
        }]);
      }, 300);
    } else if (step === 'reg_email') {
      if (!val.includes('@') || !val.includes('.')) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: language === 'en' 
              ? "Please enter a valid email address:" 
              : language === 'pt' 
              ? "Por favor informe um e-mail válido:" 
              : "Por favor proporciona un correo válido:"
          }]);
        }, 300);
        return;
      }
      setFormData(prev => ({ ...prev, email: val }));
      setStep('reg_password');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en'
            ? "Create a secure password (at least 6 characters):"
            : language === 'pt'
            ? "Crie uma senha segura (mínimo de 6 caracteres):"
            : "Crea una contraseña segura (mínimo 6 caracteres):"
        }]);
      }, 300);
    } else if (step === 'reg_password') {
      if (val.length < 6) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: language === 'en' 
              ? "Password is too short. It must be at least 6 characters:" 
              : language === 'pt' 
              ? "A senha é muito curta. Precisa ter no mínimo 6 caracteres:" 
              : "La contraseña es muy corta. Debe tener al menos 6 caracteres:"
          }]);
        }, 300);
        return;
      }
      setFormData(prev => ({ ...prev, password: val }));
      setStep('confirm_password');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en'
            ? "Please repeat the password to confirm:"
            : language === 'pt'
            ? "Por favor confirme sua senha:"
            : "Por favor repite tu contraseña para confirmar:"
        }]);
      }, 300);
    } else if (step === 'confirm_password') {
      if (val !== formData.password) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: language === 'en'
              ? "Passwords do not match. Please re-enter confirmation password:"
              : language === 'pt'
              ? "As senhas não coincidem. Digite novamente para confirmar:"
              : "Las contraseñas no coinciden. Por favor repite la contraseña:"
          }]);
        }, 300);
        return;
      }

      setFormData(prev => ({ ...prev, confirmPassword: val }));
      setStep('submitting');
      setLoading(true);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en' ? "Creating your account with Fundación Underlife legal network..." : language === 'pt' ? "Criando sua conta na rede jurídica da Fundação Underlife..." : "Creando tu cuenta protegida en la red legal de Fundación Underlife..."
        }]);
      }, 200);

      try {
        const response = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: "EC",
          language: language
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al registrar usuario');
        }

        login(data.user);
        setStep('success');
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en' 
            ? "Account created successfully! Welcome aboard. Opening your dashboard..." 
            : language === 'pt'
            ? "Conta criada com sucesso! Bem-vindo. Abrindo seu painel..."
            : "¡Cuenta creada exitosamente! Bienvenido a LeFriApp. Abriendo tu panel..."
        }]);
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1200);
      } catch (err: any) {
        setStep('reg_password');
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: language === 'en'
            ? `Registration failed: ${err.message}. Let's try setting the password again:`
            : language === 'pt'
            ? `Falha no cadastro: ${err.message}. Vamos tentar definir a senha novamente:`
            : `Error en el registro: ${err.message}. Intentemos definiendo la contraseña nuevamente:`
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const urlResponse = await api.getGoogleAuthUrl();
      const { authUrl } = await urlResponse.json();
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al iniciar sesión con Google.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[560px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {mode === 'login' 
                ? (language === 'en' ? 'Conversational Login' : language === 'pt' ? 'Login Conversacional' : 'Inicio de Sesión Conversacional')
                : (language === 'en' ? 'Conversational Registration' : language === 'pt' ? 'Cadastro Conversacional' : 'Registro Asistido Conversacional')}
            </h3>
            <p className="text-[11px] text-slate-400">Agente LeFriApp — Fundación Underlife</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onSwitchToTraditional && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwitchToTraditional}
              className="text-xs text-slate-400 hover:text-white"
            >
              Form Clásico
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={`p-3 rounded-2xl max-w-[82%] text-sm leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60'
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
        <div ref={chatBottomRef} />
      </div>

      {/* Google OAuth Quick Button */}
      {step !== 'success' && (
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>O autentícate directamente:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="h-7 text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
          >
            Google OAuth
          </Button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            type={step.includes('password') ? 'password' : 'text'}
            placeholder={
              step === 'login_email' || step === 'reg_email' ? 'nombre@ejemplo.com' :
              step.includes('password') ? 'Escribe tu contraseña...' :
              step === 'reg_name' ? 'Tu nombre y apellido...' :
              'Escribe tu respuesta...'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={step === 'submitting' || step === 'success' || isLoading}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm focus-visible:ring-indigo-500"
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || step === 'submitting' || step === 'success' || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-500">
          <span>
            {mode === 'login' ? '¿No tienes cuenta todavía?' : '¿Ya tienes una cuenta registrada?'}
          </span>
          <button
            type="button"
            onClick={() => {
              const newMode = mode === 'login' ? 'register' : 'login';
              setMode(newMode);
              setStep(newMode === 'register' ? 'reg_name' : 'login_email');
              setMessages([
                {
                  sender: 'assistant',
                  text: newMode === 'register'
                    ? (language === 'en' ? "Let's create your account. What is your full name?" : language === 'pt' ? "Vamos criar sua conta. Qual é o seu nome?" : "Creemos tu nueva cuenta. ¿Cuál es tu nombre completo?")
                    : (language === 'en' ? "Welcome back! What is your registered email?" : language === 'pt' ? "Bem-vindo! Qual é o seu e-mail?" : "¡Bienvenido de vuelta! ¿Cuál es tu correo registrado?")
                }
              ]);
            }}
            className="text-indigo-400 hover:underline font-medium"
          >
            {mode === 'login' ? 'Registrarme' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
