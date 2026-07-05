import { createContext, useContext, useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    [lang: string]: string;
  };
}

const translations: Translations = {
  'dashboard.welcome': {
    en: 'Welcome',
    es: 'Bienvenido',
    pt: 'Bem-vindo'
  },
  'dashboard.subtitle': {
    en: 'Your intelligent legal assistant is ready to help',
    es: 'Tu asistente legal inteligente está listo para ayudarte',
    pt: 'Seu assistente jurídico inteligente está pronto para ajudar'
  },
  'nav.consultation': {
    en: 'Consultation',
    es: 'Consulta',
    pt: 'Consulta'
  },
  'nav.processes': {
    en: 'Processes',
    es: 'Procesos',
    pt: 'Processos'
  },
  'nav.emergency': {
    en: 'Emergency',
    es: 'Emergencia',
    pt: 'Emergência'
  },
  'emergency.title': {
    en: 'Emergency Contacts',
    es: 'Contactos de Emergencia',
    pt: 'Contatos de Emergência'
  },
  'emergency.subtitle': {
    en: 'Configure your emergency contacts to receive instant WhatsApp alerts',
    es: 'Configura tus contactos de emergencia para recibir alertas instantáneas por WhatsApp',
    pt: 'Configure seus contatos de emergência para receber alertas instantâneos via WhatsApp'
  },
  'emergency.add_contact': {
    en: 'Add Contact',
    es: 'Agregar Contacto',
    pt: 'Adicionar Contato'
  },
  'emergency.send_alert': {
    en: 'Send Emergency Alert',
    es: 'Enviar Alerta de Emergencia',
    pt: 'Enviar Alerta de Emergência'
  },
  'emergency.recording': {
    en: 'Recording...',
    es: 'Grabando...',
    pt: 'Gravando...'
  },
  'emergency.record_voice': {
    en: 'Record Voice Note',
    es: 'Grabar Nota de Voz',
    pt: 'Gravar Nota de Voz'
  },
  'processes.title': {
    en: 'Legal Processes',
    es: 'Procesos Legales',
    pt: 'Processos Legais'
  },
  'processes.subtitle': {
    en: 'Manage your legal processes and track each step',
    es: 'Gestiona tus procesos legales y haz seguimiento a cada paso',
    pt: 'Gerencie seus processos legais e acompanhe cada etapa'
  },
  'processes.create': {
    en: 'Create Process',
    es: 'Crear Proceso',
    pt: 'Criar Processo'
  },
  'common.back': {
    en: 'Back',
    es: 'Volver',
    pt: 'Voltar'
  },
  'common.save': {
    en: 'Save',
    es: 'Guardar',
    pt: 'Salvar'
  },
  'common.cancel': {
    en: 'Cancel',
    es: 'Cancelar',
    pt: 'Cancelar'
  },
  'common.edit': {
    en: 'Edit',
    es: 'Editar',
    pt: 'Editar'
  },
  'common.delete': {
    en: 'Delete',
    es: 'Eliminar',
    pt: 'Excluir'
  },
  'form.name': {
    en: 'Full Name',
    es: 'Nombre Completo',
    pt: 'Nome Completo'
  },
  'form.phone': {
    en: 'Phone Number',
    es: 'Número de Teléfono',
    pt: 'Número de Telefone'
  },
  'form.relationship': {
    en: 'Relationship',
    es: 'Relación',
    pt: 'Relacionamento'
  },
  'form.whatsapp_enabled': {
    en: 'Notify via WhatsApp',
    es: 'Notificar por WhatsApp',
    pt: 'Notificar via WhatsApp'
  },
  'mode.consultation.title': {
    es: 'Modo Consulta',
    en: 'Consultation Mode',
    pt: 'Modo Consulta'
  },
  'mode.consultation.description': {
    es: 'Realiza consultas legales y obtén respuestas contextualizadas por país usando IA avanzada.',
    en: 'Make legal queries and get country-contextualized answers using advanced AI.',
    pt: 'Faça consultas jurídicas e obtenha respostas contextualizadas por país usando IA avançada.'
  },
  'mode.process.title': {
    es: 'Modo Proceso',
    en: 'Process Mode',
    pt: 'Modo Processo'
  },
  'mode.process.description': {
    es: 'Guía paso a paso para procesos legales comunes como divorcios, contratos y demandas.',
    en: 'Step-by-step guide for common legal processes like divorce, contracts and lawsuits.',
    pt: 'Guia passo a passo para processos jurídicos comuns como divórcio, contratos e ações judiciais.'
  },
  'mode.emergency.title': {
    es: 'Modo Emergencia',
    en: 'Emergency Mode',
    pt: 'Modo Emergência'
  },
  'mode.emergency.description': {
    es: 'Sistema de alertas automáticas vía WhatsApp a tus contactos de emergencia.',
    en: 'Automatic alert system via WhatsApp to your emergency contacts.',
    pt: 'Sistema de alertas automáticos via WhatsApp para seus contatos de emergência.'
  },
  'button.start.consultation': {
    es: 'Iniciar consulta',
    en: 'Start consultation',
    pt: 'Iniciar consulta'
  },
  'button.view.processes': {
    es: 'Ver procesos',
    en: 'View processes',
    pt: 'Ver processos'
  },
  'button.configure.alerts': {
    es: 'Configurar alertas',
    en: 'Configure alerts',
    pt: 'Configurar alertas'
  }
};

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'es',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};