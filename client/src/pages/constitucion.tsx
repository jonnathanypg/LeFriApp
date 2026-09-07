import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';
import { 
  BookOpen, Search, Sparkles, Scale, ShieldCheck, HelpCircle, 
  ArrowRight, CheckCircle2, Globe, HeartHandshake, Volume2, Mic
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Render inline formatting (bold, italic, clean markdown artifacts)
  const renderInline = (text: string) => {
    if (!text) return null;
    
    // Split by bold (**bold**) or italic (*italic*)
    const tokens: React.ReactNode[] = [];
    // Match **bold** or *italic*
    const regex = /(\*\*.*?\*\*|\*[^*]+?\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        tokens.push(
          <strong key={match.index} className="font-semibold text-slate-100">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        tokens.push(
          <em key={match.index} className="italic text-slate-200">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens;
  };

  // Pre-process raw text:
  // 1. If lines consist solely of a digit "1", "2" followed by next line, combine them.
  const rawLines = content.split('\n');
  const normalizedLines: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (/^\d+$/.test(line) && i + 1 < rawLines.length) {
      // It's a dangling number e.g. "1" followed by "Situación laboral: ..."
      normalizedLines.push(`${line}. ${rawLines[i + 1].trim()}`);
      i++;
    } else {
      normalizedLines.push(line);
    }
  }

  // Group into structured sections/cards
  type Section = {
    type: 'header' | 'section' | 'paragraph';
    title?: string;
    icon?: string;
    items: string[];
    theme: 'indigo' | 'emerald' | 'amber' | 'neutral' | 'title';
  };

  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const line of normalizedLines) {
    if (!line) continue;

    // Check for main title (# Title)
    if (/^#\s+/.test(line)) {
      if (currentSection) sections.push(currentSection);
      currentSection = null;
      sections.push({
        type: 'header',
        title: line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim(),
        items: [],
        theme: 'title'
      });
      continue;
    }

    // Check for section headers (### 🎯 ... or ## 🛡️ ... or 🎯 **...** or ### Title)
    const headerWithEmoji = line.match(/^(?:#{1,4}\s*)?(?:(\d+\.\s*)?([🎯🛡️⚖️📌💡🏛️])\s*)?(?:\*\*)?([^:*]+?)(?:\*\*)?:?\s*(.*)$/);
    const hasEmoji = /[🎯🛡️⚖️📌💡🏛️]/.test(line);
    const isHeading = /^#{2,4}\s+/.test(line);

    if (hasEmoji || (isHeading && !/^\d+\./.test(line))) {
      if (currentSection) sections.push(currentSection);

      let icon = '';
      if (line.includes('🎯')) icon = '🎯';
      else if (line.includes('🛡️')) icon = '🛡️';
      else if (line.includes('⚖️')) icon = '⚖️';
      else if (line.includes('📌')) icon = '📌';
      else if (line.includes('💡')) icon = '💡';
      else if (line.includes('🏛️')) icon = '🏛️';

      // Clean header text
      let title = line
        .replace(/^#{1,4}\s*/, '')
        .replace(/[🎯🛡️⚖️📌💡🏛️]/g, '')
        .replace(/\*\*/g, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/^[:\s\-]+/, '')
        .replace(/[:\s]+$/, '')
        .trim();

      const theme = icon === '🎯' ? 'indigo' : icon === '🛡️' ? 'emerald' : icon === '⚖️' ? 'amber' : 'neutral';

      currentSection = {
        type: 'section',
        icon,
        title,
        items: [],
        theme
      };
      continue;
    }

    // If no current section, check if it's a callout or standard paragraph
    if (!currentSection) {
      if (/^(?:Recuerda|Nota|Importante|En conclusión)/i.test(line)) {
        sections.push({
          type: 'paragraph',
          icon: '💡',
          title: 'Recordatorio Ciudadano',
          items: [line],
          theme: 'neutral'
        });
      } else {
        currentSection = {
          type: 'paragraph',
          items: [line],
          theme: 'neutral'
        };
      }
    } else {
      // Check if this line is an end note (e.g. "Recuerda, el derecho al debido proceso...")
      if (/^(?:Recuerda|Nota|Importante|En conclusión)/i.test(line) && currentSection.items.length > 0) {
        sections.push(currentSection);
        currentSection = null;
        sections.push({
          type: 'paragraph',
          icon: '💡',
          title: 'Recordatorio Ciudadano',
          items: [line],
          theme: 'neutral'
        });
      } else {
        currentSection.items.push(line);
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, secIdx) => {
        // Main title banner
        if (sec.type === 'header') {
          return (
            <div key={secIdx} className="pb-2 border-b border-slate-800">
              <h2 className="text-base sm:text-lg font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {sec.title}
              </h2>
            </div>
          );
        }

        const borderClass = 
          sec.theme === 'indigo' ? 'bg-indigo-950/20 border-indigo-500/25' :
          sec.theme === 'emerald' ? 'bg-emerald-950/20 border-emerald-500/25' :
          sec.theme === 'amber' ? 'bg-amber-950/20 border-amber-500/25' :
          'bg-slate-900/60 border-slate-800';

        const titleClass =
          sec.theme === 'indigo' ? 'text-indigo-200' :
          sec.theme === 'emerald' ? 'text-emerald-200' :
          sec.theme === 'amber' ? 'text-amber-200' :
          'text-slate-200';

        return (
          <div key={secIdx} className={`p-4 rounded-xl border ${borderClass} space-y-2.5 transition-all`}>
            {sec.title && (
              <div className="flex items-center gap-2 pb-1 border-b border-slate-800/40">
                {sec.icon && <span className="text-base flex-shrink-0">{sec.icon}</span>}
                <h3 className={`text-sm font-semibold tracking-wide ${titleClass}`}>
                  {sec.title}
                </h3>
              </div>
            )}

            <div className="space-y-2">
              {sec.items.map((item, itemIdx) => {
                // Numbered item e.g. "1. **Title**: content" or "1. content"
                const numMatch = item.match(/^(\d+)\.?\s*(.*)$/);
                if (numMatch && (numMatch[2].includes(':') || /^[A-ZÁÉÍÓÚ]/.test(numMatch[2]))) {
                  const num = numMatch[1];
                  const rawContent = numMatch[2];
                  return (
                    <div key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed pl-0.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800/90 text-indigo-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-700">
                        {num}
                      </span>
                      <div className="flex-1">
                        {renderInline(rawContent)}
                      </div>
                    </div>
                  );
                }

                // Bullet item e.g. "- content" or "* content"
                const bulletMatch = item.match(/^[\-\*•]\s+(.*)$/);
                if (bulletMatch) {
                  return (
                    <div key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        {renderInline(bulletMatch[1])}
                      </div>
                    </div>
                  );
                }

                // Standard paragraph
                return (
                  <p key={itemIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {renderInline(item)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ConstitucionPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'EC');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('debido proceso');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

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
    { value: 'MX', label: `🇲🇽 ${t.countries?.MX || 'México'}` },
    { value: 'CL', label: `🇨🇱 ${t.countries?.CL || 'Chile'}` },
    { value: 'AR', label: `🇦🇷 ${t.countries?.AR || 'Argentina'}` },
    { value: 'US', label: `🇺🇸 ${t.countries?.US || 'Estados Unidos'}` },
    { value: 'ES', label: `🇪🇸 ${t.countries?.ES || 'España'}` },
  ];

  // If internationalization is disabled, limit exclusively to Ecuador
  const countries = isI18nActive ? allCountries : allCountries.filter(c => c.value === 'EC');

  const { data: exploreData, isLoading } = useQuery({
    queryKey: ['/api/citizen/constitution/explore', selectedCountry, activeSearch],
    queryFn: async () => {
      const res = await fetch(`/api/citizen/constitution/explore?country=${selectedCountry}&q=${encodeURIComponent(activeSearch)}`);
      if (!res.ok) throw new Error('Error al cargar artículos constitucionales');
      return await res.json();
    }
  });

  const explainMutation = useMutation({
    mutationFn: async (articleText: string) => {
      const res = await fetch('/api/citizen/constitution/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleText,
          country: selectedCountry,
          language: language || user?.language || 'es'
        })
      });
      if (!res.ok) throw new Error('Error al explicar artículo');
      return await res.json();
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
    },
    onError: () => {
      toast({
        title: t.error || "Error",
        description: "No se pudo generar la explicación ciudadana.",
        variant: "destructive"
      });
    }
  });

  const handleExplainArticle = (article: any) => {
    setSelectedArticle(article);
    setExplanation(null);
    explainMutation.mutate(article.content);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveSearch(searchQuery.trim());
    setSelectedArticle(null);
    setExplanation(null);
  };

  const topicSuggestions = [
    { label: t.topicDueProcess || '⚖️ Debido proceso', query: 'debido proceso' },
    { label: t.topicLabor || '💼 Derecho al trabajo', query: 'trabajo' },
    { label: t.topicHealth || '🏥 Salud y seguridad', query: 'salud' },
    { label: t.topicEquality || '🤝 Igualdad y no discriminación', query: 'igualdad' },
    { label: t.topicFreedom || '🕊️ Libertad y garantías', query: 'libertad' },
    { label: t.topicHousing || '🏠 Vivienda y hábitat', query: 'vivienda' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                {t.constitutionTitle || "Ruta de la Constitución & Derechos"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              {t.constitutionSubtitle || "Explorador pedagógico de normas constitucionales y garantías ciudadanas conectado a ConstituteProject API."}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={selectedCountry} onValueChange={(val) => {
              setSelectedCountry(val);
              setSelectedArticle(null);
              setExplanation(null);
            }}>
              <SelectTrigger className="w-[170px] bg-slate-900 border-slate-800 text-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Search & Topic suggestions */}
        <div className="space-y-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.constitutionSearchPlaceholder || "Busca por tema (ej: debido proceso, libertad de expresión, derecho al trabajo, salud)..."}
                className="pl-10 bg-slate-900 border-slate-800 text-slate-100 rounded-xl placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5">
              {t.constitutionSearchButton || t.search || "Buscar"}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 py-1 font-medium">{t.frequentTopics || "Temas frecuentes:"}</span>
            {topicSuggestions.map((topic) => (
              <button
                key={topic.query}
                type="button"
                onClick={() => {
                  setSearchQuery(topic.query);
                  setActiveSearch(topic.query);
                  setSelectedArticle(null);
                  setExplanation(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition font-medium flex items-center gap-1 cursor-pointer"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Articles List */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {t.articlesFound || "Artículos & Disposiciones Halladas"} ({exploreData?.articles?.length || 0})
            </h2>

            {isLoading ? (
              <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">{t.loadingConstitute || "Consultando ConstituteProject API..."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exploreData?.articles?.map((art: any) => {
                  const isSelected = selectedArticle?.id === art.id;
                  return (
                    <Card
                      key={art.id}
                      onClick={() => handleExplainArticle(art)}
                      className={`cursor-pointer transition border rounded-2xl text-left ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[11px]">
                            {art.title}
                          </Badge>
                          <span className="text-[10px] text-slate-500 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                            {t.clickToExplain || "Clic para Explicar"}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xs text-slate-300 line-clamp-3 italic">
                          "{art.content}"
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: AI Citizen Explanation Studio */}
          <div className="lg:col-span-6">
            <div className="sticky top-20">
              <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                <CardHeader className="p-5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>{t.citizenExplanationStudio || "Explicación Ciudadana Inteligente"}</span>
                    </CardTitle>
                    {selectedArticle && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {t.inPlainLanguage || "En Lenguaje Claro"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    {t.explanationSubtitle || "Traducción directa de normas técnicas a derechos prácticos y cotidianos."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5">
                  {!selectedArticle ? (
                    <div className="py-16 text-center space-y-3">
                      <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-medium text-slate-300">{t.selectAnArticle || "Selecciona un artículo constitucional"}</p>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        {t.selectAnArticleDesc || "Haz clic en cualquiera de las disposiciones a la izquierda para traducirla a un formato pedagógico y saber cómo te protege."}
                      </p>
                    </div>
                  ) : explainMutation.isPending ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-medium text-slate-200">{t.generatingExplanation || "Generando explicación ciudadana..."}</p>
                      <p className="text-xs text-slate-500">{t.generatingExplanationDesc || "Desglosando principios y aplicaciones prácticas sin tecnicismos."}</p>
                    </div>
                  ) : explanation ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                        <strong className="text-slate-300 block mb-1">{t.originalTextConsulted || "Texto original consultado:"}</strong>
                        <p className="italic">"{selectedArticle.content}"</p>
                      </div>

                      <MarkdownRenderer content={explanation} />

                      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[11px] text-slate-500">
                          {t.legalBasisConstitution || "Fundamento: Constitución Política"} ({t.countries?.[selectedCountry] || selectedCountry})
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            navigator.clipboard.writeText(explanation);
                            toast({ title: t.docCopied || "Copiado", description: t.explanationCopied || "Explicación copiada al portapapeles" });
                          }}
                          className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          {t.copyExplanation || "Copiar Explicación"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
