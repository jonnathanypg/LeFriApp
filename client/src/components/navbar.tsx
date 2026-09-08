import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';
import { Scale, ChevronDown, User, Settings, LogOut, Moon, Sun, Globe, BookOpen, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  const queryClient = useQueryClient();

  const { data: systemSettings } = useQuery<{ internationalizationEnabled: boolean }>({
    queryKey: ['/api/citizen/system/settings'],
    queryFn: async () => {
      const res = await fetch('/api/citizen/system/settings');
      if (!res.ok) return { internationalizationEnabled: false };
      return await res.json();
    },
    staleTime: 60 * 1000,
  });

  const isI18nActive = systemSettings?.internationalizationEnabled ?? false;

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      setLanguage(newLanguage as 'en' | 'es' | 'pt');
      await updateUser({ language: newLanguage });
      localStorage.setItem('language', newLanguage);
      document.documentElement.lang = newLanguage;
      queryClient.invalidateQueries({ queryKey: ['translations'] });
    } catch (error) {
      console.error('Error al cambiar el idioma:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  const languageOptions = [
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'en', label: '🇺🇸 English' },
    { value: 'pt', label: '🇧🇷 Português' },
  ];

  return (
    <header className="bg-slate-950/95 border-b border-slate-800 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600/30 border border-indigo-500/40 rounded-lg flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-600/20">
                <Scale className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-white">LeFriApp</h1>
            </Link>

            {user ? (
              <nav className="hidden md:flex items-center space-x-1">
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    location === '/dashboard' 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {t.dashboard}
                </Link>

                <Link 
                  href="/consulta" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/consulta' 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.consultation}</span>
                </Link>

                <Link 
                  href="/constitucion" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/constitucion' 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' 
                      : 'text-slate-300 hover:text-indigo-400 hover:bg-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.navConstitution || t.constitution || "Constitución & Derechos"}</span>
                </Link>

                <Link 
                  href="/documentos" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/documentos' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.navDocuments || "Documentos"}</span>
                </Link>

                <Link 
                  href="/processes" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/processes' || location.startsWith('/processes/') 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'text-slate-300 hover:text-orange-400 hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  <span>{t.processes}</span>
                </Link>

                <Link 
                  href="/emergencia" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/emergencia' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'text-slate-300 hover:text-red-400 hover:bg-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{t.emergency}</span>
                </Link>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center space-x-3 text-xs text-slate-400">
                <Link href="/" className="hover:text-white transition">
                  {language === 'en' ? 'Home' : language === 'pt' ? 'Início' : 'Inicio'}
                </Link>
                <span>&bull;</span>
                <Link href="/chat" className="hover:text-indigo-400 transition flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Free Legal Chat' : language === 'pt' ? 'Chat Jurídico' : 'Consulta Gratuita'}</span>
                </Link>
              </nav>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Language Switcher (Always available across public and private pages) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button 
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2 py-1 rounded transition-all font-medium ${language === 'es' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Español"
              >
                ES
              </button>
              <button 
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-1 rounded transition-all font-medium ${language === 'en' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="English"
              >
                EN
              </button>
              <button 
                type="button"
                onClick={() => handleLanguageChange('pt')}
                className={`px-2 py-1 rounded transition-all font-medium ${language === 'pt' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Português"
              >
                PT
              </button>
            </div>

            {/* User Menu or Public Auth CTA */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-slate-200 hover:text-white hover:bg-slate-900">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-indigo-600 text-white text-sm">
                        {getInitials(user?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-200">
                      {getFirstName(user?.name || '')}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
                  <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="hover:bg-slate-800 focus:bg-slate-800 text-slate-200 focus:text-white cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="hover:bg-slate-800 focus:bg-slate-800 text-slate-200 focus:text-white cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    {t.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-red-300 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => setLocation('/login')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md shadow-indigo-600/25 h-8 px-3"
                >
                  {language === 'en' ? 'Sign In' : language === 'pt' ? 'Entrar' : 'Ingresar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
