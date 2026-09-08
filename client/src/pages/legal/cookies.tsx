import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Cookie, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  es: {
    back: "Volver",
    tag: "Transparencia Digital & Tecnologías de Rastreo",
    title: "Política de Cookies y Almacenamiento Local",
    subtitle: "Detalle transparente sobre las cookies, tokens de sesión y tecnologías de almacenamiento empleadas en LeFriApp conforme a los estándares de la LOPDP y la Directiva ePrivacy.",
    metaValidity: "Vigencia: 2026",
    metaCommitment: "Compromiso: 0% Cookies Publicitarias o Rastreadores de Terceros Invasivos",
    infoTitle: "Enfoque Privacy-First:",
    infoDesc: "LeFriApp no utiliza cookies de publicidad comportamental, ni redes de re-targeting, ni píxeles comerciales de rastreo. Solo utilizamos tecnologías estrictamente técnicas y esenciales para mantener tu sesión segura, recordar tu idioma de preferencia y gestionar las consultas jurídicas de forma fluida.",
    sec1Title: "1. ¿Qué son las Cookies y el Almacenamiento Web?",
    sec1Text: "Las cookies son pequeños archivos de texto que los sitios web transmiten al navegador del dispositivo al navegar por una página. Las tecnologías de almacenamiento web como localStorage y sessionStorage permiten a las aplicaciones almacenar de manera segura datos locales en el dispositivo del usuario sin transmitirlos automáticamente en cada petición HTTP, mejorando la velocidad de respuesta y la privacidad del usuario.",
    sec2Title: "2. Tipología y Finalidad de las Tecnologías Utilizadas",
    sec2Intro: "En LeFriApp clasificamos las tecnologías en las siguientes categorías:",
    catATitle: "A. Cookies y Almacenamiento Estrictamente Necesarios (Técnicos)",
    catABadge: "Siempre Activo",
    catADesc: "Son imprescindibles para que la plataforma funcione. Incluyen la gestión segura de autenticación mediante cookies HttpOnly, prevención de ataques de falsificación de peticiones (CSRF) y balanceo de carga. Sin ellas, el inicio de sesión y la tramitación de expedientes no son viables técnicamente.",
    catBTitle: "B. Preferencias de Funcionalidad y Accesibilidad",
    catBBadge: "Preferencia del Usuario",
    catBDesc: "Permiten recordar configuraciones elegidas expresamente por el usuario para enriquecer su experiencia cívica.",
    catCTitle: "C. Integración con Google Drive y Docs (OAuth 2.0)",
    catCBadge: "Bajo Solicitud Expresa",
    catCDesc: "Cuando usted opta voluntariamente por exportar una demanda o escrito formal a Google Docs, se emplean tokens de autorización temporal mediante la API segura de Google Identity Services. Dichos tokens se emplean única y exclusivamente para crear el archivo solicitado en la unidad de Google Drive del usuario.",
    thId: "Identificador",
    thType: "Tipo",
    thDuration: "Duración",
    thPurpose: "Finalidad",
    tableA: [
      { id: "connect.sid / session", type: "Cookie HttpOnly", duration: "Sesión activa", purpose: "Mantiene de forma segura la autenticación del ciudadano o letrado." },
      { id: "lefri_guest_id", type: "Cookie / LocalStorage", duration: "30 días", purpose: "Garantiza el conteo cívico gratuito y la memoria de contexto en modo invitado." },
      { id: "lefri_privacy_consent", type: "LocalStorage", duration: "1 año", purpose: "Registra el acuse de recibo y conocimiento del aviso de privacidad." },
    ],
    tableB: [
      { id: "replit-legal-theme", type: "LocalStorage", duration: "Persistente", purpose: "Almacena la preferencia visual de alto contraste y modo oscuro." },
      { id: "user_language", type: "LocalStorage", duration: "Persistente", purpose: "Idioma seleccionado (Español, Kichwa, Shuar, Português, English)." },
    ],
    sec3Title: "3. Cómo Controlar o Eliminar las Cookies",
    sec3Intro: "El usuario puede en cualquier momento revocar su consentimiento, borrar los registros temporales o configurar su navegador para bloquear o ser advertido de la instalación de cookies:",
    browsers: [
      { name: "Google Chrome", path: "Configuración > Privacidad y seguridad > Cookies y otros datos de sitios." },
      { name: "Mozilla Firefox", path: "Ajustes > Privacidad & Seguridad > Cookies y datos del sitio." },
      { name: "Apple Safari", path: "Preferencias > Privacidad > Bloquear todas las cookies." },
      { name: "Microsoft Edge", path: "Configuración > Permisos del sitio > Cookies y datos almacenados." },
    ],
    resetBtn: "Restablecer preferencias locales y datos temporales",
    resetAlert: "Tus preferencias de cookies y consentimiento de privacidad han sido restablecidos. El aviso de políticas se desplegará de nuevo para que puedas configurar tus opciones.",
    sec4Title: "4. Dudas sobre nuestra Política de Cookies",
    sec4Text: "Si tiene inquietudes sobre el empleo de cookies o tecnologías de almacenamiento local en LeFriApp, puede escribirnos directamente al correo oficial de privacidad: ",
  },
  en: {
    back: "Back",
    tag: "Digital Transparency & Tracking Technologies",
    title: "Cookie and Local Storage Policy",
    subtitle: "Transparent breakdown of cookies, session tokens, and storage technologies used across LeFriApp under LOPDP, GDPR, and ePrivacy principles.",
    metaValidity: "Validity: 2026",
    metaCommitment: "Commitment: 0% Behavioral Ad Cookies or Invasive Trackers",
    infoTitle: "Privacy-First Principle:",
    infoDesc: "LeFriApp does not employ behavioral advertising cookies, re-targeting networks, or commercial tracking pixels. We strictly rely on technical and functional storage to secure your session, remember your preferred language, and enable seamless legal queries.",
    sec1Title: "1. What are Cookies and Web Storage?",
    sec1Text: "Cookies are small text files transferred to your browser when visiting websites. Web storage technologies like localStorage and sessionStorage enable applications to safely store client-side state without automatic HTTP payload transmission, increasing speed and protecting privacy.",
    sec2Title: "2. Types and Purpose of Technologies Employed",
    sec2Intro: "In LeFriApp we classify technologies into the following categories:",
    catATitle: "A. Strictly Necessary & Technical Cookies (Essential)",
    catABadge: "Always Active",
    catADesc: "Essential for core platform operations, including HttpOnly session authentication, CSRF attack prevention, and server load balancing. Login and document generation cannot function without them.",
    catBTitle: "B. Functionality & Accessibility Preferences",
    catBBadge: "User Choice",
    catBDesc: "Store user-selected interface settings to personalize and enhance civic interaction.",
    catCTitle: "C. Google Drive & Docs Integration (OAuth 2.0)",
    catCBadge: "On Explicit Request",
    catCDesc: "When users opt to export documents to Google Docs, temporary authorization tokens are processed through Google Identity Services. These tokens are solely used to create the specific requested document in the user private drive.",
    thId: "Identifier",
    thType: "Type",
    thDuration: "Duration",
    thPurpose: "Purpose",
    tableA: [
      { id: "connect.sid / session", type: "Cookie HttpOnly", duration: "Active session", purpose: "Secures authentication for citizens and legal professionals." },
      { id: "lefri_guest_id", type: "Cookie / LocalStorage", duration: "30 days", purpose: "Tracks free civic quotas and session context in guest mode." },
      { id: "lefri_privacy_consent", type: "LocalStorage", duration: "1 year", purpose: "Stores user acknowledgment of the privacy framework." },
    ],
    tableB: [
      { id: "replit-legal-theme", type: "LocalStorage", duration: "Persistent", purpose: "Stores contrast and dark mode visual preferences." },
      { id: "user_language", type: "LocalStorage", duration: "Persistent", purpose: "Selected language (Spanish, English, Portuguese, Kichwa, Shuar)." },
    ],
    sec3Title: "3. How to Manage or Delete Cookies",
    sec3Intro: "Users may at any time revoke consent, clear local browser data, or configure browsers to block cookie installation:",
    browsers: [
      { name: "Google Chrome", path: "Settings > Privacy and security > Cookies and other site data." },
      { name: "Mozilla Firefox", path: "Settings > Privacy & Security > Cookies and Site Data." },
      { name: "Apple Safari", path: "Preferences > Privacy > Block all cookies." },
      { name: "Microsoft Edge", path: "Settings > Site permissions > Cookies and site data." },
    ],
    resetBtn: "Reset local preferences and temporary storage",
    resetAlert: "Your cookie preferences and privacy consent have been reset. The banner will now reappear for you to configure.",
    sec4Title: "4. Questions Regarding Cookies",
    sec4Text: "If you have questions regarding cookies or local storage usage on LeFriApp, please contact our data privacy desk at: ",
  },
  pt: {
    back: "Voltar",
    tag: "Transparência Digital & Tecnologias de Rastreamento",
    title: "Política de Cookies e Armazenamento Local",
    subtitle: "Detalhamento transparente de cookies, tokens de sessão e tecnologias de armazenamento no LeFriApp em conformidade com a LOPDP e diretrizes de privacidade.",
    metaValidity: "Vigência: 2026",
    metaCommitment: "Compromisso: 0% Cookies Publicitários ou Rastreadores Invasivos",
    infoTitle: "Abordagem Privacy-First:",
    infoDesc: "O LeFriApp não utiliza cookies de publicidade comportamental nem rastreadores comerciais de terceiros. Utilizamos exclusivamente tecnologias técnicas e essenciais para proteger sua navegação, lembrar seu idioma e gerenciar consultas com estabilidade.",
    sec1Title: "1. O que são Cookies e Armazenamento Web?",
    sec1Text: "Cookies são pequenos arquivos de texto enviados pelo site ao navegador. Tecnologias de armazenamento local (localStorage e sessionStorage) permitem reter preferências com segurança no dispositivo sem transmiti-las automaticamente em cada requisição HTTP, garantindo agilidade e privacidade.",
    sec2Title: "2. Categorias e Finalidades das Tecnologias Empregadas",
    sec2Intro: "No LeFriApp classificamos as tecnologias nas seguintes categorias:",
    catATitle: "A. Cookies e Armazenamento Estritamente Necessários (Técnicos)",
    catABadge: "Sempre Ativo",
    catADesc: "Indispensáveis para o funcionamento da plataforma. Incluem gerenciamento seguro de sessão via HttpOnly, proteção contra ataques CSRF e balanceamento de tráfego. Sem eles, o login e a tramitação técnica de documentos são inviabilizados.",
    catBTitle: "B. Preferências de Funcionalidade e Acessibilidade",
    catBBadge: "Preferência do Usuário",
    catBDesc: "Permitem memorizar opções indicadas pelo próprio cidadão para aprimorar sua experiência.",
    catCTitle: "C. Integração com Google Drive e Docs (OAuth 2.0)",
    catCBadge: "Sob Solicitação Expressa",
    catCDesc: "Quando você solicita exportar petições para o Google Docs, tokens temporários são gerados via Google Identity Services, utilizados exclusivamente para gerar o arquivo na sua própria conta.",
    thId: "Identificador",
    thType: "Tipo",
    thDuration: "Duração",
    thPurpose: "Finalidade",
    tableA: [
      { id: "connect.sid / session", type: "Cookie HttpOnly", duration: "Sessão ativa", purpose: "Garante autenticação segura do cidadão ou advogado." },
      { id: "lefri_guest_id", type: "Cookie / LocalStorage", duration: "30 dias", purpose: "Controla cotas cívicas gratuitas e memória de contexto." },
      { id: "lefri_privacy_consent", type: "LocalStorage", duration: "1 ano", purpose: "Registra consentimento e ciência do aviso de privacidade." },
    ],
    tableB: [
      { id: "replit-legal-theme", type: "LocalStorage", duration: "Persistente", purpose: "Memoriza preferência de tema escuro e contraste." },
      { id: "user_language", type: "LocalStorage", duration: "Persistente", purpose: "Idioma selecionado (Espanhol, Inglês, Português, Kichwa, Shuar)." },
    ],
    sec3Title: "3. Como Gerenciar ou Excluir Cookies",
    sec3Intro: "O usuário pode revogar seu consentimento a qualquer momento, limpar o armazenamento local ou configurar o navegador para bloquear cookies:",
    browsers: [
      { name: "Google Chrome", path: "Configurações > Privacidade e segurança > Cookies e outros dados do site." },
      { name: "Mozilla Firefox", path: "Configurações > Privacidade e Segurança > Cookies e dados de sites." },
      { name: "Apple Safari", path: "Preferências > Privacidade > Bloquear todos os cookies." },
      { name: "Microsoft Edge", path: "Configurações > Permissões do site > Cookies e dados armazenados." },
    ],
    resetBtn: "Redefinir preferências locais e dados temporários",
    resetAlert: "Suas preferências de cookies e consentimento foram redefinidos. O aviso de privacidade reaparecerá para nova configuração.",
    sec4Title: "4. Dúvidas sobre Cookies",
    sec4Text: "Para esclarecimentos sobre o uso de cookies ou armazenamento local no LeFriApp, contate nossa equipe de privacidade em: ",
  },
};

