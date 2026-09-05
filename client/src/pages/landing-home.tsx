import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Scale, Shield, HeartHandshake, Sparkles, ArrowRight, CheckCircle2, 
  ExternalLink, Globe, BookOpen, Users, Lock, ChevronRight, MessageSquare, 
  Layers, Award, FileText, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export default function LandingHome() {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);

  const heroContent = {
    es: {
      tag: "INICIATIVA OFICIAL LEGALTECH — FUNDACIÓN UNDERLIFE",
      h1_main: "Democratizando el Acceso Legal",
      h1_accent: "con Inteligencia Artificial",
      sub: "LeFriApp es la plataforma de triaje y orientación jurídica gratuita que transforma el acceso a la justicia en Ecuador y Latinoamérica. Desarrollada por Fundación Underlife para brindar asistencia inmediata y fundamentada a quienes más lo necesitan.",
      ctaPrimary: "Iniciar Triaje Legal",
      ctaSecondary: "Portal de Abogados",
      stats1: "+15,000",
      stats1Label: "Orientaciones Realizadas",
      stats2: "+2,300",
      stats2Label: "Días de Impacto Social",
      stats3: "100% Gratuito",
      stats3Label: "Para Ciudadanos",
      stats4: "Fundación Underlife",
      stats4Label: "Respaldo Institucional",
      aboutTitle: "El Vínculo con Fundación Underlife",
      aboutSub: "Nacida en Milagro, Ecuador, Fundación Underlife (ONG desde 2018) impulsa programas de protección infantil, equidad social y democratización tecnológica de la justicia.",
      featuresTitle: "¿Cómo funciona LeFriApp?",
      featuresSub: "Tecnología agéntica de alta precisión orientada a la protección de tus derechos.",
      f1Title: "Triaje Legal Inmediato",
      f1Desc: "Expón tu problema en lenguaje natural. Nuestra IA analiza los hechos y tipifica el caso en segundos.",
      f2Title: "Fundamento Constitucional",
      f2Desc: "Articulación directa con el Código de Trabajo, COIP, COGEP y la Constitución de la República.",
      f3Title: "Canalización con Profesionales",
      f3Desc: "Conexión transparente con abogados verificados y defensores sociales cuando tu caso lo amerita.",
      faqTitle: "Preguntas Frecuentes (AEO & Guía)",
      q1: "¿LeFriApp reemplaza a un abogado colegiado?",
      a1: "No. LeFriApp opera como una plataforma de triaje, educación jurídica y estructuración preliminar de hechos. Brinda la claridad legal que necesitas antes de acudir a las instancias judiciales o contratar representación profesional.",
      q2: "¿Por qué el servicio es gratuito para la ciudadanía?",
      a2: "Como parte de los proyectos sociales de Fundación Underlife, creemos que el desconocimiento de las leyes no debe ser una barrera para la dignidad ni para la justicia.",
      q3: "¿Qué temas legales puedo consultar?",
      a3: "Derecho laboral (despidos, sueldos impagos), familia (pensión de alimentos, tenencia), civil (contratos, deudas, inquilinato) y orientación en materia penal de urgencia.",
      footerNote: "LeFriApp es una plataforma desarrollada bajo la visión social de Fundación Underlife.",
      officialSite: "Visitar fundacionunderlife.org",
      subdomainNote: "Servicio oficial operando en lefri.fundacionunderlife.org"
    },
    en: {
      tag: "OFFICIAL LEGALTECH INITIATIVE — UNDERLIFE FOUNDATION",
      h1_main: "Democratizing Legal Access",
      h1_accent: "with Artificial Intelligence",
      sub: "LeFriApp is the free legal triage and guidance platform transforming access to justice across Ecuador and Latin America. Built by Underlife Foundation to deliver immediate, constitutionally grounded orientation to those who need it most.",
      ctaPrimary: "Start Legal Triage",
      ctaSecondary: "Lawyer Portal",
      stats1: "+15,000",
      stats1Label: "Consultations Completed",
      stats2: "+2,300",
      stats2Label: "Days of Social Impact",
      stats3: "100% Free",
      stats3Label: "For Citizens",
      stats4: "Underlife Foundation",
      stats4Label: "Institutional Backing",
      aboutTitle: "Our Foundation & Roots",
      aboutSub: "Founded in Milagro, Ecuador, Underlife Foundation (NGO since 2018) leads community programs in child protection, social equity, and technological access to justice.",
      featuresTitle: "How LeFriApp Works",
      featuresSub: "High-precision agentic technology dedicated to protecting citizen rights.",
      f1Title: "Immediate Legal Triage",
      f1Desc: "State your situation in plain words. Our AI parses the facts and identifies legal grounds in seconds.",
      f2Title: "Constitutional Grounding",
      f2Desc: "Direct citation and reference to Labor Codes, Criminal, Civil procedures and National Constitutions.",
      f3Title: "Professional Referrals",
      f3Desc: "Seamless matching with verified attorneys and pro-bono advocates when your case demands court filing.",
      faqTitle: "Frequently Asked Questions",
      q1: "Does LeFriApp replace a licensed attorney?",
      a1: "No. LeFriApp serves strictly as an intake triage, legal education, and case structuring system. It equips citizens with essential facts and laws before formal representation.",
      q2: "Why is this service free for citizens?",
      a2: "As part of Underlife Foundation's social mission, legal lack of information must never prevent people from defending their basic human rights.",
      q3: "Which legal fields can I explore?",
      a3: "Labor law (wrongful dismissal, unpaid wages), family law (child support, custody), contracts, tenant law, and emergency criminal orientation.",
      footerNote: "LeFriApp is operated under the social mission of Underlife Foundation.",
      officialSite: "Visit fundacionunderlife.org",
      subdomainNote: "Official service running on lefri.fundacionunderlife.org"
    },
    pt: {
      tag: "INICIATIVA OFICIAL LEGALTECH — FUNDAÇÃO UNDERLIFE",
      h1_main: "Democratizando o Acesso Jurídico",
      h1_accent: "com Inteligência Artificial",
      sub: "LeFriApp é a plataforma gratuita de triagem e orientação jurídica que transforma o acesso à justiça no Equador e América Latina. Desenvolvida pela Fundação Underlife para fornecer assistência imediata e fundamentada na lei a quem mais precisa.",
      ctaPrimary: "Iniciar Triagem Jurídica",
      ctaSecondary: "Portal de Advogados",
      stats1: "+15.000",
      stats1Label: "Orientações Realizadas",
      stats2: "+2.300",
      stats2Label: "Dias de Impacto Social",
      stats3: "100% Gratuito",
      stats3Label: "Para Cidadãos",
      stats4: "Fundação Underlife",
      stats4Label: "Apoio Institucional",
      aboutTitle: "Nosso Vínculo com a Fundação Underlife",
      aboutSub: "Nascida no Equador, a Fundação Underlife (ONG desde 2018) lidera projetos de proteção infantil, equidade comunitária e democratização tecnológica da justiça.",
      featuresTitle: "Como Funciona o LeFriApp?",
      featuresSub: "Tecnologia agêntica de alta precisão dedicada à salvaguarda de direitos.",
      f1Title: "Triagem Jurídica Imediata",
      f1Desc: "Descreva sua situação em linguagem simples. Nossa IA analisa os fatos e identifica enquadramentos legais em segundos.",
      f2Title: "Fundamentação Constitucional",
      f2Desc: "Articulação direta com leis trabalhistas, códigos civis, penais e normas constitucionais.",
      f3Title: "Conexão com Especialistas",
      f3Desc: "Encaminhamento seguro para advogados verificados e apoio comunitário quando seu caso exige ação judicial.",
      faqTitle: "Perguntas Frequentes (FAQ)",
      q1: "O LeFriApp substitui um advogado constituído?",
      a1: "Não. O LeFriApp atua estritamente como um sistema de triagem, conscientização jurídica e estruturação de fatos antes da representação forense.",
      q2: "Por que a plataforma é gratuita?",
      a2: "Como parte das iniciativas sociais da Fundação Underlife, acreditamos que a falta de informação jurídica não deve ser uma barreira à dignidade e à justiça.",
      q3: "Quais áreas do direito posso consultar?",
      a3: "Direito do trabalho (demissões, salários atrasados), família (pensão alimentícia, guarda), contratos, locação e orientações de emergência.",
      footerNote: "LeFriApp é uma iniciativa oficial vinculada à Fundação Underlife.",
      officialSite: "Acessar fundacionunderlife.org",
      subdomainNote: "Serviço oficial operando em lefri.fundacionunderlife.org"
    }
  };

  const c = heroContent[language as 'es' | 'en' | 'pt'] || heroContent.es;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Top Brand & Language Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">LeFriApp</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-indigo-500/40 text-indigo-400 bg-indigo-500/10">
                  LegalTech
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                lefri.fundacionunderlife.org
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button 
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded transition-all font-medium ${language === 'es' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                ES
              </button>
              <button 
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-all font-medium ${language === 'en' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                type="button"
                onClick={() => setLanguage('pt')}
                className={`px-2 py-1 rounded transition-all font-medium ${language === 'pt' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                PT
              </button>
            </div>

            <Button 
              variant="default"
              size="sm"
              onClick={() => setLocation('/login')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/25"
            >
              {language === 'en' ? 'Access Platform' : language === 'pt' ? 'Acessar Plataforma' : 'Acceder al Portal'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/60">
        {/* Subtle radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{c.tag}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            {c.h1_main} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
              {c.h1_accent}
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            {c.sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Button
              size="lg"
              onClick={() => setLocation('/login?mode=register')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 text-base transition-all hover:scale-[1.02]"
            >
              <span>{c.ctaPrimary}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/login')}
              className="w-full sm:w-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium px-6 py-6 rounded-xl text-base"
            >
              <span>{c.ctaSecondary}</span>
            </Button>
          </div>

          {/* Social Proof & Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-800/80 max-w-5xl mx-auto text-left">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{c.stats1}</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">{c.stats1Label}</div>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-400 font-mono">{c.stats2}</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">{c.stats2Label}</div>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-bold text-teal-400 font-mono">{c.stats3}</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">{c.stats3Label}</div>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-base sm:text-lg font-bold text-white truncate">{c.stats4}</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">{c.stats4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Underlife Foundation Institutional Card */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-2xl border border-indigo-500/20 p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <HeartHandshake className="w-4 h-4" />
                <span>Ecosistema Solidario</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {c.aboutTitle}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                {c.aboutSub}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>ONG Registrada Ecuador</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Subdominio lefri.fundacionunderlife.org</span>
                </span>
                <a 
                  href="https://fundacionunderlife.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 underline font-sans text-xs ml-auto"
                >
                  <span>{c.officialSite}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Methodology Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            {c.featuresTitle}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {c.featuresSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.f1Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{c.f1Desc}</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.f2Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{c.f2Desc}</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.f3Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{c.f3Desc}</p>
          </div>
        </div>
      </section>

      {/* FAQ Structured Section for SEO / AEO / GEO */}
      <section className="py-16 bg-slate-900/40 border-t border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {c.faqTitle}
            </h2>
            <p className="text-slate-400 text-sm">
              Respuestas directas y claras preparadas para motores generativos de búsqueda.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-start space-x-2">
                <span className="text-indigo-400">Q:</span>
                <span>{c.q1}</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed pl-6">
                {c.a1}
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-start space-x-2">
                <span className="text-indigo-400">Q:</span>
                <span>{c.q2}</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed pl-6">
                {c.a2}
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-start space-x-2">
                <span className="text-indigo-400">Q:</span>
                <span>{c.q3}</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed pl-6">
                {c.a3}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">LeFriApp</p>
              <p className="text-xs text-slate-400">{c.subdomainNote}</p>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-slate-400 space-y-1">
            <p>{c.footerNote}</p>
            <p className="text-slate-400">
              Fundación Underlife &copy; 2018 - 2026. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
