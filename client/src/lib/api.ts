import { apiRequest } from './queryClient';

export const api = {
  // Auth
  googleAuth: (data: { code: string }) =>
    apiRequest('POST', '/api/auth/google', data),
  
  getGoogleAuthUrl: () => apiRequest('GET', '/api/auth/google/url'),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('POST', '/api/auth/login', data),
  
  register: (data: { email: string; password: string; name: string; country?: string; language?: string }) =>
    apiRequest('POST', '/api/auth/register', data),
  
  logout: () => apiRequest('POST', '/api/auth/logout'),
  
  getMe: () => apiRequest('GET', '/api/auth/me'),

  // Consultations
  askQuestion: (data: { query: string; country: string; language: string }) =>
    apiRequest('POST', '/api/ask', data),
  
  getConsultations: () => apiRequest('GET', '/api/consultations'),

  // Emergency
  sendEmergencyAlert: (data: { latitude?: number; longitude?: number; address?: string }) =>
    apiRequest('POST', '/api/emergency', data),
  
  getEmergencyContacts: () => apiRequest('GET', '/api/emergency-contacts'),
  
  createEmergencyContact: (data: { name: string; phone: string; relationship: string; whatsappEnabled: boolean }) =>
    apiRequest('POST', '/api/emergency-contacts', data),
  
  deleteEmergencyContact: (id: number) =>
    apiRequest('DELETE', `/api/emergency-contacts/${id}`),

  // Legal processes
  getProcesses: () => apiRequest('GET', '/api/processes'),
  
  createProcess: (data: { processType: string; currentStep?: number; data?: any }) =>
    apiRequest('POST', '/api/processes', data),
  
  updateProcess: (id: number, data: { currentStep?: number; status?: string; data?: any }) =>
    apiRequest('PUT', `/api/processes/${id}`, data),

  // Profile
  updateProfile: (data: { name?: string; email?: string; phone?: string; language?: string; country?: string }) =>
    apiRequest('PUT', '/api/profile', data),

  // ==========================================
  // MULTI-TENANT LEGAL SAAS ENDPOINTS (CRM/ERP)
  // ==========================================
  registerLawFirm: (data: { name: string; specialty?: string }) =>
    apiRequest('POST', '/api/lawyer/firm', data),

  getLawyerDashboard: () =>
    apiRequest('GET', '/api/lawyer/dashboard'),

  getLawyerLeads: () =>
    apiRequest('GET', '/api/lawyer/leads'),

  updateLeadStatus: (id: string, status: string) =>
    apiRequest('PATCH', `/api/lawyer/leads/${id}`, { status }),

  convertLeadToCase: (id: string) =>
    apiRequest('POST', `/api/lawyer/leads/${id}/convert`),

  getLawyerCases: () =>
    apiRequest('GET', '/api/lawyer/cases'),

  createCase: (data: { clientId: string; title: string; description?: string; caseNumber?: string; court?: string; judge?: string }) =>
    apiRequest('POST', '/api/lawyer/cases', data),

  updateCase: (id: string, data: any) =>
    apiRequest('PATCH', `/api/lawyer/cases/${id}`, data),

  addCaseInvoice: (id: string, data: { amount: number; dueDate?: string }) =>
    apiRequest('POST', `/api/lawyer/cases/${id}/invoices`, data),

  updateInvoiceStatus: (id: string, invoiceId: string, status: string) =>
    apiRequest('PATCH', `/api/lawyer/cases/${id}/invoices/${invoiceId}`, { status }),

  updateProBonoSettings: (data: { proBonoLimit: number }) =>
    apiRequest('PATCH', '/api/lawyer/probono', data),

  getWhatsAppStatus: () =>
    apiRequest('GET', '/api/lawyer/whatsapp/status'),

  disconnectWhatsApp: () =>
    apiRequest('POST', '/api/lawyer/whatsapp/disconnect'),

  setWhatsAppProvider: (data: { provider: string; twilioConfig?: any; metaConfig?: any }) =>
    apiRequest('POST', '/api/lawyer/whatsapp/provider', data),
};

