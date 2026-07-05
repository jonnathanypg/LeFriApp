// Translation system for multi-language support
export interface Translations {
  // Navigation
  dashboard: string;
  consultation: string;
  process: string;
  emergency: string;
  profile: string;
  logout: string;

  // Auth
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  continueWithGoogle: string;
  orContinueWith: string;
  termsOfService: string;
  privacyPolicy: string;
  byCreating: string;
  and: string;
  signingIn: string;
  creatingAccount: string;
  authenticating: string;

  // Dashboard
  welcomeTitle: string;
  welcomeSubtitle: string;
  recentConsultations: string;
  activeProcesses: string;
  emergencyContacts: string;
  quickActions: string;
  askQuestion: string;
  startProcess: string;
  addContact: string;
  viewAll: string;
  noConsultations: string;
  noProcesses: string;
  noContacts: string;

  // Consultation
  legalAssistant: string;
  askLegalQuestion: string;
  typeQuestion: string;
  quickQuestions: string;
  thinking: string;
  confidence: string;
  sources: string;
  relevance: string;

  // Process
  legalProcesses: string;
  processTitle: string;
  processDescription: string;
  currentStep: string;
  totalSteps: string;
  status: string;
  startNewProcess: string;
  continueProcess: string;

  // Emergency
  emergencyAlert: string;
  emergencyDescription: string;
  activateEmergency: string;
  emergencyActivated: string;
  location: string;
  contacts: string;

  // Profile
  personalInfo: string;
  language: string;
  country: string;
  saveChanges: string;
  changesSaved: string;

  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  back: string;
  next: string;
  previous: string;
  close: string;
  search: string;
  filter: string;
  clear: string;
  refresh: string;

  // Legal Consultation
  quickQuestion1: string;
  quickQuestion2: string;
  quickQuestion3: string;
  quickQuestion4: string;
  legalResources: string;
  constitution: string;
  civilCode: string;
  updated: string;
  noActivity: string;
}

