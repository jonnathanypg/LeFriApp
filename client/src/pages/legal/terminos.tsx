import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Scale, AlertTriangle, FileText, CheckCircle2, ShieldAlert, Cpu, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function TerminosServicio() {
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
              <Scale className="w-3.5 h-3.5" />
              <span>Marco Jurídico de Operación & Términos de Servicio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Términos y Condiciones Generales de Uso del Servicio
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Regulación aplicable al uso del ecosistema LeFriApp, servicios de orientación jurídica algorítmica, redacción automatizada y asistencia cívica.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><strong>Edición:</strong> 2026.1 (Blindaje Integral)</span>
              <span>&bull;</span>
              <span><strong>Efectividad:</strong> Inmediata a su aceptación tácita o expresa</span>
              <span>&bull;</span>
              <span><strong>Operador:</strong> Fundación Underlife / LeFriApp</span>
            </div>
          </div>

          {/* CRITICAL DISCLAIMER / BLINDAJE REGULATORIO */}
          <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>AVISO LEGAL CRÍTICO Y EXENCIÓN DE RESPONSABILIDAD PROFESIONAL:</span>
            </div>
            <p>
              LeFriApp es una plataforma tecnológica de <strong>asistencia legal informativa y cívica impulsada por Inteligencia Artificial y Retrieval-Augmented Generation (RAG)</strong>. 
            </p>
            <p className="font-medium text-amber-100">
              El uso de LeFriApp NO constituye, bajo ninguna circunstancia, el ejercicio de la abogacía formal, patrocinio jurídico letrado ante tribunales, ni crea una relación abogado-cliente entre el usuario y la plataforma o sus desarrolladores. 
            </p>
            <p>
              Los diagnósticos, minutas, demandas preliminares y respuestas generadas por los agentes neuronales son <strong>orientaciones informativas y borradores técnicos</strong> basados en normas y fuentes públicas. Para la suscripción formal, patrocinio en juicio, defensa en audiencias o litigio activo, el usuario debe contar preceptivamente con la asesoría de un profesional del Derecho debidamente matriculado en el Foro de Abogados del Consejo de la Judicatura o el colegio respectivo de su jurisdicción.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            
            {/* 1. Objeto */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">1.</span> Objeto y Ámbito de Aplicación
              </h2>
              <p>
                Los presentes Términos regulan el acceso, navegación y utilización de la plataforma LeFriApp, incluyendo sus interfaces web, aplicaciones móviles, agentes de triaje, motor de documentos y base de conocimiento constitucional. Al acceder o utilizar cualquier componente de la Plataforma, el usuario declara ser mayor de edad legal o contar con representación idónea, y acepta someterse incondicionalmente a estas disposiciones.
              </p>
            </section>

            {/* 2. Naturaleza del Servicio */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">2.</span> Naturaleza del Servicio de Inteligencia Artificial
              </h2>
              <p>
                La Plataforma opera mediante una arquitectura multi-agente que sintetiza información legal mediante modelos de lenguaje avanzados cotejados con bases de datos normativas (Código del Trabajo, COIP, COGEP, Constitución de la República del Ecuador, etc.).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Carácter Dinámico de las Leyes:</strong> Si bien LeFriApp realiza esfuerzos continuos por mantener sus bases vectoriales actualizadas, la legislación, decretos de emergencia y jurisprudencia sufren modificaciones continuas. La Plataforma no garantiza la infalibilidad absoluta ni la ausencia total de discrepancias hermenéuticas.</li>
                <li><strong>Obligación de Revisión Humana:</strong> El usuario asume la responsabilidad exclusiva de contrastar los borradores de documentos descargados (Word/Docs/PDF) antes de suscribirlos o remitirlos a cualquier autoridad pública o contraparte privada.</li>
              </ul>
            </section>

            {/* 3. Uso Permitido y Prohibiciones */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">3.</span> Uso Aceptable y Restricciones Operativas
              </h2>
              <p>Queda terminantemente prohibido utilizar LeFriApp para:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-2">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-rose-400 font-semibold block">Actos Ilícitos o Fraude</span>
                  <span className="text-slate-400">Elaborar documentos falsificados, simular contratos fraudulentos o encubrir actividades delictivas.</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-rose-400 font-semibold block">Ataques Informáticos</span>
                  <span className="text-slate-400">Inyección de prompts maliciosos (jailbreaks), scraping no autorizado o desestabilización de servidores.</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-rose-400 font-semibold block">Suplantación de Identidad</span>
                  <span className="text-slate-400">Ingresar datos de terceros sin su consentimiento libre, previo y documentado.</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-rose-400 font-semibold block">Reventa Comercial No Autorizada</span>
                  <span className="text-slate-400">Revender las respuestas gratuitas o lucrar de servicios diseñados para el empoderamiento cívico universal.</span>
                </div>
              </div>
            </section>

            {/* 4. Propiedad Intelectual */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">4.</span> Propiedad Intelectual y Derechos sobre el Contenido
              </h2>
              <p>
                <strong>Software y Marca:</strong> Los algoritmos, código fuente, logotipos, diseño de interfaz y metodologías de RAG son propiedad exclusiva de Fundación Underlife y LeFriApp, protegidos por los tratados internacionales de propiedad intelectual (OMPI/WIPO) y el Código Orgánico de la Economía Social de los Conocimientos (Código Ingenios de Ecuador).
              </p>
              <p>
                <strong>Borradores y Documentos del Usuario:</strong> Los escritos, contratos y memoriales redactados por el usuario mediante las herramientas de LeFriApp pertenecen de manera plena al usuario, otorgando a la Plataforma una licencia no exclusiva y técnica únicamente para renderizar, almacenar y posibilitar la descarga de dichos archivos.
              </p>
            </section>

            {/* 5. Limitación de Responsabilidad */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">5.</span> Limitación Expresa de Responsabilidad por Daños
              </h2>
              <p>
                En la máxima medida permitida por el ordenamiento jurídico aplicable, ni Fundación Underlife, ni sus directores, desarrolladores, afiliados o proveedores de IA responderán por:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Decisiones procesales, administrativas o contractuales tomadas por el usuario sustentadas en las sugerencias generadas.</li>
                <li>Preclusión de plazos, caducidad o prescripción de acciones jurídicas causadas por demora del usuario o interrupciones de conectividad.</li>
                <li>Pérdida de beneficios comerciales o daños indirectos, incidentales o consecuenciales derivados del uso o imposibilidad de uso del software.</li>
              </ul>
            </section>

            {/* 6. Módulo de Emergencia */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">6.</span> Módulo de Emergencia y Contacto con Autoridades
              </h2>
              <p>
                El Botón de Emergencia es una herramienta digital de orientación sobre garantías constitucionales y emisión de alertas ciudadanas. <strong>LeFriApp no reemplaza la llamada inmediata al Servicio Integrado de Seguridad ECU 911</strong> ni a la Policía Nacional. Ante situaciones de riesgo inminente para la vida o integridad personal, el usuario debe comunicarse de forma prioritaria con los servicios de socorro oficiales.
              </p>
            </section>

            {/* 7. Modificaciones */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">7.</span> Modificaciones a los Términos
              </h2>
              <p>
                LeFriApp se reserva el derecho de actualizar estos términos en caso de reformas normativas o mejoras en la arquitectura del sistema. Las modificaciones entrarán en vigencia a partir de su publicación en el sitio web oficial.
              </p>
            </section>

            {/* 8. Ley Aplicable y Jurisdicción */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">8.</span> Ley Aplicable y Solución de Controversias
              </h2>
              <p>
                Estos Términos se rigen e interpretan con arreglo a las leyes de la República del Ecuador. Cualquier diferendo o discrepancia será sometido en primera instancia a un mecanismo de mediación en un Centro de Mediación legalmente reconocido, y en caso de no acuerdo, a los jueces competentes del cantón de domicilio de la entidad operadora.
              </p>
            </section>

            {/* 9. Contacto Oficial */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">9.</span> Contacto y Notificaciones
              </h2>
              <p>
                Para cualquier consulta, requerimiento institucional o notificación sobre estos Términos de Servicio, puede comunicarse con nosotros a través del correo oficial: <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">lefri@fundacionunderlife.org</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
