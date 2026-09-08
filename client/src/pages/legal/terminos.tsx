import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Scale, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  es: {
    back: "Volver",
    tag: "Marco Jurídico de Operación & Términos de Servicio",
    title: "Términos y Condiciones Generales de Uso del Servicio",
    subtitle: "Regulación aplicable al uso del ecosistema LeFriApp, servicios de orientación jurídica algorítmica, redacción automatizada y asistencia cívica.",
    metaEdition: "Edición: 2026.1 (Blindaje Integral)",
    metaEffective: "Efectividad: Inmediata a su aceptación tácita o expresa",
    metaOperator: "Operador: Fundación Underlife / LeFriApp",
    disclaimerTitle: "AVISO LEGAL CRÍTICO Y EXENCIÓN DE RESPONSABILIDAD PROFESIONAL:",
    disclaimer1: "LeFriApp es una plataforma tecnológica de asistencia legal informativa y cívica impulsada por Inteligencia Artificial y Retrieval-Augmented Generation (RAG).",
    disclaimer2: "El uso de LeFriApp NO constituye, bajo ninguna circunstancia, el ejercicio de la abogacía formal, patrocinio jurídico letrado ante tribunales, ni crea una relación abogado-cliente entre el usuario y la plataforma o sus desarrolladores.",
    disclaimer3: "Los diagnósticos, minutas, demandas preliminares y respuestas generadas por los agentes neuronales son orientaciones informativas y borradores técnicos basados en normas y fuentes públicas. Para la suscripción formal, patrocinio en juicio, defensa en audiencias o litigio activo, el usuario debe contar preceptivamente con la asesoría de un profesional del Derecho debidamente matriculado en el Foro de Abogados del Consejo de la Judicatura o el colegio respectivo de su jurisdicción.",
    sec1Title: "1. Objeto y Ámbito de Aplicación",
    sec1Text: "Los presentes Términos regulan el acceso, navegación y utilización de la plataforma LeFriApp, incluyendo sus interfaces web, aplicaciones móviles, agentes de triaje, motor de documentos y base de conocimiento constitucional. Al acceder o utilizar cualquier componente de la Plataforma, el usuario declara ser mayor de edad legal o contar con representación idónea, y acepta someterse incondicionalmente a estas disposiciones.",
    sec2Title: "2. Naturaleza del Servicio de Inteligencia Artificial",
    sec2Text: "La Plataforma opera mediante una arquitectura multi-agente que sintetiza información legal mediante modelos de lenguaje avanzados cotejados con bases de datos normativas (Código del Trabajo, COIP, COGEP, Constitución de la República del Ecuador, etc.).",
    sec2Bullet1Title: "Carácter Dinámico de las Leyes:",
    sec2Bullet1Text: "Si bien LeFriApp realiza esfuerzos continuos por mantener sus bases vectoriales actualizadas, la legislación, decretos de emergencia y jurisprudencia sufren modificaciones continuas. La Plataforma no garantiza la infalibilidad absoluta ni la ausencia total de discrepancias hermenéuticas.",
    sec2Bullet2Title: "Obligación de Revisión Humana:",
    sec2Bullet2Text: "El usuario asume la responsabilidad exclusiva de contrastar los borradores de documentos descargados (Word/Docs/PDF) antes de suscribirlos o remitirlos a cualquier autoridad pública o contraparte privada.",
    sec3Title: "3. Uso Aceptable y Restricciones Operativas",
    sec3Intro: "Queda terminantemente prohibido utilizar LeFriApp para:",
    prohibitions: [
      { title: "Actos Ilícitos o Fraude", desc: "Elaborar documentos falsificados, simular contratos fraudulentos o encubrir actividades delictivas." },
      { title: "Ataques Informáticos", desc: "Inyección de prompts maliciosos (jailbreaks), scraping no autorizado o desestabilización de servidores." },
      { title: "Suplantación de Identidad", desc: "Ingresar datos de terceros sin su consentimiento libre, previo y documentado." },
      { title: "Reventa Comercial No Autorizada", desc: "Revender las respuestas gratuitas o lucrar de servicios diseñados para el empoderamiento cívico universal." },
    ],
    sec4Title: "4. Propiedad Intelectual y Derechos sobre el Contenido",
    sec4P1: "Software y Marca: Los algoritmos, código fuente, logotipos, diseño de interfaz y metodologías de RAG son propiedad exclusiva de Fundación Underlife y LeFriApp, protegidos por los tratados internacionales de propiedad intelectual (OMPI/WIPO) y el Código Orgánico de la Economía Social de los Conocimientos (Código Ingenios de Ecuador).",
    sec4P2: "Borradores y Documentos del Usuario: Los escritos, contratos y memoriales redactados por el usuario mediante las herramientas de LeFriApp pertenecen de manera plena al usuario, otorgando a la Plataforma una licencia no exclusiva y técnica únicamente para renderizar, almacenar y posibilitar la descarga de dichos archivos.",
    sec5Title: "5. Limitación Expresa de Responsabilidad por Daños",
    sec5Intro: "En la máxima medida permitida por el ordenamiento jurídico aplicable, ni Fundación Underlife, ni sus directores, desarrolladores, afiliados o proveedores de IA responderán por:",
    sec5Bullets: [
      "Decisiones procesales, administrativas o contractuales tomadas por el usuario sustentadas en las sugerencias generadas.",
      "Preclusión de plazos, caducidad o prescripción de acciones jurídicas causadas por demora del usuario o interrupciones de conectividad.",
      "Pérdida de beneficios comerciales o daños indirectos, incidentales o consecuenciales derivados del uso o imposibilidad de uso del software.",
    ],
    sec6Title: "6. Módulo de Emergencia y Contacto con Autoridades",
    sec6Text: "El Botón de Emergencia es una herramienta digital de orientación sobre garantías constitucionales y emisión de alertas ciudadanas. LeFriApp no reemplaza la llamada inmediata al Servicio Integrado de Seguridad ECU 911 ni a la Policía Nacional. Ante situaciones de riesgo inminente para la vida o integridad personal, el usuario debe comunicarse de forma prioritaria con los servicios de socorro oficiales.",
    sec7Title: "7. Modificaciones a los Términos",
    sec7Text: "LeFriApp se reserva el derecho de actualizar estos términos en caso de reformas normativas o mejoras en la arquitectura del sistema. Las modificaciones entrarán en vigencia a partir de su publicación en el sitio web oficial.",
    sec8Title: "8. Ley Aplicable y Solución de Controversias",
    sec8Text: "Estos Términos se rigen e interpretan con arreglo a las leyes de la República del Ecuador. Cualquier diferendo o discrepancia será sometido en primera instancia a un mecanismo de mediación en un Centro de Mediación legalmente reconocido, y en caso de no acuerdo, a los jueces competentes del cantón de domicilio de la entidad operadora.",
    sec9Title: "9. Contacto y Notificaciones",
    sec9Text: "Para cualquier consulta, requerimiento institucional o notificación sobre estos Términos de Servicio, puede comunicarse con nosotros a través del correo oficial: ",
  },
  en: {
    back: "Back",
    tag: "Legal Framework & Terms of Service",
    title: "General Terms and Conditions of Service",
    subtitle: "Regulations governing the use of the LeFriApp ecosystem, AI-powered legal guidance services, automated drafting, and civic assistance.",
    metaEdition: "Edition: 2026.1 (Full Shielding)",
    metaEffective: "Effectiveness: Immediate upon tacit or explicit acceptance",
    metaOperator: "Operator: Fundación Underlife / LeFriApp",
    disclaimerTitle: "CRITICAL LEGAL NOTICE & DISCLAIMER OF PROFESSIONAL LIABILITY:",
    disclaimer1: "LeFriApp is a technological platform providing informative and civic legal assistance powered by Artificial Intelligence and Retrieval-Augmented Generation (RAG).",
    disclaimer2: "The use of LeFriApp DOES NOT, under any circumstances, constitute the practice of law, formal legal representation before courts, nor does it establish an attorney-client relationship between the user and the platform or its creators.",
    disclaimer3: "Assessments, drafts, preliminary filings, and outputs produced by neural agents are educational guidance and technical drafts based on publicly available legal texts. For formal filing, courtroom representation, or active litigation, users must engage a certified, licensed legal professional authorized in their jurisdiction.",
    sec1Title: "1. Purpose and Scope of Application",
    sec1Text: "These Terms govern access, browsing, and use of the LeFriApp platform, including web interfaces, mobile tools, triage agents, document generation engines, and constitutional knowledge base. By accessing or utilizing any component, the user affirms being of legal age or possessing valid representation, agreeing unconditionally to these provisions.",
    sec2Title: "2. Nature of the Artificial Intelligence Service",
    sec2Text: "The platform operates via a multi-agent architecture synthesizing legal concepts through advanced language models referenced against statutory frameworks.",
    sec2Bullet1Title: "Dynamic Nature of Legislation:",
    sec2Bullet1Text: "While LeFriApp makes continuous efforts to update its knowledge bases, statutes and rulings evolve. The platform does not guarantee complete infallibility or absence of hermeneutic discrepancies.",
    sec2Bullet2Title: "Obligation of Human Oversight:",
    sec2Bullet2Text: "The user assumes sole responsibility for reviewing generated document drafts (Word/Docs/PDF) prior to signing or submitting them to any authority or private party.",
    sec3Title: "3. Acceptable Use and Restrictions",
    sec3Intro: "It is strictly prohibited to use LeFriApp for:",
    prohibitions: [
      { title: "Illicit or Fraudulent Acts", desc: "Producing forged documents, simulating fraudulent agreements, or concealing unlawful acts." },
      { title: "Cyberattacks & Tampering", desc: "Adversarial prompt injections (jailbreaks), scraping, or server destabilization." },
      { title: "Identity Theft & Impersonation", desc: "Submitting third-party data without documented, informed consent." },
      { title: "Unauthorized Commercial Resale", desc: "Reselling free civic answers or commercializing services dedicated to open legal empowerment." },
    ],
    sec4Title: "4. Intellectual Property and Content Rights",
    sec4P1: "Software & Trademarks: Code, algorithms, logos, interface design, and RAG pipelines are the exclusive property of Fundación Underlife and LeFriApp, protected by WIPO international treaties and applicable IP law.",
    sec4P2: "User Drafts & Content: Documents generated by users remain their property, granting LeFriApp only the limited technical license to render, process, and enable downloading.",
    sec5Title: "5. Limitation of Liability",
    sec5Intro: "To the fullest extent permitted by law, neither Fundación Underlife nor its operators, developers, or affiliates shall be held liable for:",
    sec5Bullets: [
      "Procedural, administrative, or commercial decisions made by users based on algorithmic recommendations.",
      "Lapse of procedural deadlines, statutes of limitations, or claims lost due to user delays or connection interruptions.",
      "Loss of profits, incidental, indirect, or consequential damages resulting from the use or inability to use the platform.",
    ],
    sec6Title: "6. Emergency Module & Official Authorities",
    sec6Text: "The Emergency Button is an informative civic aid for constitutional guarantees. LeFriApp DOES NOT replace direct emergency calls to 911 or national law enforcement. In urgent crises involving personal safety, contact local official rescue services immediately.",
    sec7Title: "7. Amendments to Terms",
    sec7Text: "LeFriApp reserves the right to amend these Terms to reflect legislative changes or infrastructure upgrades. Revisions become effective upon publication.",
    sec8Title: "8. Applicable Law and Dispute Resolution",
    sec8Text: "These Terms are governed by applicable Ecuadorian law. Any dispute shall first be submitted to recognized mediation institutions, and failing resolution, to competent judicial authorities in the operator domicile.",
    sec9Title: "9. Contact & Institutional Inquiries",
    sec9Text: "For questions, institutional notices, or inquiries regarding these Terms, contact us at: ",
  },
  pt: {
    back: "Voltar",
    tag: "Marco Jurídico de Operação & Termos de Serviço",
    title: "Termos e Condições Gerais de Uso do Serviço",
    subtitle: "Regulamentação aplicável ao uso do ecossistema LeFriApp, serviços de orientação jurídica algorítmica, redação automatizada e assistência cívica.",
    metaEdition: "Edição: 2026.1 (Blindagem Integral)",
    metaEffective: "Efetividade: Imediata à aceitação tácita ou expressa",
    metaOperator: "Operador: Fundación Underlife / LeFriApp",
    disclaimerTitle: "AVISO LEGAL CRÍTICO E ISENÇÃO DE RESPONSABILIDADE PROFISSIONAL:",
    disclaimer1: "O LeFriApp é uma plataforma tecnológica de assistência jurídica informativa e cívica impulsionada por Inteligência Artificial e Retrieval-Augmented Generation (RAG).",
    disclaimer2: "O uso do LeFriApp NÃO constitui, sob nenhuma hipótese, o exercício formal da advocacia, patrocínio jurídico letrado perante tribunais, nem gera relação advogado-cliente entre o usuário e a plataforma.",
    disclaimer3: "Os diagnósticos, minutas, petições preliminares e respostas geradas pelos agentes neurais são orientações informativas e rascunhos técnicos baseados em normas públicas. Para protocolo formal, defesa em audiências ou litígio judicial, o cidadão deve contar preceptivamente com a assistência de um advogado habilitado.",
    sec1Title: "1. Objeto e Âmbito de Aplicação",
    sec1Text: "Estes Termos regulam o acesso, navegação e utilização da plataforma LeFriApp, compreendendo suas interfaces web, aplicativos móveis, agentes de triagem e geradores de documentos. Ao utilizar o sistema, o usuário declara ter capacidade legal plena e aceitar incondicionalmente estas disposições.",
    sec2Title: "2. Natureza do Serviço de Inteligência Artificial",
    sec2Text: "A plataforma opera com arquitetura multiagente que sintetiza conhecimento normativo mediante modelos de linguagem avançados.",
    sec2Bullet1Title: "Caráter Dinâmico das Leis:",
    sec2Bullet1Text: "Embora o LeFriApp atualize continuamente seus dados vetoriais, as leis e a jurisprudência sofrem alterações frequentes. A plataforma não garante infalibilidade absoluta.",
    sec2Bullet2Title: "Obrigação de Revisão Humana:",
    sec2Bullet2Text: "O usuário assume responsabilidade exclusiva por revisar minutas e documentos exportados antes de assiná-los ou protocolá-los perante qualquer autoridade.",
    sec3Title: "3. Uso Aceitável e Restrições Operacionais",
    sec3Intro: "É estritamente vedado utilizar o LeFriApp para:",
    prohibitions: [
      { title: "Atos Ilícitos ou Fraudes", desc: "Produzir documentos forjados, simular contratos falsos ou encobrir delitos." },
      { title: "Ataques Cibernéticos", desc: "Injeção de prompts maliciosos (jailbreaks), scraping não autorizado ou sobrecarga de servidores." },
      { title: "Falsidade Ideológica", desc: "Inserir dados de terceiros sem consentimento prévio, livre e comprovado." },
      { title: "Revenda Comercial Indevida", desc: "Comercializar respostas ou monetizar indevidamente ferramentas cívicas de acesso aberto." },
    ],
    sec4Title: "4. Propriedade Intelectual e Direitos de Conteúdo",
    sec4P1: "Software e Marca: Algoritmos, código-fonte, marcas e fluxos de RAG são propriedade exclusiva da Fundación Underlife e LeFriApp, resguardados por tratados internacionais de PI.",
    sec4P2: "Minutas e Documentos do Usuário: As peças geradas pelo cidadão pertencem integralmente a ele, concedendo ao sistema apenas a licença estritamente técnica para exibição e download.",
    sec5Title: "5. Limitação Expressa de Responsabilidade",
    sec5Intro: "Na máxima extensão permitida pela legislação, nem a Fundación Underlife nem seus mantenedores respondem por:",
    sec5Bullets: [
      "Decisões processuais ou contratuais tomadas pelo usuário com base nas informações emitidas.",
      "Perda de prazos judiciais ou decadência de direitos em razão de atrasos ou indisponibilidade de rede.",
      "Lucros cessantes ou danos indiretos decorrentes da utilização da plataforma.",
    ],
    sec6Title: "6. Módulo de Emergência e Serviços Oficiais",
    sec6Text: "O Botão de Emergência é um recurso cívico informativo. O LeFriApp NÃO substitui o contato direto com o 911 ou autoridades policiais. Em perigo iminente à integridade física, acione imediatamente os socorros oficiais.",
    sec7Title: "7. Atualizações dos Termos",
    sec7Text: "O LeFriApp pode atualizar estes termos periodicamente. As mudanças passam a vigorar imediatamente após veiculação na plataforma.",
    sec8Title: "8. Legislação Aplicável e Foro",
    sec8Text: "Estes termos são regidos pelas leis da República do Equador. Eventuais litígios serão primeiramente submetidos a procedimento de mediação credenciado.",
    sec9Title: "9. Contato Institucional",
    sec9Text: "Para requerimentos institucionais, esclarecimentos ou notificações sobre estes Termos, utilize nosso canal oficial: ",
  },
};

