import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/hooks/use-auth';
import { 
  BookOpen, Search, Sparkles, Scale, ShieldCheck, HelpCircle, 
  ArrowRight, CheckCircle2, Globe, HeartHandshake, Volume2, Mic
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ConstitucionPage() {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'EC');
  const [searchQuery, setSearchQuery] = useState('derechos fundamentales debido proceso');
  const [activeSearch, setActiveSearch] = useState('derechos fundamentales debido proceso');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const countries = [
    { value: 'EC', label: '🇪🇨 Ecuador' },
    { value: 'CO', label: '🇨🇴 Colombia' },
    { value: 'PE', label: '🇵🇪 Perú' },
    { value: 'MX', label: '🇲🇽 México' },
    { value: 'CL', label: '🇨🇱 Chile' },
    { value: 'AR', label: '🇦🇷 Argentina' },
    { value: 'US', label: '🇺🇸 Estados Unidos' },
    { value: 'ES', label: '🇪🇸 España' },
  ];

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
          language: user?.language || 'es'
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
        title: "Error",
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
                Ruta de la Constitución & Derechos
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Explorador pedagógico de normas constitucionales y garantías ciudadanas conectado a ConstituteProject API.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={selectedCountry} onValueChange={(val) => {
              setSelectedCountry(val);
              setSelectedArticle(null);
              setExplanation(null);
            }}>
              <SelectTrigger className="w-[160px] bg-slate-900 border-slate-800 text-slate-200 text-xs">
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
                placeholder="Busca por tema (ej: debido proceso, libertad de expresión, derecho al trabajo, salud)..."
                className="pl-10 bg-slate-900 border-slate-800 text-slate-100 rounded-xl placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5">
              Buscar
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 py-1 font-medium">Temas frecuentes:</span>
            {[
              { label: '⚖️ Debido proceso', query: 'debido proceso' },
              { label: '💼 Derecho al trabajo', query: 'trabajo' },
              { label: '🏥 Salud y seguridad', query: 'salud' },
              { label: '🤝 Igualdad y no discriminación', query: 'igualdad' },
              { label: '🕊️ Libertad y garantías', query: 'libertad' },
              { label: '🏠 Vivienda y hábitat', query: 'vivienda' }
            ].map((topic) => (
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
              Artículos & Disposiciones Halladas ({exploreData?.articles?.length || 0})
            </h2>

            {isLoading ? (
              <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Consultando ConstituteProject API...</p>
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
                            Clic para Explicar
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
                      <span>Explicación Ciudadana Inteligente</span>
                    </CardTitle>
                    {selectedArticle && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        En Lenguaje Claro
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    Traducción directa de normas técnicas a derechos prácticos y cotidianos.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5">
                  {!selectedArticle ? (
                    <div className="py-16 text-center space-y-3">
                      <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-medium text-slate-300">Selecciona un artículo constitucional</p>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Haz clic en cualquiera de las disposiciones a la izquierda para traducirla a un formato pedagógico y saber cómo te protege.
                      </p>
                    </div>
                  ) : explainMutation.isPending ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-medium text-slate-200">Generando explicación ciudadana...</p>
                      <p className="text-xs text-slate-500">Desglosando principios y aplicaciones prácticas sin tecnicismos.</p>
                    </div>
                  ) : explanation ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                        <strong className="text-slate-300 block mb-1">Texto original consultado:</strong>
                        <p className="italic">"{selectedArticle.content}"</p>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap">
                        {explanation}
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[11px] text-slate-500">Fundamento: Constitución Política ({selectedCountry})</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            navigator.clipboard.writeText(explanation);
                            toast({ title: "Copiado", description: "Explicación copiada al portapapeles" });
                          }}
                          className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Copiar Explicación
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
