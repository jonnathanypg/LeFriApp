import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Cookie, Shield, Check, Info, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PoliticaCookies() {
  const [, setLocation] = useLocation();

  const handleClearCookiesAndStorage = () => {
    try {
      localStorage.removeItem('lefri_privacy_consent');
      window.dispatchEvent(new Event('lefri_privacy_consent_changed'));
      alert('Tus preferencias de cookies y consentimiento de privacidad han sido restablecidos. El aviso de políticas se desplegará de nuevo para que puedas configurar tus opciones.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation('/')}
          className="text-slate-400 hover:text-white mb-6 p-0 hover:bg-transparent flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Button>

        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Cookie className="w-3.5 h-3.5" />
              <span>Transparencia Digital & Tecnologías de Rastreo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Política de Cookies y Almacenamiento Local
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Detalle transparente sobre las cookies, tokens de sesión y tecnologías de almacenamiento empleadas en LeFriApp conforme a los estándares de la LOPDP y la Directiva ePrivacy.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><strong>Vigencia:</strong> 2026</span>
              <span>&bull;</span>
              <span><strong>Compromiso:</strong> 0% Cookies Publicitarias o Rastreadores de Terceros Invasivos</span>
            </div>
          </div>

          {/* Key Statement */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Enfoque Privacy-First:</strong>
              LeFriApp <strong>no utiliza cookies de publicidad comportamental, ni redes de re-targeting, ni píxeles comerciales de rastreo</strong>. Solo utilizamos tecnologías estrictamente técnicas y esenciales para mantener tu sesión segura, recordar tu idioma de preferencia y gestionar las consultas jurídicas de forma fluida.
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            
            {/* 1. ¿Qué son? */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">1.</span> ¿Qué son las Cookies y el Almacenamiento Web?
              </h2>
              <p>
                Las cookies son pequeños archivos de texto que los sitios web transmiten al navegador del dispositivo al navegar por una página. Las tecnologías de almacenamiento web como <code>localStorage</code> y <code>sessionStorage</code> permiten a las aplicaciones almacenar de manera segura datos locales en el dispositivo del usuario sin transmitirlos automáticamente en cada petición HTTP, mejorando la velocidad de respuesta y la privacidad del usuario.
              </p>
            </section>

            {/* 2. Categorías utilizadas */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">2.</span> Tipología y Finalidad de las Tecnologías Utilizadas
              </h2>
              <p>
                En LeFriApp clasificamos las tecnologías en las siguientes categorías:
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-base">A. Cookies y Almacenamiento Estrictamente Necesarios (Técnicos)</h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Siempre Activo</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Son imprescindibles para que la plataforma funcione. Incluyen la gestión segura de autenticación mediante cookies HttpOnly, prevención de ataques de falsificación de peticiones (CSRF) y balanceo de carga. Sin ellas, el inicio de sesión y la tramitación de expedientes no son viables técnicamente.
                  </p>
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4 font-semibold">Identificador</th>
                          <th className="py-2 pr-4 font-semibold">Tipo</th>
                          <th className="py-2 pr-4 font-semibold">Duración</th>
                          <th className="py-2 font-semibold">Finalidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-2 pr-4 font-mono text-indigo-300">connect.sid / session</td>
                          <td className="py-2 pr-4">Cookie HttpOnly</td>
                          <td className="py-2 pr-4">Sesión activa</td>
                          <td className="py-2">Mantiene de forma segura la autenticación del ciudadano o letrado.</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-mono text-indigo-300">lefri_guest_id</td>
                          <td className="py-2 pr-4">Cookie / LocalStorage</td>
                          <td className="py-2 pr-4">30 días</td>
                          <td className="py-2">Garantiza el conteo cívico gratuito y la memoria de contexto en modo invitado.</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-mono text-indigo-300">lefri_privacy_consent</td>
                          <td className="py-2 pr-4">LocalStorage</td>
                          <td className="py-2 pr-4">1 año</td>
                          <td className="py-2">Registra el acuse de recibo y conocimiento del aviso de privacidad.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-base">B. Preferencias de Funcionalidad y Accesibilidad</h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">Preferencia del Usuario</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Permiten recordar configuraciones elegidas expresamente por el usuario para enriquecer su experiencia cívica.
                  </p>
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4 font-semibold">Identificador</th>
                          <th className="py-2 pr-4 font-semibold">Tipo</th>
                          <th className="py-2 pr-4 font-semibold">Duración</th>
                          <th className="py-2 font-semibold">Finalidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-2 pr-4 font-mono text-indigo-300">replit-legal-theme</td>
                          <td className="py-2 pr-4">LocalStorage</td>
                          <td className="py-2 pr-4">Persistente</td>
                          <td className="py-2">Almacena la preferencia visual de alto contraste y modo oscuro.</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-mono text-indigo-300">user_language</td>
                          <td className="py-2 pr-4">LocalStorage</td>
                          <td className="py-2 pr-4">Persistente</td>
                          <td className="py-2">Idioma seleccionado (Español, Kichwa, Shuar, Português, English).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-base">C. Integración con Google Drive y Docs (OAuth 2.0)</h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">Bajo Solicitud Expresa</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cuando usted opta voluntariamente por exportar una demanda o escrito formal a Google Docs, se emplean tokens de autorización temporal mediante la API segura de Google Identity Services. Dichos tokens se emplean única y exclusivamente para crear el archivo solicitado en la unidad de Google Drive del usuario.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Control y Eliminación */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">3.</span> Cómo Controlar o Eliminar las Cookies
              </h2>
              <p>
                El usuario puede en cualquier momento revocar su consentimiento, borrar los registros temporales o configurar su navegador para bloquear o ser advertido de la instalación de cookies:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
                <li><strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad & Seguridad &gt; Cookies y datos del sitio.</li>
                <li><strong>Apple Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
                <li><strong>Microsoft Edge:</strong> Configuración &gt; Permisos del sitio &gt; Cookies y datos almacenados.</li>
              </ul>

              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCookiesAndStorage}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 flex items-center space-x-2 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Restablecer preferencias locales y datos temporales</span>
                </Button>
              </div>
            </section>

            {/* 4. Dudas y Contacto */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">4.</span> Dudas sobre nuestra Política de Cookies
              </h2>
              <p>
                Si tiene inquietudes sobre el empleo de cookies o tecnologías de almacenamiento local en LeFriApp, puede escribirnos directamente al correo oficial de privacidad: <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">lefri@fundacionunderlife.org</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
