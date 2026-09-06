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
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900">LeFriAI</h1>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    location === '/dashboard' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {t.dashboard}
                </Link>

                <Link 
                  href="/consulta" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/consulta' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.consultation}</span>
                </Link>

                <Link 
                  href="/constitucion" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/constitucion' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.navConstitution || t.constitution || "Constitución & Derechos"}</span>
                </Link>

                <Link 
                  href="/documentos" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/documentos' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.navDocuments || "Documentos"}</span>
                </Link>

                <Link 
                  href="/processes" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/processes' || location.startsWith('/processes/') 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-neutral-600 hover:text-orange-600 hover:bg-orange-50/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-orange-600" />
                  <span>{t.processes}</span>
                </Link>

                <Link 
                  href="/emergencia" 
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    location === '/emergencia' 
                      ? 'bg-red-50 text-red-700' 
                      : 'text-neutral-600 hover:text-red-600 hover:bg-red-50/50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>{t.emergency}</span>
                </Link>
              </nav>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] bg-neutral-100 border-neutral-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                      {getInitials(user?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-neutral-700">
                    {getFirstName(user?.name || '')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  {t.profile}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
