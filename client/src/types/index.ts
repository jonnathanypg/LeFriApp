export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  citations?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
  confidence?: number;
  nextSteps?: string[];
}

export interface ConsultationResponse {
  response: string;
  citations: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
  confidence: number;
}

export interface EmergencyStatus {
  status: "sending" | "sent" | "failed";
  contactsNotified: Array<{
    id: number;
    name: string;
    phone: string;
    status: string;
    sentAt: string;
  }>;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface ProcessStep {
  title: string;
  content: string;
  completed: boolean;
}

export interface ProcessDefinition {
  title: string;
  description: string;
  icon: string;
  steps: ProcessStep[];
  totalSteps: number;
}

export const PROCESS_DEFINITIONS: Record<string, ProcessDefinition> = {
  divorcio: {
    title: "Proceso de Divorcio",
    description: "Guía completa para el proceso de divorcio, documentos necesarios y pasos a seguir.",
    icon: "heart-broken",
    totalSteps: 8,
    steps: [
      {
        title: "Recopilación de documentos personales",
        content: `
          <p class="text-neutral-600 mb-4">Necesitarás reunir los siguientes documentos:</p>
          <ul class="space-y-2 text-sm text-neutral-700">
            <li class="flex items-center space-x-2">
              <i class="fas fa-check-circle text-green-500"></i>
              <span>Cédula de identidad (ambos cónyuges)</span>
            </li>
            <li class="flex items-center space-x-2">
              <i class="fas fa-check-circle text-green-500"></i>
              <span>Certificado de matrimonio</span>
            </li>
            <li class="flex items-center space-x-2">
              <i class="fas fa-check-circle text-green-500"></i>
              <span>Partidas de nacimiento de los hijos</span>
            </li>
            <li class="flex items-center space-x-2">
              <i class="fas fa-check-circle text-green-500"></i>
              <span>Certificado de ingresos</span>
            </li>
          </ul>
        `,
        completed: false
      },
      {
        title: "Evaluación de bienes matrimoniales",
        content: `
          <p class="text-neutral-600 mb-4">Documenta todos los bienes adquiridos durante el matrimonio:</p>
          <ul class="space-y-2 text-sm text-neutral-700">
            <li>• Propiedades inmuebles</li>
            <li>• Vehículos</li>
            <li>• Cuentas bancarias</li>
            <li>• Inversiones y ahorros</li>
            <li>• Bienes muebles de valor</li>
          </ul>
        `,
        completed: false
      }
    ]
  },
  contrato: {
    title: "Redacción de Contratos",
    description: "Crea contratos legalmente válidos con asistencia paso a paso.",
    icon: "file-contract",
    totalSteps: 6,
    steps: [
      {
        title: "Tipo de contrato a crear",
        content: `
          <p class="text-neutral-600 mb-4">Selecciona el tipo de contrato que necesitas:</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <button class="p-2 border rounded text-left hover:bg-gray-50">Contrato de trabajo</button>
            <button class="p-2 border rounded text-left hover:bg-gray-50">Contrato de arrendamiento</button>
            <button class="p-2 border rounded text-left hover:bg-gray-50">Contrato de servicios</button>
            <button class="p-2 border rounded text-left hover:bg-gray-50">Contrato de compraventa</button>
          </div>
        `,
        completed: false
      }
    ]
  },
  laboral: {
    title: "Demanda Laboral",
    description: "Proceso para presentar demandas por conflictos laborales.",
    icon: "briefcase",
    totalSteps: 10,
    steps: [
      {
        title: "Descripción del conflicto",
        content: `
          <p class="text-neutral-600 mb-4">Describe detalladamente la situación:</p>
          <textarea class="w-full p-3 border rounded-lg" rows="4" placeholder="Explica el conflicto laboral que has experimentado..."></textarea>
        `,
        completed: false
      }
    ]
  }
};

export interface User {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  language?: string;
  country?: string;
  role: 'citizen' | 'lawyer' | 'admin';
  lawFirmId?: string;
}
