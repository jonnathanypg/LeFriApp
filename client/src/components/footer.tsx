import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { language } = useLanguage();

  const labels = {
    es: {
      brand: "LeFriApp • Fundación Underlife",
      mission: "Plataforma cívica para el acceso a la justicia y alfabetización constitucional.",
      privacy: "Privacidad (LOPDP / RGPD)",
      terms: "Términos de Servicio",
      cookies: "Política de Cookies",
      rights: "LeFriApp © 2026. Todos los derechos reservados.",
      security: "Privacidad blindada y cifrado TLS / AES-256",
    },
    en: {
      brand: "LeFriApp • Fundación Underlife",
      mission: "Civic platform for justice empowerment and constitutional literacy.",
      privacy: "Privacy Policy (LOPDP / GDPR)",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      rights: "LeFriApp © 2026. All rights reserved.",
      security: "Hardened privacy & TLS / AES-256 encryption",
    },
    pt: {
      brand: "LeFriApp • Fundación Underlife",
      mission: "Plataforma cívica para acesso à justiça e conscientização constitucional.",
      privacy: "Privacidade (LOPDP / RGPD)",
      terms: "Termos de Serviço",
      cookies: "Política de Cookies",
      rights: "LeFriApp © 2026. Todos os direitos reservados.",
      security: "Privacidade blindada e criptografia TLS / AES-256",
    }
  };

  const t = labels[language as 'es' | 'en' | 'pt'] || labels.es;

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Mission (Clean text without icon) */}
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold text-white tracking-wide">
              {t.brand}
            </p>
            <p className="text-[11px] text-slate-400">
              {t.mission}
            </p>
          </div>

          {/* Legal Navigation Links - Single horizontal row on desktop & tablet */}
          <nav className="flex flex-nowrap items-center justify-center gap-x-2 sm:gap-x-3 text-[10.5px] sm:text-xs text-slate-400 whitespace-nowrap overflow-x-auto py-1">
            <Link 
              href="/privacidad" 
              className="text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2 hover:underline-offset-4"
            >
              {t.privacy}
            </Link>
            <span className="text-slate-600 select-none">&bull;</span>
            <Link 
              href="/terminos" 
              className="text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2 hover:underline-offset-4"
            >
              {t.terms}
            </Link>
            <span className="text-slate-600 select-none">&bull;</span>
            <Link 
              href="/cookies" 
              className="text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2 hover:underline-offset-4"
            >
              {t.cookies}
            </Link>
          </nav>

          {/* Copyright & Security */}
          <div className="text-center md:text-right text-[10px] sm:text-[11px] text-slate-400 space-y-0.5 flex-shrink-0">
            <p>{t.rights}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center md:justify-end gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>{t.security}</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
