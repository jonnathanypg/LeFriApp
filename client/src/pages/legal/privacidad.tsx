import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Shield, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PoliticaPrivacidad() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const content = {
    es: {
      back: "Volver",
      badge: "Garantía de Privacidad & Cumplimiento Normativo",
      title: "Política Integral de Privacidad y Tratamiento de Datos Personales",
      subtitle: "Conforme a la Ley Orgánica de Protección de Datos Personales de Ecuador (LOPDP), RGPD/GDPR (Unión Europea) y directrices de protección de datos en Latinoamérica y EE.UU.",
      version: "Versión: 2.4.0 (Blindaje Regulatorio 2026)",
      updated: "Última actualización: 8 de Septiembre de 2026",
      controller: "Responsable: Fundación Underlife & LeFriApp LegalTech",
      commitmentTitle: "Compromiso Cívico de No Comercialización:",
      commitmentDesc: "LeFriApp nunca comercializa, sublicencia ni monetiza los datos personales, consultas ciudadanas, registros de voz ni documentos legales generados. Toda la información es tratada bajo estrictas medidas de seguridad técnica y jurídica para fines exclusivos de orientación y soporte al titular.",
      s1Title: "1. Identidad y Contacto del Responsable del Tratamiento",
      s1Desc: "El responsable del tratamiento de sus datos personales es Fundación Underlife en articulación operativa y técnica con la plataforma de acceso a la justicia cívica LeFriApp.",
      s1Entity: "Entidad:",
      s1Dpo: "Delegado de Protección de Datos (DPO / DPD):",
      s1DpoRole: "Oficial de Cumplimiento Normativo y Privacidad",
      s1Email: "Correo de Contacto Oficial DPO / Privacidad:",
      s1Jurisdiction: "Ámbito Jurisdiccional:",
      s1JurisdictionDesc: "República del Ecuador (con alcance extraterritorial para ciudadanos en el exterior conforme al art. 3 LOPDP y art. 3 RGPD).",
      s2Title: "2. Principios Rectores del Tratamiento de Datos",
      s2Desc: "Todo tratamiento realizado en LeFriApp se rige rigurosamente por los principios consagrados en el artículo 10 de la LOPDP y el artículo 5 del RGPD:",
      s2p1: "Juridicidad y Lealtad",
      s2p1d: "Tratamiento estrictamente apegado a la Constitución y leyes vigentes.",
      s2p2: "Minimización de Datos",
      s2p2d: "Solo recolectamos datos estrictamente indispensables y pertinentes.",
      s2p3: "Limitación de la Finalidad",
      s2p3d: "Los datos no se usan para fines incompatibles con la orientación legal.",
      s2p4: "Seguridad y Confidencialidad",
      s2p4d: "Cifrado de grado bancario (TLS 1.3, AES-256 en reposo) y secreto profesional digital.",
      s3Title: "3. Categorías de Datos Recopilados y Fines",
      s3Desc: "Dependiendo del módulo o servicio utilizado (Consulta Ciudadana, Asistente Constitucional, Generador de Documentos o Botón de Emergencia), recopilamos:",
      s3c1: "A. Datos de Identificación y Contacto",
      s3c1d: "Nombres, apellidos, dirección de correo electrónico, número de teléfono (en caso de registro para alertas o derivación voluntaria) y país de residencia.",
      s3c2: "B. Hechos Fácticos y Consultas Jurídicas",
      s3c2d: "Relato de hechos, incidentes, fechas, lugares y preguntas formuladas en el chat o wizard con el fin de generar el triaje algorítmico y fundamentación constitucional.",
      s3c3: "C. Grabaciones de Voz y Audio (MediaSuite)",
      s3c3d: "Cuando utiliza la función de dictado o consulta por voz, el audio es procesado en tiempo real exclusivamente para transcribir el contenido fáctico a texto mediante modelos de IA. El fragmento de audio no se conserva permanentemente tras la transcripción.",
      s3c4: "D. Datos Técnicos y de Conectividad",
      s3c4d: "Dirección IP anonimizada, metadatos de sesión (guestId con rotación criptográfica), agente de usuario y registros de seguridad contra ataques DDoS y accesos indebidos.",
      s4Title: "4. Base Jurídica del Tratamiento",
      s4Desc: "El tratamiento de sus datos personales se fundamenta en las siguientes bases legales (art. 7 LOPDP y art. 6 RGPD):",
      s4b1: "Consentimiento Expreso e Informado:",
      s4b1d: "Otorgado por el usuario al enviar sus consultas, subir documentos o utilizar herramientas de voz.",
      s4b2: "Ejecución Contractual o Precontractual:",
      s4b2d: "Prestación directa del servicio digital de asistencia cívica y generación de documentos jurídicos.",
      s4b3: "Cumplimiento de Obligaciones Legales:",
      s4b3d: "Retención de registros mínimos para garantizar la trazabilidad forense y auditoría requerida por entes reguladores.",
      s4b4: "Protección de Intereses Vitales:",
      s4b4d: "En la activación de protocolos de emergencia frente a flagrancia, detenciones arbitrarias o violencia de género.",
      s5Title: "5. Integraciones con Terceros y Transferencias Internacionales",
      s5Desc: "Para brindar un servicio de alta disponibilidad y tecnología agéntica de vanguardia, LeFriApp emplea proveedores de infraestructura que cumplen con estándares internacionales de privacidad (SOC2 Tipo II, ISO 27001 y Cláusulas Contractuales Tipo de la Comisión Europea):",
      s5p1: "Google Cloud Platform & Google Docs API: Para almacenamiento seguro y exportación voluntaria de documentos cuando el usuario autoriza explícitamente OAuth 2.0.",
      s5p2: "Proveedores de Modelos de Inteligencia Artificial (LLMs): Los prompts enviados a modelos neuronales son anonimizados y procesados bajo acuerdos de confidencialidad empresarial donde los datos del usuario NO se utilizan para reentrenar modelos públicos.",
      s5p3: "Infraestructura de Bases de Datos (MySQL / Prisma ORM): Alojada en entornos dedicados y aislados con cifrado en reposo y copias de respaldo automatizadas.",
      s5secTitle: "Arquitectura Técnica de Seguridad y Cifrado de Datos",
      s5secDesc: "En apego al artículo 40 de la LOPDP y artículo 32 del RGPD sobre la seguridad del tratamiento, LeFriApp aplica una política de defensa en profundidad:",
      s5sec1: "Cifrado en Tránsito (TLS 1.3 / HTTPS):",
      s5sec1d: "Todo el tráfico web y peticiones de API están blindados con certificados SSL/TLS y cifrado robusto para impedir interceptaciones en red.",
      s5sec2: "Cifrado Simétrico en Reposo (AES-256-GCM):",
      s5sec2d: "Los datos altamente confidenciales (contactos de emergencia, teléfonos, credenciales) son encriptados en la capa de aplicación con vectores de inicialización dinámicos y autenticación criptográfica.",
      s5sec3: "Hashes Criptográficos Unidireccionales (SHA-256):",
      s5sec3d: "Búsquedas e indexaciones seguras mediante hashes criptográficos no reversibles, evitando búsquedas en texto plano.",
      s5sec4: "Aislamiento y Destrucción Criptográfica:",
      s5sec4d: "Sesiones temporales blindadas mediante cookies con atributos HttpOnly, SameSite=Lax y borrado seguro tras la revocación del consentimiento.",
      s6Title: "6. Derechos del Titular de Datos (Derechos ARCO+)",
      s6Desc: "De acuerdo con la legislación vigente, usted tiene derecho a ejercer en cualquier momento y de forma totalmente gratuita sus facultades de:",
      s6r1: "Acceso:",
      s6r1d: "Conocer con exactitud qué datos personales suyos reposan en nuestros sistemas.",
      s6r2: "Rectificación y Actualización:",
      s6r2d: "Modificar información inexacta, incompleta o desactualizada.",
      s6r3: "Eliminación / Cancelación:",
      s6r3d: "Solicitar la supresión definitiva de su expediente y cuenta ('derecho al olvido').",
      s6r4: "Oposición y Portabilidad:",
      s6r4d: "Oponerse al tratamiento o recibir sus expedientes en un formato estructurado e interoperable (JSON/XML/PDF).",
      s6Contact: "Para ejercer cualquiera de estos derechos, basta con enviar una solicitud indicando su nombre y correo registrado a",
      s6Time: "Su solicitud será atendida en un plazo máximo legal de 15 días hábiles.",
      s7Title: "7. Plazos de Retención de la Información",
      s7Desc: "Los datos de consultas y procesos activos se conservarán durante el tiempo que la cuenta del usuario permanezca activa o mientras sea necesario para prestar el servicio de acompañamiento legal cívico. Si un usuario solicita la baja de su cuenta, todos sus expedientes, audios y metadatos asociados son destruidos de manera criptográficamente irreversible en un plazo máximo de 30 días naturales.",
      s8Title: "8. Autoridad de Control Competente",
      s8Desc: "Sin perjuicio de cualquier otro recurso administrativo o acción judicial, si considera que el tratamiento de sus datos infringe la normativa aplicable, tiene derecho a presentar un reclamo ante la Superintendencia de Protección de Datos Personales de la República del Ecuador o ante la autoridad de control de protección de datos de su lugar de residencia habitual."
    },
    en: {
      back: "Back",
      badge: "Privacy Guarantee & Regulatory Compliance",
      title: "Comprehensive Privacy Policy & Personal Data Protection",
      subtitle: "In accordance with Ecuador's Organic Law on Personal Data Protection (LOPDP), EU GDPR, and Latin American & US data privacy standards.",
      version: "Version: 2.4.0 (Regulatory Shield 2026)",
      updated: "Last updated: September 8, 2026",
      controller: "Controller: Fundación Underlife & LeFriApp LegalTech",
      commitmentTitle: "Civic Non-Commercialization Commitment:",
      commitmentDesc: "LeFriApp never commercializes, sublicenses, or monetizes personal data, citizen consultations, voice notes, or generated legal drafts. All information is managed under strict technical and legal measures solely to assist the data subject.",
      s1Title: "1. Identity and Contact Information of the Data Controller",
      s1Desc: "The entity responsible for processing your personal data is Fundación Underlife, operating technically through the civic justice access platform LeFriApp.",
      s1Entity: "Entity:",
      s1Dpo: "Data Protection Officer (DPO):",
      s1DpoRole: "Chief Privacy & Regulatory Compliance Officer",
      s1Email: "Official DPO / Privacy Contact:",
      s1Jurisdiction: "Jurisdiction:",
      s1JurisdictionDesc: "Republic of Ecuador (with extraterritorial scope for citizens abroad under Art. 3 LOPDP and Art. 3 GDPR).",
      s2Title: "2. Core Principles of Data Processing",
      s2Desc: "All processing carried out in LeFriApp strictly complies with the principles set out in Art. 10 of LOPDP and Art. 5 of GDPR:",
      s2p1: "Lawfulness and Fairness",
      s2p1d: "Processing strictly aligned with constitutional principles and applicable law.",
      s2p2: "Data Minimization",
      s2p2d: "We only collect data strictly necessary and relevant for the service.",
      s2p3: "Purpose Limitation",
      s2p3d: "Data is never repurposed for goals incompatible with legal orientation.",
      s2p4: "Security and Confidentiality",
      s2p4d: "Bank-grade encryption (TLS 1.3, AES-256 at rest) and digital professional secrecy.",
      s3Title: "3. Categories of Data Collected and Purposes",
      s3Desc: "Depending on the module utilized (Citizen Consultation, Constitutional Tutor, Document Generator, or Emergency Button), we collect:",
      s3c1: "A. Contact and Identification Data",
      s3c1d: "Full name, email address, telephone number (when voluntarily registered for alerts or referrals), and country.",
      s3c2: "B. Factual Narratives and Legal Consultations",
      s3c2d: "Descriptions of events, timelines, locations, and legal queries used to perform AI algorithmic triage and constitutional guidance.",
      s3c3: "C. Voice and Audio Recordings (MediaSuite)",
      s3c3d: "When using voice dictation, audio is processed in real time solely to transcribe speech to text. Audio files are not permanently stored after transcription.",
      s3c4: "D. Technical and Connection Data",
      s3c4d: "Anonymized IP addresses, session identifiers with cryptographic rotation, user-agent details, and anti-DDoS protection telemetry.",
      s4Title: "4. Legal Basis for Processing",
      s4Desc: "The processing of your personal data is legally grounded under Art. 7 LOPDP and Art. 6 GDPR:",
      s4b1: "Explicit and Informed Consent:",
      s4b1d: "Granted by the user upon submitting queries, documents, or voice notes.",
      s4b2: "Contractual / Precontractual Execution:",
      s4b2d: "Providing the civic guidance platform and automated document drafting features.",
      s4b3: "Compliance with Legal Obligations:",
      s4b3d: "Retaining necessary audit trails required by oversight authorities.",
      s4b4: "Protection of Vital Interests:",
      s4b4d: "Activating emergency protocols during arrest, domestic violence, or imminent danger.",
      s5Title: "5. Third-Party Integrations & International Transfers",
      s5Desc: "To ensure enterprise reliability, LeFriApp partners with SOC2 Type II and ISO 27001 certified cloud infrastructure providers:",
      s5p1: "Google Cloud Platform & Google Docs API: Secure document export authorized via OAuth 2.0.",
      s5p2: "Artificial Intelligence LLM Providers: Queries sent to neural models are anonymized and protected under enterprise agreements where user data is NEVER used to train public models.",
      s5p3: "Database Infrastructure (MySQL / Prisma ORM): Hosted in isolated environments with automated encryption at rest and backups.",
      s5secTitle: "Technical Security Architecture & Data Encryption",
      s5secDesc: "Pursuant to Art. 40 LOPDP and Art. 32 GDPR regarding security of processing, LeFriApp enforces defense-in-depth:",
      s5sec1: "Encryption in Transit (TLS 1.3 / HTTPS):",
      s5sec1d: "All web traffic and API payloads are encrypted with modern SSL/TLS suites preventing eavesdropping.",
      s5sec2: "Symmetric Encryption at Rest (AES-256-GCM):",
      s5sec2d: "High-sensitivity fields (emergency contacts, phone numbers, tokens) are encrypted with dynamic IVs and auth tags.",
      s5sec3: "One-Way Cryptographic Hashes (SHA-256):",
      s5sec3d: "Indexing and lookup are performed over irreversible cryptographic hashes to prevent plaintext queries.",
      s5sec4: "Session Isolation & Cryptographic Purge:",
      s5sec4d: "HttpOnly, SameSite=Lax protected cookies and guaranteed deletion upon consent revocation.",
      s6Title: "6. Data Subject Rights (ARCO+ Rights)",
      s6Desc: "Under applicable regulations, you have the full right to exercise free of charge:",
      s6r1: "Access:",
      s6r1d: "Learn what personal data of yours is processed in our records.",
      s6r2: "Rectification and Update:",
      s6r2d: "Correct incomplete, outdated, or inaccurate information.",
      s6r3: "Erasure / Deletion:",
      s6r3d: "Request permanent removal of your account and file data ('Right to be Forgotten').",
      s6r4: "Opposition and Portability:",
      s6r4d: "Object to processing or obtain your file data in interoperable formats (JSON/PDF).",
      s6Contact: "To exercise any of these rights, send a written request with your registered email to",
      s6Time: "Your request will be officially processed within the statutory 15 business days.",
      s7Title: "7. Data Retention Periods",
      s7Desc: "Active consultation records are retained while the user account remains open or as needed to provide civic assistance. Upon account closure, all associated records, transcripts, and metadata are cryptographically purged within 30 calendar days.",
      s8Title: "8. Competent Supervisory Authority",
      s8Desc: "You have the right to lodge a complaint with the Superintendencia de Protección de Datos Personales of Ecuador or your local data protection regulator if you consider that processing infringes applicable privacy regulations."
    },
    pt: {
      back: "Voltar",
      badge: "Garantia de Privacidade & Conformidade Legal",
      title: "Política Integral de Privacidade e Proteção de Dados Pessoais",
      subtitle: "Em conformidade com a LOPDP do Equador, RGPD/GDPR da União Europeia e normas latino-americanas de proteção de dados.",
      version: "Versão: 2.4.0 (Blindagem Regulatória 2026)",
      updated: "Última atualização: 8 de Setembro de 2026",
      controller: "Controlador: Fundación Underlife & LeFriApp LegalTech",
      commitmentTitle: "Compromisso Cívico de Não Comercialização:",
      commitmentDesc: "O LeFriApp nunca comercializa, licencia ou monetiza dados pessoais, consultas jurídicas, gravações de voz ou documentos gerados. Todas as informações são geridas sob estrita segurança técnica para orientação cidadã.",
      s1Title: "1. Identidade e Contato do Controlador de Dados",
      s1Desc: "A entidade responsável pelo tratamento de seus dados é a Fundación Underlife em articulação com a plataforma cívica LeFriApp.",
      s1Entity: "Entidade:",
      s1Dpo: "Encarregado de Proteção de Dados (DPO):",
      s1DpoRole: "Diretor de Conformidade Normativa e Privacidade",
      s1Email: "E-mail Oficial DPO / Privacidade:",
      s1Jurisdiction: "Jurisdição:",
      s1JurisdictionDesc: "República do Equador (com alcance extraterritorial conforme o art. 3 da LOPDP e art. 3 do RGPD).",
      s2Title: "2. Princípios Norteadores do Tratamento",
      s2Desc: "Todo tratamento no LeFriApp rege-se rigorosamente pelos princípios do art. 10 da LOPDP e art. 5 do RGPD:",
      s2p1: "Juridicidade e Lealdade",
      s2p1d: "Tratamento estritamente alinhado à Constituição e às leis vigentes.",
      s2p2: "Minimização de Dados",
      s2p2d: "Coleta restrita ao estritamente indispensável para a orientação jurídica.",
      s2p3: "Limitação da Finalidade",
      s2p3d: "Os dados não são usados para finalidades incompatíveis com o suporte legal.",
      s2p4: "Segurança e Confidencialidade",
      s2p4d: "Criptografia de padrão militar (TLS 1.3, AES-256) e sigilo profissional digital.",
      s3Title: "3. Categorias de Dados Coletados e Finalidades",
      s3Desc: "Conforme o módulo utilizado (Consulta Cidadã, Estudo Constitucional, Documentos ou Emergência), coletamos:",
      s3c1: "A. Dados de Identificação e Contato",
      s3c1d: "Nome completo, e-mail, telefone (quando cadastrado para alertas ou atendimento) e país.",
      s3c2: "B. Relatos Fáticos e Dúvidas Jurídicas",
      s3c2d: "Relato dos fatos, datas, locais e perguntas para subsidiar o diagnóstico de triagem e fundamentação constitucional.",
      s3c3: "C. Gravações de Voz e Áudio (MediaSuite)",
      s3c3d: "O áudio é processado em tempo real exclusivamente para transcrever a voz em texto. O áudio não é mantido após a transcrição.",
      s3c4: "D. Dados Técnicos e de Conectividade",
      s3c4d: "Endereço IP anonimizado, identificadores de sessão com rotação criptográfica e telemetria anti-DDoS.",
      s4Title: "4. Base Legal do Tratamento",
      s4Desc: "O tratamento apoia-se nas seguintes bases legais (art. 7 LOPDP e art. 6 RGPD):",
      s4b1: "Consentimento Expresso e Informado:",
      s4b1d: "Manifestado pelo usuário ao submeter perguntas, arquivos ou voz.",
      s4b2: "Execução Contratual ou Pré-contratual:",
      s4b2d: "Prestação direta da orientação jurídica cívica e geração de minutas.",
      s4b3: "Cumprimento de Obrigação Legal:",
      s4b3d: "Manutenção de registros mínimos para auditoria conforme exigido por reguladores.",
      s4b4: "Proteção de Interesses Vitais:",
      s4b4d: "Acionamento de redes de apoio em emergências de violência ou prisões ilegais.",
      s5Title: "5. Integrações com Terceiros e Transferências Internacionais",
      s5Desc: "Para assegurar alta confiabilidade, o LeFriApp utiliza infraestrutura certificada SOC2 Tipo II e ISO 27001:",
      s5p1: "Google Cloud Platform & Google Docs API: Armazenamento seguro e exportação de documentos sob autorização OAuth 2.0.",
      s5p2: "Provedores de Inteligência Artificial (LLMs): Prompts anonimizados onde os dados do usuário NUNCA são usados para treinar modelos públicos.",
      s5p3: "Bancos de Dados (MySQL / Prisma ORM): Hospedados em ambientes dedicados e isolados com criptografia em repouso.",
      s5secTitle: "Arquitetura Técnica de Segurança e Criptografia",
      s5secDesc: "Em atendimento ao art. 40 da LOPDP e art. 32 do RGPD, aplicamos defesa em profundidade:",
      s5sec1: "Criptografia em Trânsito (TLS 1.3 / HTTPS):",
      s5sec1d: "Todo o tráfego web e APIs são protegidos com certificados modernos contra interceptações.",
      s5sec2: "Criptografia Simétrica em Repouso (AES-256-GCM):",
      s5sec2d: "Campos confidenciais (contatos, telefones, chaves) são criptografados com vetores dinâmicos e autenticação.",
      s5sec3: "Hashes Criptográficos Unidirecionais (SHA-256):",
      s5sec3d: "Consultas efetuadas através de hashes não reversíveis para evitar buscas em texto puro.",
      s5sec4: "Isolamento de Sessão e Eliminação Segura:",
      s5sec4d: "Cookies com atributos HttpOnly, SameSite=Lax e exclusão definitiva após revogação de consentimento.",
      s6Title: "6. Direitos do Titular de Dados (Direitos ARCO+)",
      s6Desc: "O titular possui o direito de exercer gratuitamente e a qualquer momento:",
      s6r1: "Acesso:",
      s6r1d: "Saber quais dados pessoais constam em nossas plataformas.",
      s6r2: "Retificação e Atualização:",
      s6r2d: "Corrigir informações inexatas ou desatualizadas.",
      s6r3: "Eliminação:",
      s6r3d: "Requerer a exclusão de sua conta e histórico ('direito ao esquecimento').",
      s6r4: "Oposição e Portabilidade:",
      s6r4d: "Opor-se ao tratamento ou receber seus arquivos em formatos interoperáveis (JSON/PDF).",
      s6Contact: "Para exercer seus direitos, envie solicitação com seu e-mail registrado para",
      s6Time: "Sua solicitação será respondida no prazo legal de até 15 dias úteis.",
      s7Title: "7. Prazos de Retenção",
      s7Desc: "Os dados de consultas ativas permanecem armazenados enquanto a conta estiver ativa. Ao solicitar encerramento, todos os dados são excluídos criptograficamente em até 30 dias corridos.",
      s8Title: "8. Autoridade de Controle Competente",
      s8Desc: "Você tem o direito de apresentar requerimento perante a Superintendência de Proteção de Dados do Equador ou autoridade competente do seu país caso considere que o tratamento violou as normas de privacidade."
    }
  };

  const t = content[language as 'es' | 'en' | 'pt'] || content.es;

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
          <span>{t.back}</span>
        </Button>

        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t.subtitle}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><strong>{t.version}</strong></span>
              <span>&bull;</span>
              <span><strong>{t.updated}</strong></span>
              <span>&bull;</span>
              <span><strong>{t.controller}</strong></span>
            </div>
          </div>

          {/* Legal Notice Callout */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm leading-relaxed flex items-start space-x-3">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">{t.commitmentTitle}</strong>
              {t.commitmentDesc}
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s1Title}
              </h2>
              <p>{t.s1Desc}</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
                <li><strong>{t.s1Entity}</strong> Fundación Underlife / Proyecto LeFriApp</li>
                <li><strong>{t.s1Dpo}</strong> {t.s1DpoRole}</li>
                <li><strong>{t.s1Email}</strong> <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">lefri@fundacionunderlife.org</a></li>
                <li><strong>{t.s1Jurisdiction}</strong> {t.s1JurisdictionDesc}</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s2Title}
              </h2>
              <p>{t.s2Desc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">{t.s2p1}</span>
                  <span className="text-xs text-slate-400">{t.s2p1d}</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">{t.s2p2}</span>
                  <span className="text-xs text-slate-400">{t.s2p2d}</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">{t.s2p3}</span>
                  <span className="text-xs text-slate-400">{t.s2p3d}</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-white block text-sm">{t.s2p4}</span>
                  <span className="text-xs text-slate-400">{t.s2p4d}</span>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s3Title}
              </h2>
              <p>{t.s3Desc}</p>
              <div className="space-y-2 text-sm">
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">{t.s3c1}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t.s3c1d}</p>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">{t.s3c2}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t.s3c2d}</p>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">{t.s3c3}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t.s3c3d}</p>
                </div>
                <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <h4 className="font-semibold text-indigo-300">{t.s3c4}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t.s3c4d}</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s4Title}
              </h2>
              <p>{t.s4Desc}</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                <li><strong>{t.s4b1}</strong> {t.s4b1d}</li>
                <li><strong>{t.s4b2}</strong> {t.s4b2d}</li>
                <li><strong>{t.s4b3}</strong> {t.s4b3d}</li>
                <li><strong>{t.s4b4}</strong> {t.s4b4d}</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s5Title}
              </h2>
              <p>{t.s5Desc}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-300">
                <li>{t.s5p1}</li>
                <li>{t.s5p2}</li>
                <li>{t.s5p3}</li>
              </ul>

              {/* Medidas Técnicas y Cifrado */}
              <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {t.s5secTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.s5secDesc}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">{t.s5sec1}</strong>
                    <span className="text-slate-400">{t.s5sec1d}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">{t.s5sec2}</strong>
                    <span className="text-slate-400">{t.s5sec2d}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">{t.s5sec3}</strong>
                    <span className="text-slate-400">{t.s5sec3d}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                    <strong className="text-indigo-300 block">{t.s5sec4}</strong>
                    <span className="text-slate-400">{t.s5sec4d}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s6Title}
              </h2>
              <p>{t.s6Desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">{t.s6r1}</strong>
                  <span className="text-xs text-slate-400">{t.s6r1d}</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">{t.s6r2}</strong>
                  <span className="text-xs text-slate-400">{t.s6r2d}</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">{t.s6r3}</strong>
                  <span className="text-xs text-slate-400">{t.s6r3d}</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-indigo-300 block">{t.s6r4}</strong>
                  <span className="text-xs text-slate-400">{t.s6r4d}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-2">
                {t.s6Contact} <a href="mailto:lefri@fundacionunderlife.org" className="text-indigo-400 underline font-medium">lefri@fundacionunderlife.org</a>. {t.s6Time}
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s7Title}
              </h2>
              <p>{t.s7Desc}</p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.s8Title}
              </h2>
              <p>{t.s8Desc}</p>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
