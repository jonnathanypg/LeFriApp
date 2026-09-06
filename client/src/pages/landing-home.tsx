import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  BookOpen, ShieldCheck, HeartHandshake, Sparkles, ArrowRight, CheckCircle2, 
  Globe, Users, Lock, ChevronRight, MessageSquare, 
  Layers, Lightbulb, Compass, Search
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
      tag: "CONOCE TUS DERECHOS — COMPRENSIÓN CIUDADANA",
      h1_main: "Entiende la Constitución",
      h1_accent: "de forma fácil, clara y humana",
      sub: "La principal razón por la que se vulneran nuestros derechos es no conocerlos. LeFriApp traduce cada artículo constitucional a un lenguaje sencillo para que comprendas qué te ampara en tu día a día.",
      ctaPrimary: "Conocer mis Derechos",
      ctaSecondary: "Explorar la Constitución",
      stats1: "100%",
      stats1Label: "Lenguaje Ciudadano",
      stats2: "+400",
      stats2Label: "Artículos Explicados",
      stats3: "Gratuito",
      stats3Label: "Para Todas las Personas",
      stats4: "Paso a Paso",
      stats4Label: "Guías Comprensibles",
      whyTitle: "¿Por qué creamos LeFriApp?",
      whySub: "Las leyes y la Constitución son de todos, pero el lenguaje técnico y enredado las ha alejado de quienes más las necesitan. Saber cuáles son tus derechos es el primer paso para evitar que sean vulnerados.",
      featuresTitle: "¿Cómo te ayuda LeFriApp?",
      featuresSub: "Herramientas diseñadas para que cualquier persona, sin importar su formación, entienda sus derechos en minutos.",
      f1Title: "Sin Tecnicismos Jurídicos",
      f1Desc: "Escribe tu duda en tus propias palabras. La plataforma te explica de manera directa qué principios y derechos te protegen.",
      f2Title: "La Constitución Explicada",
      f2Desc: "Desglosamos artículo por artículo con ejemplos de la vida real: trabajo, salud, familia, vivienda y libertad.",
      f3Title: "Respuestas Preventivas",
      f3Desc: "Aprende qué hacer antes de que una injusticia ocurra, conociendo con claridad qué límites tienen las autoridades y empleadores.",
      faqTitle: "Preguntas Frecuentes",
      q1: "¿Por qué es importante conocer la Constitución?",
      a1: "Porque la Constitución es la norma suprema que garantiza tu dignidad, tu trabajo, tu intimidad y tu familia. Cuando desconoces lo que dice, es más fácil que alguien abuse de esa falta de información.",
      q2: "¿Necesito tener conocimientos de derecho para usar la plataforma?",
      a2: "En lo absoluto. Toda la plataforma está pensada para el ciudadano común. Eliminamos la jerga compleja y usamos analogías y explicaciones cotidianas.",
      q3: "¿Tiene algún costo consultar la Constitución y mis derechos?",
      a3: "No. El acceso a la educación cívica y al entendimiento de la Constitución es y será siempre libre y gratuito para todas las personas.",
      footerNote: "Plataforma ciudadana para el aprendizaje y comprensión de los derechos humanos y constitucionales.",
      footerRights: "Todos los derechos reservados."
    },
    en: {
      tag: "KNOW YOUR RIGHTS — CITIZEN EMPOWERMENT",
      h1_main: "Understand the Constitution",
      h1_accent: "in simple, clear, and human terms",
      sub: "The primary reason our rights are violated is not knowing them. LeFriApp breaks down constitutional articles into everyday language so you always know what protects you in daily life.",
      ctaPrimary: "Learn My Rights",
      ctaSecondary: "Explore Constitution",
      stats1: "100%",
      stats1Label: "Plain Language",
      stats2: "+400",
      stats2Label: "Articles Explained",
      stats3: "Free",
      stats3Label: "For Everyone",
      stats4: "Step by Step",
      stats4Label: "Easy-to-follow Guides",
      whyTitle: "Why did we build LeFriApp?",
      whySub: "The laws and the Constitution belong to everyone, but complex legal terminology has kept them out of reach. Knowing your rights is the first and most essential step to defend them.",
      featuresTitle: "How LeFriApp Helps You",
      featuresSub: "Tools designed so anyone can understand their fundamental rights in minutes, regardless of background.",
      f1Title: "No Legal Jargon",
      f1Desc: "Ask in your everyday words. The platform explains clearly what constitutional principles protect you.",
      f2Title: "Constitutions Explained",
      f2Desc: "We break down article by article with real-life examples: labor, healthcare, family, housing, and liberty.",
      f3Title: "Preventive Awareness",
      f3Desc: "Learn what steps to take before injustices occur, understanding clearly what authorities and employers cannot do.",
      faqTitle: "Frequently Asked Questions",
      q1: "Why is it important to know the Constitution?",
      a1: "Because the Constitution is the supreme foundation that guarantees your dignity, work, privacy, and family. When you don't know what it contains, rights are vulnerable to being overlooked.",
      q2: "Do I need legal knowledge to use this platform?",
      a2: "Not at all. The entire platform is built for everyday citizens. We eliminate legalistic vocabulary and deliver friendly, straightforward explanations.",
      q3: "Does it cost anything to use?",
      a3: "No. Access to constitutional literacy and understanding your fundamental rights is completely free for everyone.",
      footerNote: "Citizen platform for learning and understanding human and constitutional rights.",
      footerRights: "All rights reserved."
    },
    pt: {
      tag: "CONHEÇA SEUS DIREITOS — EMPODERAMENTO CIDADÃO",
      h1_main: "Entenda a Constituição",
      h1_accent: "de forma simples, clara e humana",
      sub: "A principal razão pela qual nossos direitos são violados é não conhecê-los. O LeFriApp traduz cada artigo constitucional em linguagem acessível para que você compreenda o que o protege no dia a dia.",
      ctaPrimary: "Conhecer Meus Direitos",
      ctaSecondary: "Explorar a Constituição",
      stats1: "100%",
      stats1Label: "Linguagem Cidadã",
      stats2: "+400",
      stats2Label: "Artigos Explicados",
      stats3: "Gratuito",
      stats3Label: "Para Todos",
      stats4: "Passo a Passo",
      stats4Label: "Guias Claros",
      whyTitle: "Por que criamos o LeFriApp?",
      whySub: "As leis e a Constituição pertencem a todos, mas a linguagem jurídica técnica as afastou de quem mais precisa. Conhecer seus direitos é o primeiro passo para não permitir que sejam violados.",
      featuresTitle: "Como o LeFriApp Ajuda Você",
      featuresSub: "Ferramentas pensadas para que qualquer pessoa compreenda seus direitos em minutos.",
      f1Title: "Sem Termos Complicados",
      f1Desc: "Descreva sua dúvida com suas próprias palavras. A plataforma explica diretamente o que a lei garante.",
      f2Title: "Constituição Explicada",
      f2Desc: "Artigo por artigo explicado com exemplos do cotidiano: trabalho, saúde, família, moradia e liberdade.",
      f3Title: "Orientação Preventiva",
      f3Desc: "Saiba o que fazer antes de sofrer uma injustiça, conhecendo com clareza os limites de autoridades e empregadores.",
      faqTitle: "Perguntas Frequentes",
      q1: "Por que é importante conhecer a Constituição?",
      a1: "Porque a Constituição é a norma máxima que protege sua dignidade, trabalho e família. Desconhecer seus direitos facilita que sejam desrespeitados.",
      q2: "Preciso entender de leis para usar?",
      a2: "De forma alguma. Toda a plataforma foi criada para o cidadão comum, traduzindo termos difíceis em explicações práticas.",
      q3: "Tem algum custo?",
      a3: "Não. O acesso à educação cidadã e ao entendimento da Constituição é totalmente livre e gratuito.",
      footerNote: "Plataforma cidadã para aprendizagem e compreensão dos direitos fundamentais.",
      footerRights: "Todos os direitos reservados."
    }
  };

  const c = heroContent[language as 'es' | 'en' | 'pt'] || heroContent.es;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Top Brand & Language Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">LeFriApp</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-teal-500/40 text-teal-300 bg-teal-500/10">
                  Constitución y Derechos
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Educación cívica y comprensión de derechos fundamentales
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
              {language === 'en' ? 'Sign In' : language === 'pt' ? 'Entrar' : 'Ingresar'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/60">
        {/* Subtle radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-medium tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{c.tag}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            {c.h1_main} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
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
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 text-base transition-all hover:scale-[1.02]"
            >
              <span>{c.ctaPrimary}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/login')}
              className="w-full sm:w-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium px-6 py-6 rounded-xl text-base flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4 text-teal-400" />
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

      {/* Purpose / Philosophy Card */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 rounded-2xl border border-teal-500/20 p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Compass className="w-4 h-4" />
                <span>Nuestra Misión</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {c.whyTitle}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                {c.whySub}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-slate-300">
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Sin costo para el usuario</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Enfocado en prevención y dignidad</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Basado en la Carta Magna</span>
                </span>
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
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.f1Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{c.f1Desc}</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.f2Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{c.f2Desc}</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.f3Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{c.f3Desc}</p>
          </div>
        </div>
      </section>

      {/* FAQ Structured Section */}
      <section className="py-16 bg-slate-900/40 border-t border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {c.faqTitle}
            </h2>
            <p className="text-slate-400 text-sm">
              Conocer tus derechos es el primer paso para vivirlos con tranquilidad.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-start space-x-2">
                <span className="text-teal-400">Q:</span>
                <span>{c.q1}</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed pl-6">
                {c.a1}
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-start space-x-2">
                <span className="text-teal-400">Q:</span>
                <span>{c.q2}</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed pl-6">
                {c.a2}
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-start space-x-2">
                <span className="text-teal-400">Q:</span>
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
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">LeFriApp</p>
              <p className="text-xs text-slate-400">{c.footerNote}</p>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-slate-400 space-y-1">
            <p>LeFriApp &copy; 2026. {c.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
