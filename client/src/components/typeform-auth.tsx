'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Sparkles, ArrowRight, ArrowLeft, 
  CheckCircle2, CornerDownLeft, ShieldCheck, Scale, Globe, LogIn, UserPlus, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface TypeformAuthProps {
  initialMode?: 'login' | 'register';
  onSwitchToClassic?: () => void;
}

export function TypeformAuth({ initialMode = 'login', onSwitchToClassic }: TypeformAuthProps) {
  const [, setLocation] = useLocation();
  const { login, setLoading, isLoading } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    legalNeed: 'general'
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    setCurrentStep(0);
    setErrorMessage(null);
    setUserAlreadyExists(false);
  }, [initialMode]);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [currentStep, mode]);

  // Questions configuration Typeform style
  const loginQuestions = useMemo(() => [
    {
      id: 'login_email',
      badge: language === 'en' ? 'Step 1 • Identification' : language === 'pt' ? 'Etapa 1 • Identificação' : 'Paso 1 • Identificación',
      title: language === 'en' ? "Welcome back! What's your registered email?" : language === 'pt' ? "Bem-vindo de volta! Qual é o seu e-mail cadastrado?" : "¡Bienvenido de vuelta! ¿Cuál es tu correo registrado?",
      subtitle: language === 'en' ? "Enter the email associated with your LeFriApp account." : language === 'pt' ? "Digite o e-mail associado à sua conta do LeFriApp." : "Ingresa el correo electrónico asociado a tu cuenta de LeFriApp.",
      field: 'email',
      type: 'email',
      placeholder: 'nombre@ejemplo.com',
      icon: Mail,
    },
    {
      id: 'login_password',
      badge: language === 'en' ? 'Step 2 • Security' : language === 'pt' ? 'Etapa 2 • Seguridad' : 'Paso 2 • Seguridad',
      title: language === 'en' ? "Enter your access password" : language === 'pt' ? "Digite sua senha de acesso" : "Ingresa tu contraseña de acceso",
      subtitle: language === 'en' ? "Your legal sessions and cases are end-to-end encrypted." : language === 'pt' ? "Suas consultas e casos jurídicos são protegidos com criptografia." : "Tus consultas y casos jurídicos están protegidos con cifrado de alta seguridad.",
      field: 'password',
      type: 'password',
      placeholder: '••••••••',
      icon: Lock,
    }
  ], [language]);

  const registerQuestions = useMemo(() => [
    {
      id: 'reg_name',
      badge: language === 'en' ? 'Step 1 • Profile' : language === 'pt' ? 'Etapa 1 • Perfil' : 'Paso 1 • Perfil',
      title: language === 'en' ? "¿What is your full name?" : language === 'pt' ? "¿Qual é o seu nome completo?" : "¿Cuál es tu nombre completo?",
      subtitle: language === 'en' ? "We will personalize your legal files and official documents with this name." : language === 'pt' ? "Personalizaremos seus dossiês jurídicos e atendimentos com esse nome." : "Personalizaremos tus expedientes jurídicos y orientaciones con este nombre.",
      field: 'name',
      type: 'text',
      placeholder: 'Ej. Jonnathan Peña',
      icon: User,
    },
    {
      id: 'reg_email',
      badge: language === 'en' ? 'Step 2 • Contact' : language === 'pt' ? 'Etapa 2 • Contato' : 'Paso 2 • Contacto',
      title: language === 'en' ? "¿What is your email address?" : language === 'pt' ? "¿Qual é o seu e-mail?" : "¿Cuál es tu correo electrónico?",
      subtitle: language === 'en' ? "You will receive case updates, legal grounding summaries, and WhatsApp alerts." : language === 'pt' ? "Você receberá atualizações do caso e alertas de emergência." : "Aquí recibirás el seguimiento de tus casos y alertas de emergencia legal.",
      field: 'email',
      type: 'email',
      placeholder: 'jonnathan@ejemplo.com',
      icon: Mail,
    },
    {
      id: 'reg_legal_need',
      badge: language === 'en' ? 'Step 3 • Legal Area' : language === 'pt' ? 'Etapa 3 • Área Jurídica' : 'Paso 3 • Área de Consulta',
      title: language === 'en' ? "¿What type of legal situation brings you here?" : language === 'pt' ? "¿Qual área jurídica você precisa consultar?" : "¿En qué área legal requieres orientación hoy?",
      subtitle: language === 'en' ? "This calibrates our AI triage engine to your specific jurisdiction and legal code." : language === 'pt' ? "Isso calibra nossa IA para o código e normas pertinentes." : "Esto calibra a nuestro agente con el código y normativa exacta para tu caso.",
      field: 'legalNeed',
      type: 'select',
      icon: Scale,
      options: [
        { label: language === 'en' ? 'Labor & Employment (Dismissal, Wages)' : language === 'pt' ? 'Trabalhista (Demissões, Salários)' : 'Laboral (Despido, Sueldos, Finiquitos)', value: 'laboral', desc: 'Código de Trabajo' },
        { label: language === 'en' ? 'Family & Child Support' : language === 'pt' ? 'Família e Pensão Alimentícia' : 'Familia, Pensión de Alimentos y Custodia', value: 'familia', desc: 'Código de la Niñez' },
        { label: language === 'en' ? 'Civil, Contracts & Housing' : language === 'pt' ? 'Civil, Contratos e Imóveis' : 'Civil, Contratos, Deudas e Inquilinato', value: 'civil', desc: 'Código Civil / COGEP' },
        { label: language === 'en' ? 'Emergency / Criminal Defense' : language === 'pt' ? 'Penal e Defesa de Urgência' : 'Penal o Detención de Emergencia', value: 'penal', desc: 'COIP' }
      ]
    },
    {
      id: 'reg_password',
      badge: language === 'en' ? 'Step 4 • Security' : language === 'pt' ? 'Etapa 4 • Senha' : 'Paso 4 • Contraseña',
      title: language === 'en' ? "Create a secure password" : language === 'pt' ? "Crie uma senha segura" : "Crea una contraseña segura",
      subtitle: language === 'en' ? "Must be at least 6 characters to safeguard your privacy." : language === 'pt' ? "Mínimo de 6 caracteres para proteger sua privacidade." : "Mínimo 6 caracteres para salvaguardar tu privacidad y expediente.",
      field: 'password',
      type: 'password',
      placeholder: '••••••••',
      icon: Lock,
    },
    {
      id: 'reg_confirm_password',
      badge: language === 'en' ? 'Final Step • Confirmation' : language === 'pt' ? 'Etapa Final • Confirmação' : 'Paso Final • Confirmación',
      title: language === 'en' ? "Confirm your password" : language === 'pt' ? "Confirme sua senha" : "Confirma tu contraseña",
      subtitle: language === 'en' ? "Please re-type your password to ensure there are no typos." : language === 'pt' ? "Digite novamente para garantir que não haja erros de digitação." : "Vuelve a escribirla para asegurarnos de que no haya errores tipográficos.",
      field: 'confirmPassword',
      type: 'password',
      placeholder: '••••••••',
      icon: Lock,
    }
  ], [language]);

  const questions = mode === 'login' ? loginQuestions : registerQuestions;
  const currentQ = questions[currentStep] || questions[0];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  const handleNext = () => {
    setErrorMessage(null);
    const val = formData[currentQ.field as keyof typeof formData] || '';

    // Step validations
    if (currentQ.type === 'email') {
      if (!val || !val.includes('@') || !val.includes('.')) {
        setErrorMessage(language === 'en' ? 'Please enter a valid email address.' : language === 'pt' ? 'Por favor insira um e-mail válido.' : 'Por favor ingresa un correo electrónico válido.');
        return;
      }
    } else if (currentQ.type === 'text') {
      if (!val || val.trim().length < 2) {
        setErrorMessage(language === 'en' ? 'Please complete this field.' : language === 'pt' ? 'Por favor preencha este campo.' : 'Por favor ingresa tu nombre completo.');
        return;
      }
    } else if (currentQ.id === 'reg_password' || currentQ.id === 'login_password') {
      if (!val || val.length < 6) {
        setErrorMessage(language === 'en' ? 'Password must have at least 6 characters.' : language === 'pt' ? 'A senha deve ter no mínimo 6 caracteres.' : 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    } else if (currentQ.id === 'reg_confirm_password') {
      if (val !== formData.password) {
        setErrorMessage(language === 'en' ? 'Passwords do not match.' : language === 'pt' ? 'As senhas não coincidem.' : 'Las contraseñas no coinciden. Por favor revisa.');
        return;
      }
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setUserAlreadyExists(false);
    setLoading(true);

    if (mode === 'login') {
      try {
        const response = await api.login({
          email: formData.email,
          password: formData.password
        });
        const data = await response.json();

        login(data.user);
        toast({
          title: "¡Bienvenido!",
          description: "Acceso verificado. Redirigiendo a tu panel...",
        });
        setTimeout(() => {
          setLocation('/dashboard');
        }, 600);
      } catch (err: any) {
        const msg = err.message || 'Credenciales inválidas. Por favor verifica.';
        setErrorMessage(msg);
        if (msg.toLowerCase().includes('google') || err.status === 401) {
          setIsGoogleUser(msg.toLowerCase().includes('google'));
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      try {
        const response = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: "EC",
          language: language
        });
        const data = await response.json();

        login(data.user);
        toast({
          title: "¡Bienvenido a LeFriApp!",
          description: data.message || "Tu cuenta ha sido activada exitosamente.",
        });
        setTimeout(() => {
          setLocation('/dashboard');
        }, 800);
      } catch (err: any) {
        const msg = err.message || 'No se pudo completar el registro.';
        if (err.status === 409 || msg.toLowerCase().includes('ya existe') || msg.toLowerCase().includes('already exists')) {
          setUserAlreadyExists(true);
          setErrorMessage('Ya existe una cuenta con este correo electrónico. Puedes iniciar sesión directamente con tu contraseña o con Google.');
        } else {
          setErrorMessage(msg);
        }
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

  const switchToLoginWithExistingEmail = () => {
    setMode('login');
    setCurrentStep(1); // Go straight to password step since email is already filled!
    setErrorMessage(null);
    setUserAlreadyExists(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-[560px] justify-between relative selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Progress */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {mode === 'login' 
                  ? (language === 'en' ? 'Login Experience' : language === 'pt' ? 'Experiência de Login' : 'Acceso Guiado')
                  : (language === 'en' ? 'New Account Experience' : language === 'pt' ? 'Cadastro Guiado' : 'Registro de Cuenta')}
              </span>
            </span>
            <span>•</span>
            <span>{language === 'en' ? `Step ${currentStep + 1} of ${questions.length}` : language === 'pt' ? `Etapa ${currentStep + 1} de ${questions.length}` : `Paso ${currentStep + 1} de ${questions.length}`}</span>
          </div>

          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-teal-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-mono text-slate-400 w-8 text-right">{progressPercent}%</span>
          </div>
        </div>

        {/* Question Area Animated with Typeform look & feel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-6 py-2"
          >
            {/* Context Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium">
              <currentQ.icon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentQ.badge}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {currentQ.title}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                {currentQ.subtitle}
              </p>
            </div>

            {/* Input Element */}
            <div className="pt-2">
              {currentQ.type === 'select' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options?.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, legalNeed: opt.value }));
                        setTimeout(() => {
                          if (currentStep < questions.length - 1) {
                            setCurrentStep(prev => prev + 1);
                          }
                        }, 180);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.legalNeed === opt.value
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="font-semibold text-sm text-white mb-1">{opt.label}</div>
                      <div className="text-xs text-slate-400 font-mono">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type={currentQ.type}
                      value={formData[currentQ.field as keyof typeof formData] || ''}
                      onChange={(e) => setFormData({ ...formData, [currentQ.field]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      placeholder={currentQ.placeholder}
                      className="h-14 sm:h-16 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-lg sm:text-xl rounded-2xl px-5 focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-inner"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-slate-500 pl-1">
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter ↵</kbd> para avanzar</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error or Notice Alert */}
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{errorMessage}</p>
                  {isGoogleUser && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={handleGoogleAuth}
                        className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold h-8 shadow"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1.5">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continuar con Google</span>
                      </Button>
                    </div>
                  )}
                  {userAlreadyExists && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={switchToLoginWithExistingEmail}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8"
                      >
                        <LogIn className="w-3.5 h-3.5 mr-1" />
                        <span>Iniciar Sesión con esta cuenta</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleGoogleAuth}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs h-8"
                      >
                        <span>O con Google</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentStep(1); // Go back to email step
                          setErrorMessage(null);
                          setUserAlreadyExists(false);
                        }}
                        className="text-xs text-slate-400 hover:text-white h-8"
                      >
                        Cambiar correo
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation & Actions */}
      <div className="pt-8 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isLoading}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 h-11 px-4 text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Atrás</span>
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white h-11 px-6 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </span>
            ) : currentStep === questions.length - 1 ? (
              <span className="flex items-center space-x-1.5">
                <span>{mode === 'login' ? 'Entrar a LeFriApp' : 'Crear Cuenta y Finalizar'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>

        {/* Secondary options (Mode switch & Google OAuth) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs text-slate-400">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="text-xs text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 h-9"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" className="mr-2">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </Button>

          <button
            type="button"
            onClick={() => {
              const newMode = mode === 'login' ? 'register' : 'login';
              setMode(newMode);
              setCurrentStep(0);
              setErrorMessage(null);
              setUserAlreadyExists(false);
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-4 hover:underline"
          >
            {mode === 'login' ? '¿Crear nueva cuenta?' : '¿Ya tienes cuenta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
