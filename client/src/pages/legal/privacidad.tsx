import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Shield, ShieldCheck, Lock, Eye, Database, FileCheck, Scale, Globe, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PoliticaPrivacidad() {
  const [, setLocation] = useLocation();

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
              <Shield className="w-3.5 h-3.5" />
              <span>Garantía de Privacidad & Cumplimiento Normativo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Política Integral de Privacidad y Tratamiento de Datos Personales
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Conforme a la Ley Orgánica de Protección de Datos Personales de Ecuador (LOPDP), RGPD/GDPR (Unión Europea) y directrices de protección de datos en Latinoamérica y EE.UU.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><strong>Versión:</strong> 2.4.0 (Blindaje Regulatorio 2026)</span>
              <span>&bull;</span>
              <span><strong>Última actualización:</strong> 8 de Septiembre de 2026</span>
              <span>&bull;</span>
              <span><strong>Responsable:</strong> Fundación Underlife & LeFriApp LegalTech</span>
            </div>
          </div>

          {/* Legal Notice Callout */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm leading-relaxed flex items-start space-x-3">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Compromiso Cívico de No Comercialización:</strong>
              LeFriApp <strong>nunca comercializa, sublicencia ni monetiza</strong> los datos personales, consultas ciudadanas, registros de voz ni documentos legales generados. Toda la información es tratada bajo estrictas medidas de seguridad técnica y jurídica para fines exclusivos de orientación y soporte al titular.
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">1.</span> Identidad y Contacto del Responsable del Tratamiento
              </h2>
              <p>
                El responsable del tratamiento de sus datos personales es <strong>Fundación Underlife</strong> en articulación operativa y técnica con la plataforma de acceso a la justicia cívica <strong>LeFriApp</strong> (en adelante, "LeFriApp" o la "Plataforma").
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
                <li><strong>Entidad:</strong> Fundación Underlife / Proyecto LeFriApp</li>
                <li><strong>Delegado de Protección de Datos (DPO / DPD):</strong> Oficial de Cumplimiento Normativo y Privacidad</li>
                <li><strong>Correo de Contacto Oficial DPO / Privacidad:</strong> <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">lefri@fundacionunderlife.org</a></li>
                <li><strong>Ámbito Jurisdiccional:</strong> República del Ecuador (con alcance extraterritorial para ciudadanos en el exterior conforme al art. 3 LOPDP y art. 3 RGPD).</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">2.</span> Principios Rectores del Tratamiento de Datos
              </h2>
              <p>
                Todo tratamiento realizado en LeFriApp se rige rigurosamente por los principios consagrados en el artículo 10 de la LOPDP y el artículo 5 del RGPD:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">Juridicidad y Lealtad</span>
                  <span className="text-xs text-slate-400">Tratamiento estrictamente apegado a la Constitución y leyes vigentes.</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">Minimización de Datos</span>
                  <span className="text-xs text-slate-400">Solo recolectamos datos estrictamente indispensables y pertinentes.</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">Limitación de la Finalidad</span>
                  <span className="text-xs text-slate-400">Los datos no se usan para fines incompatibles con la orientación legal.</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">Seguridad y Confidencialidad</span>
                  <span className="text-xs text-slate-400">Cifrado de grado bancario (TLS 1.3, AES-256 en reposo) y secreto profesional digital.</span>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">3.</span> Categorías de Datos Recopilados y Fines
              </h2>
              <p>
                Dependiendo del módulo o servicio utilizado (Consulta Ciudadana, Asistente Constitucional, Generador de Documentos o Botón de Emergencia), recopilamos:
              </p>
              <div className="space-y-2 text-sm">
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">A. Datos de Identificación y Contacto</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Nombres, apellidos, dirección de correo electrónico, número de teléfono (en caso de registro para alertas o derivación voluntaria) y país de residencia.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">B. Hechos Fácticos y Consultas Jurídicas</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Relato de hechos, incidentes, fechas, lugares y preguntas formuladas en el chat o wizard con el fin de generar el triaje algorítmico y fundamentación constitucional.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">C. Grabaciones de Voz y Audio (MediaSuite)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Cuando utiliza la función de dictado o consulta por voz, el audio es procesado en tiempo real exclusivamente para transcribir el contenido fáctico a texto mediante modelos de IA. <strong>El fragmento de audio no se conserva permanentemente</strong> una vez finalizada la transcripción e indexación del texto.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">D. Datos Técnicos y de Conectividad</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Dirección IP anonimizada, metadatos de sesión (guestId con rotación criptográfica), agente de usuario y registros de seguridad contra ataques DDoS y accesos indebidos.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">4.</span> Base Jurídica del Tratamiento
              </h2>
              <p>
                El tratamiento de sus datos personales se fundamenta en las siguientes bases legales (art. 7 LOPDP y art. 6 RGPD):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                <li><strong>Consentimiento Expreso e Informado:</strong> Otorgado por el usuario al enviar sus consultas, subir documentos o utilizar herramientas de voz.</li>
                <li><strong>Ejecución Contractual o Precontractual:</strong> Prestación directa del servicio digital de asistencia cívica y generación de documentos jurídicos.</li>
                <li><strong>Cumplimiento de Obligaciones Legales:</strong> Retención de registros mínimos para garantizar la trazabilidad forense y auditoría informática requerida por entes reguladores.</li>
                <li><strong>Protección de Intereses Vitales:</strong> En la activación de protocolos de emergencia frente a flagrancia, detenciones arbitrarias o violencia de género.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">5.</span> Integraciones con Terceros y Transferencias Internacionales
              </h2>
              <p>
                Para brindar un servicio de alta disponibilidad y tecnología agéntica de vanguardia, LeFriApp emplea proveedores de infraestructura que cumplen con estándares internacionales de privacidad (SOC2 Tipo II, ISO 27001 y Cláusulas Contractuales Tipo de la Comisión Europea):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-300">
                <li><strong>Google Cloud Platform & Google Docs API:</strong> Para almacenamiento seguro y exportación voluntaria de documentos cuando el usuario autoriza explícitamente OAuth 2.0.</li>
                <li><strong>Proveedores de Modelos de Inteligencia Artificial (LLMs):</strong> Los prompts enviados a modelos neuronales son anonimizados y procesados bajo acuerdos de confidencialidad empresarial donde <strong>los datos del usuario NO se utilizan para reentrenar modelos públicos</strong>.</li>
                <li><strong>Infraestructura de Bases de Datos (MySQL / Prisma ORM):</strong> Alojada en entornos dedicados y aislados con cifrado en reposo y copias de respaldo automatizadas.</li>
              </ul>

              {/* Medidas Técnicas y Cifrado */}
              <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Arquitectura Técnica de Seguridad y Cifrado de Datos
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En apego al artículo 40 de la LOPDP y artículo 32 del RGPD sobre la seguridad del tratamiento, LeFriApp aplica una política de defensa en profundidad:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">Cifrado en Tránsito (TLS 1.3 / HTTPS):</strong>
                    <span className="text-slate-400">Todo el tráfico web y peticiones de API están blindados con certificados SSL/TLS y cifrado robusto para impedir interceptaciones en red.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">Cifrado Simétrico en Reposo (AES-256-GCM):</strong>
                    <span className="text-slate-400">Los datos altamente confidenciales (contactos de emergencia, teléfonos, credenciales) son encriptados en la capa de aplicación con vectores de inicialización dinámicos y autenticación criptográfica.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">Hashes Criptográficos Unidireccionales (SHA-256):</strong>
                    <span className="text-slate-400">Búsquedas e indexaciones seguras mediante hashes criptográficos no reversibles, evitando búsquedas en texto plano.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">Aislamiento y Destrucción Criptográfica:</strong>
                    <span className="text-slate-400">Sesiones temporales blindadas mediante cookies con atributos HttpOnly, SameSite=Lax y borrado seguro tras la revocación del consentimiento.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">6.</span> Derechos del Titular de Datos (Derechos ARCO+)
              </h2>
              <p>
                De acuerdo con la legislación vigente, usted tiene derecho a ejercer en cualquier momento y de forma totalmente gratuita sus facultades de:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">Acceso:</strong>
                  <span className="text-xs text-slate-400">Conocer con exactitud qué datos personales suyos reposan en nuestros sistemas.</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">Rectificación y Actualización:</strong>
                  <span className="text-xs text-slate-400">Modificar información inexacta, incompleta o desactualizada.</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">Eliminación / Cancelación:</strong>
                  <span className="text-xs text-slate-400">Solicitar la supresión definitiva de su expediente y cuenta ("derecho al olvido").</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">Oposición y Portabilidad:</strong>
                  <span className="text-xs text-slate-400">Oponerse al tratamiento o recibir sus expedientes en un formato estructurado e interoperable (JSON/XML/PDF).</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-2">
                Para ejercer cualquiera de estos derechos, basta con enviar una solicitud indicando su nombre y correo registrado a <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">lefri@fundacionunderlife.org</a>. Su solicitud será atendida en un plazo máximo legal de 15 días hábiles.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">7.</span> Plazos de Retención de la Información
              </h2>
              <p>
                Los datos de consultas y procesos activos se conservarán durante el tiempo que la cuenta del usuario permanezca activa o mientras sea necesario para prestar el servicio de acompañamiento legal cívico. Si un usuario solicita la baja de su cuenta, todos sus expedientes, audios y metadatos asociados son destruidos de manera criptográficamente irreversible en un plazo máximo de 30 días naturales, salvo que medie orden judicial u obligación legal de conservación fiscal o penal.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">8.</span> Autoridad de Control Competente
              </h2>
              <p>
                Sin perjuicio de cualquier otro recurso administrativo o acción judicial, si considera que el tratamiento de sus datos infringe la normativa aplicable, tiene derecho a presentar un reclamo ante la <strong>Superintendencia de Protección de Datos Personales de la República del Ecuador</strong> o ante la autoridad de control de protección de datos de su lugar de residencia habitual.
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