export default function PoliticaCookies() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = content[language] || content.es;

  const handleClearCookiesAndStorage = () => {
    try {
      localStorage.removeItem("lefri_privacy_consent");
      window.dispatchEvent(new Event("lefri_privacy_consent_changed"));
      alert(t.resetAlert);
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
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
          className="text-slate-400 hover:text-white mb-6 p-0 hover:bg-transparent flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </Button>

        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Cookie className="w-3.5 h-3.5" />
              <span>{t.tag}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t.subtitle}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><strong>{t.metaValidity}</strong></span>
              <span>&bull;</span>
              <span><strong>{t.metaCommitment}</strong></span>
            </div>
          </div>

          {/* Key Statement */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">{t.infoTitle}</strong>
              {t.infoDesc}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            
            {/* 1. ¿Qué son? */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec1Title}
              </h2>
              <p>{t.sec1Text}</p>
            </section>

            {/* 2. Categorías utilizadas */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec2Title}
              </h2>
              <p>{t.sec2Intro}</p>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-base">{t.catATitle}</h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{t.catABadge}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.catADesc}</p>
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4 font-semibold">{t.thId}</th>
                          <th className="py-2 pr-4 font-semibold">{t.thType}</th>
                          <th className="py-2 pr-4 font-semibold">{t.thDuration}</th>
                          <th className="py-2 font-semibold">{t.thPurpose}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {t.tableA.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 pr-4 font-mono text-indigo-300">{row.id}</td>
                            <td className="py-2 pr-4">{row.type}</td>
                            <td className="py-2 pr-4">{row.duration}</td>
                            <td className="py-2">{row.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-base">{t.catBTitle}</h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">{t.catBBadge}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.catBDesc}</p>
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4 font-semibold">{t.thId}</th>
                          <th className="py-2 pr-4 font-semibold">{t.thType}</th>
                          <th className="py-2 pr-4 font-semibold">{t.thDuration}</th>
                          <th className="py-2 font-semibold">{t.thPurpose}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {t.tableB.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 pr-4 font-mono text-indigo-300">{row.id}</td>
                            <td className="py-2 pr-4">{row.type}</td>
                            <td className="py-2 pr-4">{row.duration}</td>
                            <td className="py-2">{row.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-base">{t.catCTitle}</h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">{t.catCBadge}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.catCDesc}</p>
                </div>
              </div>
            </section>

            {/* 3. Control y Eliminación */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec3Title}
              </h2>
              <p>{t.sec3Intro}</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {t.browsers.map((b, idx) => (
                  <li key={idx}><strong>{b.name}:</strong> {b.path}</li>
                ))}
              </ul>

              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCookiesAndStorage}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 flex items-center space-x-2 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.resetBtn}</span>
                </Button>
              </div>
            </section>

            {/* 4. Dudas y Contacto */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec4Title}
              </h2>
              <p>
                {t.sec4Text}
                <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">
                  lefri@fundacionunderlife.org
                </a>.
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