export default function TerminosServicio() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = content[language] || content.es;

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
              <Scale className="w-3.5 h-3.5" />
              <span>{t.tag}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t.subtitle}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><strong>{t.metaEdition}</strong></span>
              <span>&bull;</span>
              <span><strong>{t.metaEffective}</strong></span>
              <span>&bull;</span>
              <span><strong>{t.metaOperator}</strong></span>
            </div>
          </div>

          {/* CRITICAL DISCLAIMER / BLINDAJE REGULATORIO */}
          <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{t.disclaimerTitle}</span>
            </div>
            <p>{t.disclaimer1}</p>
            <p className="font-medium text-amber-100">{t.disclaimer2}</p>
            <p>{t.disclaimer3}</p>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            
            {/* 1. Objeto */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec1Title}
              </h2>
              <p>{t.sec1Text}</p>
            </section>

            {/* 2. Naturaleza del Servicio */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec2Title}
              </h2>
              <p>{t.sec2Text}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>{t.sec2Bullet1Title}</strong> {t.sec2Bullet1Text}</li>
                <li><strong>{t.sec2Bullet2Title}</strong> {t.sec2Bullet2Text}</li>
              </ul>
            </section>

            {/* 3. Uso Permitido y Prohibiciones */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec3Title}
              </h2>
              <p>{t.sec3Intro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-2">
                {t.prohibitions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-rose-400 font-semibold block">{item.title}</span>
                    <span className="text-slate-400">{item.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Propiedad Intelectual */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec4Title}
              </h2>
              <p>{t.sec4P1}</p>
              <p>{t.sec4P2}</p>
            </section>

            {/* 5. Limitación de Responsabilidad */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec5Title}
              </h2>
              <p>{t.sec5Intro}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                {t.sec5Bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </section>

            {/* 6. Módulo de Emergencia */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec6Title}
              </h2>
              <p>{t.sec6Text}</p>
            </section>

            {/* 7. Modificaciones */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec7Title}
              </h2>
              <p>{t.sec7Text}</p>
            </section>

            {/* 8. Ley Aplicable y Jurisdicción */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec8Title}
              </h2>
              <p>{t.sec8Text}</p>
            </section>

            {/* 9. Contacto Oficial */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.sec9Title}
              </h2>
              <p>
                {t.sec9Text}
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
