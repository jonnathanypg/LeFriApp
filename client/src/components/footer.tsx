import React from 'react';
import { Scale, Shield, Heart } from 'lucide-react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Mission */}
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-wide">
                LeFriApp &bull; Fundación Underlife
              </p>
              <p className="text-[11px] text-slate-400">
                Plataforma cívica para el acceso a la justicia y alfabetización constitucional.
              </p>
            </div>
          </div>

          {/* Legal Navigation Links - Single horizontal row on desktop & tablet */}
          <nav className="flex flex-nowrap items-center justify-center gap-x-2 sm:gap-x-3 text-[10.5px] sm:text-xs text-slate-400 whitespace-nowrap overflow-x-auto py-1">
            <Link 
              href="/privacidad" 
              className="text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2 hover:underline-offset-4"
            >
              Privacidad (LOPDP / RGPD)
            </Link>
            <span className="text-slate-600 select-none">&bull;</span>
            <Link 
              href="/terminos" 
              className="text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2 hover:underline-offset-4"
            >
              Términos de Servicio
            </Link>
            <span className="text-slate-600 select-none">&bull;</span>
            <Link 
              href="/cookies" 
              className="text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2 hover:underline-offset-4"
            >
              Política de Cookies
            </Link>
          </nav>

          {/* Copyright & Security */}
          <div className="text-center md:text-right text-[10px] sm:text-[11px] text-slate-400 space-y-0.5 flex-shrink-0">
            <p>LeFriApp &copy; 2026. Todos los derechos reservados.</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center md:justify-end gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Privacidad blindada y cifrado TLS / AES-256</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
