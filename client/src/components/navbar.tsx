import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';
import { Scale, ChevronDown, User, Settings, LogOut, Moon, Sun, Globe, BookOpen, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  const queryClient = useQueryClient();

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
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-600/30">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">LeFriApp</h1>
            </Link>

            {user && (
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
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Menu */}
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
          </div>
        </div>
      </div>
    </header>
  );
}
