import { useState } from 'react';
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/navbar';
import { StreamingChatInterface } from '@/components/streaming-chat-interface';
import { LegalIntakeWizard } from '@/components/legal-intake-wizard';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export default function Consulta() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'EC');
  const [mode, setMode] = useState<'wizard' | 'chat'>('wizard');

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

  const allCountries = [
    { value: 'EC', label: `🇪🇨 ${t.countries?.EC || 'Ecuador'}` },
    { value: 'BR', label: `🇧🇷 ${t.countries?.BR || 'Brasil'}` },
    { value: 'CO', label: `🇨🇴 ${t.countries?.CO || 'Colombia'}` },
    { value: 'PE', label: `🇵🇪 ${t.countries?.PE || 'Perú'}` },
    { value: 'US', label: `🇺🇸 ${t.countries?.US || 'Estados Unidos'}` },
    { value: 'MX', label: `🇲🇽 ${t.countries?.MX || 'México'}` },
  ];

  const countries = isI18nActive ? allCountries : allCountries.filter(c => c.value === 'EC');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/dashboard')}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  {t.consultation || "Orientación Jurídica Inmediata"}
                </h1>
                <p className="text-xs text-slate-400">Triaje legal agéntico fundamentado en normas constitucionales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mode Toggle Buttons */}
              <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('wizard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'wizard'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Wizard Guiado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('chat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'chat'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat Libre</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[150px] bg-slate-900 border-slate-800 text-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mode Rendering */}
          {mode === 'wizard' ? (
            <LegalIntakeWizard onComplete={(_data) => setLocation('/processes')} />
          ) : (
            <div className="w-full">
              <StreamingChatInterface country={selectedCountry} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