const translations: Record<string, any> = {
  es: {
    // Navigation
    dashboard: "Panel",
    consultation: "Consulta",
    process: "Proceso",
    emergency: "Emergencia",
    profile: "Perfil",
    logout: "Cerrar Sesión",

    // Auth
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    fullName: "Nombre Completo",
    createAccount: "Crear Cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    dontHaveAccount: "¿No tienes una cuenta?",
    continueWithGoogle: "Continuar con Google",
    orContinueWith: "O continúa con",
    termsOfService: "Términos de Servicio",
    privacyPolicy: "Política de Privacidad",
    byCreating: "Al continuar, aceptas nuestros",
    and: "y",
    signingIn: "Iniciando sesión...",
    creatingAccount: "Creando cuenta...",
    authenticating: "Autenticando...",

    // Dashboard
    welcomeTitle: "Bienvenido a LeFriAI",
    welcomeSubtitle: "Tu asistente legal inteligente",
    recentConsultations: "Consultas Recientes",
    activeProcesses: "Procesos Activos",
    emergencyContacts: "Contactos de Emergencia",
    quickActions: "Acciones Rápidas",
    askQuestion: "Hacer Pregunta",
    startProcess: "Iniciar Proceso",
    addContact: "Agregar Contacto",
    viewAll: "Ver Todo",
    noConsultations: "No hay consultas recientes",
    noProcesses: "No hay procesos activos",
    noContacts: "No hay contactos de emergencia",

    // Consultation
    legalAssistant: "Asistente Legal",
    askLegalQuestion: "¡Hola! Soy tu asistente legal",
    typeQuestion: "Escribe tu consulta legal...",
    quickQuestions: "Preguntas Frecuentes",
    thinking: "Pensando...",
    confidence: "Confianza",
    sources: "Fuentes",
    relevance: "relevancia",

    // Process
    legalProcesses: "Procesos Legales",
    processTitle: "Título del Proceso",
    processDescription: "Descripción",
    currentStep: "Paso Actual",
    totalSteps: "Pasos Totales",
    status: "Estado",
    startNewProcess: "Iniciar Nuevo Proceso",
    continueProcess: "Continuar Proceso",

    // Emergency
    emergencyAlert: "Alerta de Emergencia",
    emergencyDescription: "Activa una alerta de emergencia que notificará a tus contactos",
    activateEmergency: "Activar Emergencia",
    emergencyActivated: "Emergencia Activada",
    location: "Ubicación",
    contacts: "Contactos",

    // Profile
    personalInfo: "Información Personal",
    language: "Idioma",
    country: "País",
    saveChanges: "Guardar Cambios",
    changesSaved: "Cambios guardados exitosamente",

    // Common
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    remove: "Remover",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    close: "Cerrar",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    refresh: "Actualizar",

    // Legal Consultation
    quickQuestion1: "¿Cuáles son mis derechos laborales básicos?",
    quickQuestion2: "¿Cómo puedo iniciar un proceso de divorcio?",
    quickQuestion3: "¿Qué debo hacer si no recibo mi salario?",
    quickQuestion4: "¿Cuáles son los derechos del inquilino?",
    legalResources: "Recursos Legales",
    constitution: "Constitución Nacional",
    civilCode: "Código Civil",
    updated: "Actualizado",
    noActivity: "Aún no hay consultas. Comience preguntando una pregunta legal.",
  },

  en: {
    // Navigation
    dashboard: "Dashboard",
    consultation: "Consultation",
    process: "Process",
    emergency: "Emergency",
    profile: "Profile",
    logout: "Logout",

    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    continueWithGoogle: "Continue with Google",
    orContinueWith: "Or continue with",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    byCreating: "By continuing, you agree to our",
    and: "and",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    authenticating: "Authenticating...",

    // Dashboard
    welcomeTitle: "Welcome to LeFriAI",
    welcomeSubtitle: "Your intelligent legal assistant",
    recentConsultations: "Recent Consultations",
    activeProcesses: "Active Processes",
    emergencyContacts: "Emergency Contacts",
    quickActions: "Quick Actions",
    askQuestion: "Ask Question",
    startProcess: "Start Process",
    addContact: "Add Contact",
    viewAll: "View All",
    noConsultations: "No recent consultations",
    noProcesses: "No active processes",
    noContacts: "No emergency contacts",

    // Consultation
    legalAssistant: "Legal Assistant",
    askLegalQuestion: "Hello! I'm your legal assistant",
    typeQuestion: "Type your legal question...",
    quickQuestions: "Quick Questions",
    thinking: "Thinking...",
    confidence: "Confidence",
    sources: "Sources",
    relevance: "relevance",

    // Process
    legalProcesses: "Legal Processes",
    processTitle: "Process Title",
    processDescription: "Description",
    currentStep: "Current Step",
    totalSteps: "Total Steps",
    status: "Status",
    startNewProcess: "Start New Process",
    continueProcess: "Continue Process",

    // Emergency
    emergencyAlert: "Emergency Alert",
    emergencyDescription: "Activate an emergency alert that will notify your contacts",
    activateEmergency: "Activate Emergency",
    emergencyActivated: "Emergency Activated",
    location: "Location",
    contacts: "Contacts",

    // Profile
    personalInfo: "Personal Information",
    language: "Language",
    country: "Country",
    saveChanges: "Save Changes",
    changesSaved: "Changes saved successfully",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    refresh: "Refresh",

    // Legal Consultation
    quickQuestion1: "What are my basic labor rights?",
    quickQuestion2: "How can I start a divorce process?",
    quickQuestion3: "What should I do if I'm not being paid my salary?",
    quickQuestion4: "What are tenant rights?",
    legalResources: "Legal Resources",
    constitution: "National Constitution",
    civilCode: "Civil Code",
    updated: "Updated",
    noActivity: "No consultations yet. Start by asking a legal question.",
  },

  pt: {
    // Navigation
    dashboard: "Painel",
    consultation: "Consulta",
    process: "Processo",
    emergency: "Emergência",
    profile: "Perfil",
    logout: "Sair",

    // Dashboard
    welcomeTitle: "Bem-vindo ao LeFriAI",
    welcomeSubtitle: "Seu assistente jurídico inteligente",
    recentConsultations: "Consultas Recentes",
    activeProcesses: "Processos Ativos",
    emergencyContacts: "Contatos de Emergência",
    quickActions: "Ações Rápidas",
    askQuestion: "Fazer Pergunta",
    startProcess: "Iniciar Processo",
    addContact: "Adicionar Contato",
    viewAll: "Ver Tudo",
    noConsultations: "Nenhuma consulta recente",
    noProcesses: "Nenhum processo ativo",
    noContacts: "Nenhum contato de emergência",

    // Consultation
    legalAssistant: "Assistente Jurídico",
    askLegalQuestion: "Olá! Sou seu assistente jurídico",
    typeQuestion: "Digite sua consulta jurídica...",
    quickQuestions: "Perguntas Frequentes",
    thinking: "Pensando...",
    confidence: "Confiança",
    sources: "Fontes",
    relevance: "relevância",

    // Process
    legalProcesses: "Processos Jurídicos",
    processTitle: "Título do Processo",
    processDescription: "Descrição",
    currentStep: "Passo Atual",
    totalSteps: "Total de Passos",
    status: "Status",
    startNewProcess: "Iniciar Novo Processo",
    continueProcess: "Continuar Processo",

    // Emergency
    emergencyAlert: "Alerta de Emergência",
    emergencyDescription: "Ative um alerta de emergência que notificará seus contatos",
    activateEmergency: "Ativar Emergência",
    emergencyActivated: "Emergência Ativada",
    location: "Localização",
    contacts: "Contatos",

    // Profile
    personalInfo: "Informações Pessoais",
    language: "Idioma",
    country: "País",
    saveChanges: "Salvar Alterações",
    changesSaved: "Alterações salvas com sucesso",

    // Common
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Salvar",
    delete: "Excluir",
    edit: "Editar",
    add: "Adicionar",
    remove: "Remover",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    close: "Fechar",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpar",
    refresh: "Atualizar",

    // Legal Consultation
    quickQuestion1: "¿Cuáles son mis derechos laborales básicos?",
    quickQuestion2: "¿Cómo puedo iniciar un proceso de divorcio?",
    quickQuestion3: "¿Qué debo hacer si no recibo mi salario?",
    quickQuestion4: "¿Cuáles son los derechos del inquilino?",
    legalResources: "Recursos Legales",
    constitution: "Constitución Nacional",
    civilCode: "Código Civil",
    updated: "Actualizado",
    noActivity: "Aún no hay consultas. Comience preguntando una pregunta legal.",
  },

  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    consultation: "Consultation",
    process: "Processus",
    emergency: "Urgence",
    profile: "Profil",
    logout: "Déconnexion",

    // Dashboard
    welcomeTitle: "Bienvenue sur LeFriAI",
    welcomeSubtitle: "Votre assistant juridique intelligent",
    recentConsultations: "Consultations Récentes",
    activeProcesses: "Processus Actifs",
    emergencyContacts: "Contacts d'Urgence",
    quickActions: "Actions Rapides",
    askQuestion: "Poser une Question",
    startProcess: "Démarrer un Processus",
    addContact: "Ajouter un Contact",
    viewAll: "Voir Tout",
    noConsultations: "Aucune consultation récente",
    noProcesses: "Aucun processus actif",
    noContacts: "Aucun contact d'urgence",

    // Consultation
    legalAssistant: "Assistant Juridique",
    askLegalQuestion: "Bonjour ! Je suis votre assistant juridique",
    typeQuestion: "Tapez votre question juridique...",
    quickQuestions: "Questions Fréquentes",
    thinking: "Réflexion...",
    confidence: "Confiance",
    sources: "Sources",
    relevance: "pertinence",

    // Process
    legalProcesses: "Processus Juridiques",
    processTitle: "Titre du Processus",
    processDescription: "Description",
    currentStep: "Étape Actuelle",
    totalSteps: "Total des Étapes",
    status: "Statut",
    startNewProcess: "Démarrer un Nouveau Processus",
    continueProcess: "Continuer le Processus",

    // Emergency
    emergencyAlert: "Alerte d'Urgence",
    emergencyDescription: "Activez une alerte d'urgence qui notifiera vos contacts",
    activateEmergency: "Activer l'Urgence",
    emergencyActivated: "Urgence Activée",
    location: "Emplacement",
    contacts: "Contacts",

    // Profile
    personalInfo: "Informations Personnelles",
    language: "Langue",
    country: "Pays",
    saveChanges: "Sauvegarder les Modifications",
    changesSaved: "Modifications sauvegardées avec succès",

    // Common
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    cancel: "Annuler",
    confirm: "Confirmer",
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Supprimer",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    close: "Fermer",
    search: "Rechercher",
    filter: "Filtrer",
    clear: "Effacer",
    refresh: "Actualiser",

    // Legal Consultation
    quickQuestion1: "What are my basic labor rights?",
    quickQuestion2: "How can I start a divorce process?",
    quickQuestion3: "What should I do if I'm not being paid my salary?",
    quickQuestion4: "What are tenant rights?",
    legalResources: "Legal Resources",
    constitution: "National Constitution",
    civilCode: "Civil Code",
    updated: "Updated",
    noActivity: "No consultations yet. Start by asking a legal question.",
  }
};

// Hook to use translations - English as default
export function useTranslations(language: string = 'en'): Translations {
  return translations[language] || translations.en;
}

export function getTranslation(key: keyof Translations, language: string = 'en'): string {
  const t = translations[language] || translations.en;
  return t[key] || key;
}

export default translations;