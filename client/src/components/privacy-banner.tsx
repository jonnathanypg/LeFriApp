import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Check, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const CONSENT_STORAGE_KEY = 'lefri_privacy_consent';
const CONSENT_COOKIE_NAME = 'lefri_privacy_consent';

function hasUserConsented(): boolean {
  if (typeof window === 'undefined') return true;

  // 1. Check localStorage
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val) {
      const parsed = JSON.parse(val);
      if (parsed && (parsed.accepted === true || parsed === true)) {
        return true;
      }
    }
  } catch (e) {
    // LocalStorage blocked or restricted (common in strict private windows)
  }

  // 2. Check document.cookie as robust fallback
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (const item of cookies) {
        const [k, v] = item.trim().split('=');
        if (k === CONSENT_COOKIE_NAME && (v === 'true' || v === '1')) {
          return true;
        }
      }
    }
  } catch (e) {}

  return false;
}

export function PrivacyBanner() {
  // Initialize state synchronously so there is no flickering or delay
  const [isVisible, setIsVisible] = useState(() => {
    return !hasUserConsented();
  });

  const evaluateConsent = () => {
    const consented = hasUserConsented();
    setIsVisible(!consented);
  };

  useEffect(() => {
    // Re-verify on mount
    evaluateConsent();

    // Listen across multiple tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY || e.key === null) {
        evaluateConsent();
      }
    };

    // Listen to in-tab programmatic dispatch
    const handleCustomEvent = () => {
      evaluateConsent();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('lefri_privacy_consent_changed', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lefri_privacy_consent_changed', handleCustomEvent);
    };
  }, []);

  const handleAccept = () => {
    // 1. Save to localStorage
    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
          accepted: true,
          timestamp: Date.now(),
          date: new Date().toISOString(),
          version: '1.0'
        })
      );
    } catch (e) {}

    // 2. Save persistent cookie valid for 1 year (31,536,000s)
    try {
      if (typeof document !== 'undefined') {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${CONSENT_COOKIE_NAME}=true; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
      }
    } catch (e) {}

    // 3. Emit event to synchronize any other listeners immediately
    try {
      window.dispatchEvent(new Event('lefri_privacy_consent_changed'));
    } catch (e) {}

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de Privacidad y Cookies de LeFriApp"
      className="fixed inset-x-0 bottom-0 z-[99999] pointer-events-none p-3 sm:p-5 flex justify-center animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      <div className="pointer-events-auto w-full max-w-3xl rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-xl text-slate-200 p-4 sm:p-5 ring-1 ring-white/10 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Content & Icon */}
          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-0.5 sm:mt-0 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
                  <Lock className="w-3 h-3" /> Privacidad & LOPDP / RGPD
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Cookie className="w-3 h-3 text-amber-400" /> Cookies Técnicas
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                En <strong className="text-white font-medium">LeFriApp</strong> y <strong className="text-white font-medium">Fundación Underlife</strong> protegemos tus consultas ciudadanas. Utilizamos cookies técnicas esenciales para garantizar la seguridad de tu sesión y la funcionalidad del sistema. Tus datos no se comercializan con terceros ni se emplean para publicidad intrusiva.
              </p>

              {/* Legal Quick Links */}
              <div className="pt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                <span>Consulta nuestras políticas:</span>
                <Link
                  href="/privacidad"
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 hover:underline-offset-4 transition-colors"
                >
                  Privacidad
                </Link>
                <span className="text-slate-600">&bull;</span>
                <Link
                  href="/terminos"
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 hover:underline-offset-4 transition-colors"
                >
                  Términos
                </Link>
                <span className="text-slate-600">&bull;</span>
                <Link
                  href="/cookies"
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 hover:underline-offset-4 transition-colors"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-9 px-3.5 rounded-xl border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
              title="Cerrar aviso provisionalmente durante esta sesión"
            >
              Cerrar
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleAccept}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-medium transition shadow-md shadow-indigo-900/50 flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Aceptar y Continuar</span>
            </Button>
          </div>

        </div>
      </div>
    </aside>
  );
}
