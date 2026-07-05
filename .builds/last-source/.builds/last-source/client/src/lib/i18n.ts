import { useState, useEffect } from 'react';

// Comprehensive translation system for LeFriAI - English first
export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    consultation: "Legal Consultation",
    processes: "Processes",
    emergency: "Emergency",
    profile: "Profile",
    account: "Account",
    settings: "Settings",
    logout: "Sign Out",

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
    welcome: "Welcome to LeFriAI",
    welcomeSubtitle: "Your intelligent legal assistant is ready to help",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    startConsultation: "Start Consultation",
    viewProcesses: "View Processes",
    emergencyHelp: "Emergency Help",
    noRecentActivity: "No recent activity",
    consultations: "Consultations",
    activeProcesses: "Active Processes",
    modeConsultation: "Consultation Mode",
    modeProcess: "Process Mode",
    modeEmergency: "Emergency Mode",
    modeConsultationDesc: "Ask legal questions and get contextualized answers by country using advanced AI.",
    modeProcessDesc: "Step-by-step guidance for common legal processes like divorce, contracts and lawsuits.",
    modeEmergencyDesc: "Automatic alert system via WhatsApp to your emergency contacts.",
    startConsultationButton: "Start consultation",
    viewProcessesButton: "View processes",
    setupAlertsButton: "Setup alerts",

    // Consultation
    askQuestion: "Ask your legal question",
    questionPlaceholder: "Write your question about the Constitution of {country}...",
    askButton: "Ask",
    consultationHistory: "Consultation History",
    newConsultation: "New Consultation",
    searchPlaceholder: "Search your consultations...",
    legalAssistant: "Legal Assistant",
    confidence: "Confidence",
    sources: "Sources",
    relevance: "relevance",
    quickQuestions: "Quick Questions",
    typeQuestion: "Type your legal question...",
    thinking: "Thinking...",
    constitution: "Constitution",

    // Processes
    myProcesses: "My Processes",
    createProcess: "Create New Process",
    processType: "Process Type",
    processTitle: "Process Title",
    processDescription: "Process Description",
    status: "Status",
    progress: "Progress",
    nextStep: "Next Step",
    currentStep: "Current Step",
    totalSteps: "Total Steps",
    startNewProcess: "Start New Process",
    continueProcess: "Continue Process",
    processLoading: "Loading process...",
    processError: "Error loading process",
    processDeadline: "Deadline",
    processLegalBasis: "Legal Basis",
    processConstitutionalArticles: "Constitutional Articles",
    processCreatedOn: "Created on",
    processSuccess: "Process created successfully",
    priority: "Priority",
    processDivorce: "Divorce Process",
    processContract: "Contract Drafting",
    processLabor: "Labor Lawsuit",
    step: "Step",
    inProgress: "In progress",
    processTypes: {
      civil: "Civil Process",
      penal: "Criminal Process",
      laboral: "Labor Process",
      administrativo: "Administrative Process",
      familia: "Family Law",
      comercial: "Commercial Law",
      constitucional: "Constitutional Process",
      otros: "Others"
    },
    processStatus: {
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    processPriorities: {
      low: "Low",
      medium: "Medium",
      high: "High"
    },
    processDetails: {
      title: "Process Details",
      viewDetails: "View Details",
      documents: {
        title: "Process Documents",
        upload: "Upload Document",
        download: "Download Document",
        delete: "Delete Document",
        noDocuments: "No documents uploaded",
        uploadSuccess: "Document uploaded successfully",
        uploadError: "Error uploading document",
        deleteSuccess: "Document deleted successfully",
        deleteError: "Error deleting document",
        downloadError: "Error downloading document",
        caseNumber: "Case Number",
        court: "Court",
        judge: "Judge",
        opposingParty: "Opposing Party",
        amount: "Amount in Dispute"
      },
      timeline: {
        title: "Process Timeline",
        noEvents: "No events recorded",
        addEvent: "Add Event",
        eventDate: "Event Date",
        eventDescription: "Event Description",
        eventType: "Event Type",
        eventTypes: {
          hearing: "Hearing",
          filing: "Filing",
          deadline: "Deadline",
          meeting: "Meeting",
          other: "Other"
        }
      },
      notes: {
        title: "Process Notes",
        addNote: "Add Note",
        editNote: "Edit Note",
        deleteNote: "Delete Note",
        noNotes: "No notes available",
        noteContent: "Note Content",
        noteDate: "Note Date",
        addSuccess: "Note added successfully",
        editSuccess: "Note edited successfully",
        deleteSuccess: "Note deleted successfully",
        addError: "Error adding note",
        editError: "Error editing note",
        deleteError: "Error deleting note"
      }
    },

    // Emergency
    emergencyTitle: "Emergency System",
    emergencyDescription: "In case of emergency, press the button to send automatic alerts to your emergency contacts with your current location",
    emergencyActivate: "Activate Emergency",
    emergencyActivateWithVoice: "Emergency with Voice Note",
    sendAlert: "Send Alert",
    emergencyContacts: "Emergency Contacts",
    addContact: "Add Contact",
    contactName: "Contact Name",
    phoneNumber: "Phone Number",
    relationship: "Relationship",
    location: "Location",
    contacts: "Contacts",
    notifyViaWhatsApp: "Notify via WhatsApp",
    relationshipMother: "Mother",
    relationshipFather: "Father",
    relationshipSibling: "Sibling",
    relationshipPartner: "Partner",
    relationshipLawyer: "Lawyer",
    relationshipFriend: "Friend",
    relationshipOther: "Other",
    emergencyConfirmMessage: "Are you sure you want to activate the emergency alert? Your location will be sent to your emergency contacts.",
    sendingAlerts: "SENDING ALERTS...",
    alertsSentSuccess: "Alerts sent successfully",
    locationObtained: "Location obtained",
    coordinatesSent: "Coordinates sent",
    alertSentTo: "Alert sent to",
    viaWhatsApp: "via WhatsApp",
    emergencyError: "Error sending alerts. Please try again.",
    emergencyVoiceError: "Error sending emergency alert with voice note. Please try again.",
    emergencyVoiceDescription: "Record a voice note explaining your emergency situation. This will be sent along with your location to all your contacts.",
    emergencyVoiceNote: "Emergency Voice Note",
    startRecording: "Start Recording",
    pressMicrophoneToRecord: "Press the microphone to record a voice note",
    maxDuration: "Maximum duration: 1:00",
    sending: "Sending...",
    close: "Close",
    cancel: "Cancel",

    // Profile & Account
    personalInformation: "Personal Information",
    accountInformation: "Account Information",
    regionalSettings: "Regional Settings",
    notifications: "Notifications",
    dangerZone: "Danger Zone",
    phone: "Phone",
    country: "Country",
    language: "Language",
    emailNotifications: "Email Notifications",
    registrationDate: "Registration Date",
    lastAccess: "Last Access",
    accessMethod: "Access Method",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    personalInfo: "Personal Information",
    usageStatistics: "Usage Statistics",
    consultationsCompleted: "Consultations completed",
    processesStarted: "Processes started",
    totalTime: "Total time",
    saving: "Saving...",

    // Common
    loading: "Loading...",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    back: "Back",
    next: "Next",
    previous: "Previous",
    clear: "Clear",
    refresh: "Refresh",
    confirm: "Confirm",
    add: "Add",
    remove: "Remove",
    viewAll: "View All",

    // Messages & Toasts
    welcomeUser: "Welcome!",
    loginSuccess: "You have successfully signed in.",
    accountCreated: "Account created!",
    accountCreatedSuccess: "Your account has been created successfully.",
    profileUpdated: "Profile updated",
    profileUpdatedSuccess: "Your information has been saved successfully.",
    sessionEnded: "Session ended",
    logoutSuccess: "You have successfully signed out.",
    changesSaved: "Changes saved successfully",

    // Errors
    required: "This field is required",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDontMatch: "Passwords don't match",
    invalidCredentials: "Invalid credentials. Check your email and password.",
    userExists: "User already exists",
    registrationFailed: "Registration failed. Please try again.",
    loginFailed: "Login failed. Please try again.",
    profileUpdateFailed: "Could not update profile. Please try again.",
    authenticationRequired: "Authentication required",
    googleAuthFailed: "Error signing in with Google. Please try again.",
    error: "Error",
    success: "Success",

    // Data states
    noConsultations: "No recent consultations",
    noProcesses: "No active processes",
    noContacts: "No emergency contacts",

    // Countries
    countries: {
      EC: "Ecuador",
      CO: "Colombia",
      PE: "Peru",
      BO: "Bolivia",
      VE: "Venezuela",
      AR: "Argentina",
      CL: "Chile",
      UY: "Uruguay",
      PY: "Paraguay",
      US: "United States",
      MX: "Mexico"
    },

    // Languages
    languages: {
      en: "English",
      es: "Spanish"
    },

    // Legal Consultation Interface
    welcomeMessage: "Hello! I'm your intelligent legal assistant. I can help you with questions about laws, rights, legal processes, and your country's constitution. How can I help you today?",
    legalAssistantWelcome: "Hello! I'm your legal assistant",
    legalAssistantDescription: "You can ask me about rights, legal procedures, or any legal consultation.",
    quickQuestion1: "What are my basic labor rights?",
    quickQuestion2: "How can I start a divorce process?",
    quickQuestion3: "What should I do if I'm not being paid my salary?",
    quickQuestion4: "What are tenant rights?",
    legalResources: "Legal Resources",
    updated: "Updated",
    noActivity: "No consultations yet. Start by asking a legal question.",

    // Voice Recorder
    voiceRecorder: {
      startRecording: "Start Recording",
      resume: "Resume",
      pause: "Pause",
      stop: "Stop",
      play: "Play",
      delete: "Delete",
      send: "Send",
      uploading: "Uploading...",
      duration: "Duration",
      recording: "Recording...",
      recordingPaused: "Recording paused"
    },
  },

  es: {
    // Navigation
    dashboard: "Panel",
    consultation: "Consulta Legal",
    processes: "Procesos",
    emergency: "Emergencia",
    profile: "Perfil",
    account: "Cuenta",
    settings: "Configuración",
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
    welcome: "Bienvenido a LeFriAI",
    welcomeSubtitle: "Tu asistente legal inteligente está listo para ayudarte",
    recentActivity: "Actividad Reciente",
    quickActions: "Acciones Rápidas",
    startConsultation: "Iniciar Consulta",
    viewProcesses: "Ver Procesos",
    emergencyHelp: "Ayuda de Emergencia",
    noRecentActivity: "Sin actividad reciente",
    consultations: "Consultas",
    activeProcesses: "Procesos Activos",
    modeConsultation: "Modo Consulta",
    modeProcess: "Modo Proceso",
    modeEmergency: "Modo Emergencia",
    modeConsultationDesc: "Realiza consultas legales y obtén respuestas contextualizadas por país usando IA avanzada.",
    modeProcessDesc: "Guía paso a paso para procesos legales comunes como divorcios, contratos y demandas.",
    modeEmergencyDesc: "Sistema de alertas automáticas vía WhatsApp a tus contactos de emergencia.",
    startConsultationButton: "Iniciar consulta",
    viewProcessesButton: "Ver procesos",
    setupAlertsButton: "Configurar alertas",

    // Consultation
    askQuestion: "Haz tu pregunta legal",
    questionPlaceholder: "Escribe tu consulta sobre la Constitución de {country}...",
    askButton: "Preguntar",
    consultationHistory: "Historial de Consultas",
    newConsultation: "Nueva Consulta",
    searchPlaceholder: "Busca en tus consultas...",
    legalAssistant: "Asistente Legal",
    confidence: "Confianza",
    sources: "Fuentes",
    relevance: "relevancia",
    quickQuestions: "Preguntas Frecuentes",
    typeQuestion: "Escribe tu consulta legal...",
    thinking: "Pensando...",
    constitution: "Constitución",

    // Processes
    myProcesses: "Mis Procesos",
    createProcess: "Crear Nuevo Proceso",
    processType: "Tipo de Proceso",
    processTitle: "Título del Proceso",
    processDescription: "Descripción del Proceso",
    status: "Estado",
    progress: "Progreso",
    nextStep: "Siguiente Paso",
    currentStep: "Paso Actual",
    totalSteps: "Pasos Totales",
    startNewProcess: "Iniciar Nuevo Proceso",
    continueProcess: "Continuar Proceso",
    processLoading: "Cargando proceso...",
    processError: "Error al cargar el proceso",
    processDeadline: "Fecha Límite",
    processLegalBasis: "Base Legal",
    processConstitutionalArticles: "Artículos Constitucionales",
    processCreatedOn: "Creado el",
    processSuccess: "Proceso creado exitosamente",
    priority: "Prioridad",
    processDivorce: "Proceso de Divorcio",
    processContract: "Redacción de Contrato",
    processLabor: "Demanda Laboral",
    step: "Paso",
    inProgress: "En progreso",
    processTypes: {
      civil: "Proceso Civil",
      penal: "Proceso Penal",
      laboral: "Proceso Laboral",
      administrativo: "Proceso Administrativo",
      familia: "Derecho de Familia",
      comercial: "Derecho Comercial",
      constitucional: "Proceso Constitucional",
      otros: "Otros"
    },
    processStatus: {
      pending: "Pendiente",
      inProgress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado"
    },
    processPriorities: {
      low: "Bajo",
      medium: "Medio",
      high: "Alto"
    },
    processDetails: {
      title: "Detalles del Proceso",
      viewDetails: "Ver Detalles",
      documents: {
        title: "Documentos del Proceso",
        upload: "Subir Documento",
        download: "Descargar Documento",
        delete: "Eliminar Documento",
        noDocuments: "No hay documentos subidos",
        uploadSuccess: "Documento subido exitosamente",
        uploadError: "Error al subir documento",
        deleteSuccess: "Documento eliminado exitosamente",
        deleteError: "Error al eliminar documento",
        downloadError: "Error al descargar documento",
        caseNumber: "Número de Caso",
        court: "Tribunal",
        judge: "Juez",
        opposingParty: "Parte Contraria",
        amount: "Monto en Disputa"
      },
      timeline: {
        title: "Línea de Tiempo del Proceso",
        noEvents: "No hay eventos registrados",
        addEvent: "Agregar Evento",
        eventDate: "Fecha del Evento",
        eventDescription: "Descripción del Evento",
        eventType: "Tipo de Evento",
        eventTypes: {
          hearing: "Audiencia",
          filing: "Presentación",
          deadline: "Fecha Límite",
          meeting: "Reunión",
          other: "Otro"
        }
      },
      notes: {
        title: "Notas del Proceso",
        addNote: "Agregar Nota",
        editNote: "Editar Nota",
        deleteNote: "Eliminar Nota",
        noNotes: "No hay notas disponibles",
        noteContent: "Contenido de la Nota",
        noteDate: "Fecha de la Nota",
        addSuccess: "Nota agregada exitosamente",
        editSuccess: "Nota editada exitosamente",
        deleteSuccess: "Nota eliminada exitosamente",
        addError: "Error al agregar nota",
        editError: "Error al editar nota",
        deleteError: "Error al eliminar nota"
      }
    },

    // Emergency
    emergencyTitle: "Sistema de Emergencia",
    emergencyDescription: "En caso de emergencia, presiona el botón para enviar alertas automáticas a tus contactos de emergencia con tu ubicación actual",
    emergencyActivate: "Activar Emergencia",
    emergencyActivateWithVoice: "Emergencia con Nota de Voz",
    sendAlert: "Enviar Alerta",
    emergencyContacts: "Contactos de Emergencia",
    addContact: "Agregar Contacto",
    contactName: "Nombre del Contacto",
    phoneNumber: "Número de Teléfono",
    relationship: "Relación",
    location: "Ubicación",
    contacts: "Contactos",
    notifyViaWhatsApp: "Notificar por WhatsApp",
    relationshipMother: "Madre",
    relationshipFather: "Padre",
    relationshipSibling: "Hermano/a",
    relationshipPartner: "Pareja",
    relationshipLawyer: "Abogado/a",
    relationshipFriend: "Amigo/a",
    relationshipOther: "Otro",
    emergencyConfirmMessage: "¿Estás seguro de que quieres activar la alerta de emergencia? Se enviará tu ubicación a tus contactos de emergencia.",
    sendingAlerts: "ENVIANDO ALERTAS...",
    alertsSentSuccess: "Alertas enviadas exitosamente",
    locationObtained: "Ubicación obtenida",
    coordinatesSent: "Coordenadas enviadas",
    alertSentTo: "Alerta enviada a",
    viaWhatsApp: "vía WhatsApp",
    emergencyError: "Error al enviar alertas. Intenta nuevamente.",
    emergencyVoiceError: "Error al enviar alerta con nota de voz. Intenta nuevamente.",
    emergencyVoiceDescription: "Graba una nota de voz explicando tu situación de emergencia. Esta se enviará junto con tu ubicación a todos tus contactos.",
    emergencyVoiceNote: "Nota de Voz de Emergencia",
    startRecording: "Iniciar Grabación",
    pressMicrophoneToRecord: "Presiona el micrófono para grabar una nota de voz",
    maxDuration: "Duración máxima: 1:00",
    sending: "Enviando...",
    close: "Cerrar",
    cancel: "Cancelar",

    // Profile & Account
    personalInformation: "Información Personal",
    accountInformation: "Información de la Cuenta",
    regionalSettings: "Configuración Regional",
    notifications: "Notificaciones",
    dangerZone: "Zona de Peligro",
    phone: "Teléfono",
    country: "País",
    language: "Idioma",
    emailNotifications: "Notificaciones por Email",
    registrationDate: "Fecha de Registro",
    lastAccess: "Último Acceso",
    accessMethod: "Método de Acceso",
    editProfile: "Editar Perfil",
    saveChanges: "Guardar Cambios",
    personalInfo: "Información Personal",
    usageStatistics: "Estadísticas de Uso",
    consultationsCompleted: "Consultas completadas",
    processesStarted: "Procesos iniciados",
    totalTime: "Tiempo total",
    saving: "Guardando...",

    // Common
    loading: "Cargando...",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    submit: "Enviar",
    search: "Buscar",
    filter: "Filtrar",
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    clear: "Limpiar",
    refresh: "Actualizar",
    confirm: "Confirmar",
    add: "Agregar",
    remove: "Remover",
    viewAll: "Ver Todo",

    // Messages & Toasts
    welcomeUser: "¡Bienvenido!",
    loginSuccess: "Has iniciado sesión exitosamente.",
    accountCreated: "¡Cuenta creada!",
    accountCreatedSuccess: "Tu cuenta ha sido creada exitosamente.",
    profileUpdated: "Perfil actualizado",
    profileUpdatedSuccess: "Tu información ha sido guardada exitosamente.",
    sessionEnded: "Sesión cerrada",
    logoutSuccess: "Has cerrado sesión exitosamente.",
    changesSaved: "Cambios guardados exitosamente",

    // Errors
    required: "Este campo es requerido",
    invalidEmail: "Correo electrónico inválido",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsDontMatch: "Las contraseñas no coinciden",
    invalidCredentials: "Credenciales inválidas. Verifica tu email y contraseña.",
    userExists: "El usuario ya existe",
    registrationFailed: "Error al crear la cuenta. Intenta nuevamente.",
    loginFailed: "Error al iniciar sesión. Intenta nuevamente.",
    profileUpdateFailed: "No se pudo actualizar el perfil. Intenta nuevamente.",
    authenticationRequired: "Autenticación requerida",
    googleAuthFailed: "Error al iniciar sesión con Google. Intenta nuevamente.",
    error: "Error",
    success: "Éxito",

    // Data states
    noConsultations: "No hay consultas recientes",
    noProcesses: "No hay procesos activos",
    noContacts: "No hay contactos de emergencia",

    // Countries
    countries: {
      EC: "Ecuador",
      CO: "Colombia",
      PE: "Perú",
      BO: "Bolivia",
      VE: "Venezuela",
      AR: "Argentina",
      CL: "Chile",
      UY: "Uruguay",
      PY: "Paraguay",
      US: "Estados Unidos",
      MX: "México"
    },

    // Languages
    languages: {
      en: "Inglés",
      es: "Español"
    },

    // Legal Consultation Interface
    welcomeMessage: "¡Hola! Soy tu asistente legal inteligente. Puedo ayudarte con preguntas sobre leyes, derechos, procesos legales y la constitución de tu país. ¿En qué puedo ayudarte hoy?",
    legalAssistantWelcome: "¡Hola! Soy tu asistente legal",
    legalAssistantDescription: "Puedes preguntarme sobre derechos, procedimientos legales o cualquier consulta jurídica.",
    quickQuestion1: "¿Cuáles son mis derechos laborales básicos?",
    quickQuestion2: "¿Cómo inicio un proceso de divorcio?",
    quickQuestion3: "¿Qué debo hacer si no me pagan el sueldo?",
    quickQuestion4: "¿Cuáles son los derechos del inquilino?",
    legalResources: "Recursos Legales",
    updated: "Actualizada",
    noActivity: "Aún no hay consultas. Comienza haciendo una pregunta legal.",

    // Voice Recorder
    voiceRecorder: {
      startRecording: "Iniciar Grabación",
      resume: "Reanudar",
      pause: "Pausar",
      stop: "Detener",
      play: "Reproducir",
      delete: "Eliminar",
      send: "Enviar",
      uploading: "Subiendo...",
      duration: "Duración",
      recording: "Grabando...",
      recordingPaused: "Grabación pausada"
    },
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

// Hook to use translations - English as default
export function useTranslations(language: string = 'en') {
  const [currentTranslations, setCurrentTranslations] = useState(translations[language as Language] || translations.en);

  useEffect(() => {
    setCurrentTranslations(translations[language as Language] || translations.en);
  }, [language]);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentTranslations(translations[event.detail.language as Language] || translations.en);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  return currentTranslations;
}

export function getTranslation(key: TranslationKey, language: string = 'en'): string {
  const t = translations[language as Language] || translations.en;
  return typeof t[key] === 'string' ? t[key] as string : key;
}

export default translations;