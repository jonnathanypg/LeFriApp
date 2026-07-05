/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Mongoose schemas define local application and tenant structures.
 * To migrate to a decentralized P2P identity and DB state:
 * 1. User records and emergency alerts will use decentralized schemas (e.g. JSON-LD / Ceramic streams).
 * 2. Relationships (Citizen to Lawyer, Lawyer to Firm) will be established using cryptographically signed verifiable credentials.
 * 3. Identity authentication will be executed via Decentralized Identifiers (DIDs) and key pairs instead of Google OAuth.
 */

import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const cryptoHelpers = {
  encrypt: (val: string) => val,
  decrypt: (val: string) => val,
};

export const hashHelpers = {
  hash: (val: string) => val,
};

// Mongoose Schemas
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  phone: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  phoneHash: { type: String },
  googleId: { type: String },
  telegramChatId: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  telegramChatIdHash: { type: String },
  language: { type: String, default: "es" },
  country: { type: String, default: "EC" },
  role: { type: String, enum: ['citizen', 'lawyer', 'admin'], default: 'citizen' },
  lawFirmId: { type: Schema.Types.ObjectId, ref: 'LawFirm' },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    city: { type: String }
  },
  did: { type: String }, // Decentralized Identifier
  publicKey: { type: String }, // Cryptographic Public Key for verification of identity handshakes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

userSchema.pre('save', function(next) {
  if (this.isModified('phone') && this.phone) {
    this.phoneHash = hashHelpers.hash(this.phone);
  }
  if (this.isModified('telegramChatId') && this.telegramChatId) {
    this.telegramChatIdHash = hashHelpers.hash(this.telegramChatId);
  }
  next();
});

userSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update) {
    if (update.phone !== undefined) {
      update.phoneHash = update.phone ? hashHelpers.hash(update.phone) : null;
    }
    if (update.telegramChatId !== undefined) {
      update.telegramChatIdHash = update.telegramChatId ? hashHelpers.hash(update.telegramChatId) : null;
    }
  }
  next();
});

// LawFirm (Tenant) Schema
const lawFirmSchema = new Schema({
  name: { type: String, required: true },
  subscriptionPlan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  proBonoLimit: { type: Number, default: 3 },
  proBonoUsed: { type: Number, default: 0 },
  notorietyScore: { type: Number, default: 0 },
  whatsAppSessionActive: { type: Boolean, default: false },
  whatsAppProvider: { type: String, enum: ['baileys', 'twilio', 'meta'], default: 'baileys' },
  twilioConfig: {
    accountSid: { type: String },
    authToken: { type: String },
    phoneNumber: { type: String }
  },
  metaConfig: {
    accessToken: { type: String },
    phoneNumberId: { type: String },
    verifyToken: { type: String }
  },
  telegramConfig: {
    botToken: { type: String },
    isActive: { type: Boolean, default: false }
  },
  specialty: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// WhatsApp Session Storage Schema
const whatsAppSessionSchema = new Schema({
  tenantId: { type: String, required: true, unique: true },
  creds: { type: String, required: true, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Lead (CRM) Schema
const leadSchema = new Schema({
  lawFirmId: { type: Schema.Types.ObjectId, ref: 'LawFirm', required: true },
  citizenId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  email: { type: String },
  summary: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  status: { type: String, enum: ['new', 'contacted', 'negotiation', 'converted', 'archived'], default: 'new' },
  isProBono: { type: Boolean, default: false },
  source: { type: String, enum: ['whatsapp', 'telegram', 'web_widget', 'platform'], default: 'platform' },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// CaseFile (ERP) Schema
const caseFileSchema = new Schema({
  lawFirmId: { type: Schema.Types.ObjectId, ref: 'LawFirm', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  caseNumber: { type: String },
  court: { type: String },
  judge: { type: String },
  status: { type: String, enum: ['active', 'closed', 'suspended'], default: 'active' },
  progress: { type: Number, default: 0 },
  documents: [{
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    ocrText: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
    uploadedAt: { type: Date, default: Date.now }
  }],
  invoices: [{
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    dueDate: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

const emergencyContactSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  relationship: { type: String, required: true },
  whatsappEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

const legalProcessSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "pending" },
  progress: { type: Number, default: 0 },
  currentStep: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 5 },
  steps: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String },
    documents: [{ type: String }],
    requirements: [{ type: String }]
  }],
  requiredDocuments: [{ type: String }],
  legalBasis: { type: String, default: "" },
  constitutionalArticles: [{ type: String }],
  timeline: { type: String, default: "" },
  metadata: { 
    type: Schema.Types.Mixed,
    default: {
      priority: 'medium',
      caseNumber: '',
      court: '',
      judge: '',
      opposingParty: '',
      amount: '',
      deadline: ''
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const consultationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  response: { type: String, required: true, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  country: { type: String, default: "EC" },
  language: { type: String, default: "es" },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

const emergencyAlertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  longitude: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  address: { type: String, set: (v: any) => cryptoHelpers.encrypt(v), get: (v: any) => cryptoHelpers.decrypt(v) },
  contactsNotified: { 
    type: Schema.Types.Mixed,
    set: (v: any) => typeof v === 'string' ? cryptoHelpers.encrypt(v) : cryptoHelpers.encrypt(JSON.stringify(v)),
    get: (v: any) => {
      if (!v) return v;
      const dec = cryptoHelpers.decrypt(v);
      try { return JSON.parse(dec); } catch { return dec; }
    }
  },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// For RAG and vector search
const legalDocumentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  country: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  embedding: [{ type: Number }], // Vector embeddings for similarity search
  constitutionId: { type: String },
  sectionId: { type: String },
  sectionName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Conversation history for context-aware responses
const conversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  context: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// System Configuration Schema
const systemConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Mongoose Models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema);
export const LawFirm = mongoose.models.LawFirm || mongoose.model('LawFirm', lawFirmSchema);
export const WhatsAppSession = mongoose.models.WhatsAppSession || mongoose.model('WhatsAppSession', whatsAppSessionSchema);
export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
export const CaseFile = mongoose.models.CaseFile || mongoose.model('CaseFile', caseFileSchema);
export const EmergencyContact = mongoose.models.EmergencyContact || mongoose.model('EmergencyContact', emergencyContactSchema);
export const LegalProcess = mongoose.models.LegalProcess || mongoose.model('LegalProcess', legalProcessSchema);
export const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
export const EmergencyAlert = mongoose.models.EmergencyAlert || mongoose.model('EmergencyAlert', emergencyAlertSchema);
export const LegalDocument = mongoose.models.LegalDocument || mongoose.model('LegalDocument', legalDocumentSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

// Zod validation schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().optional(),
  phone: z.string().optional(),
  phoneHash: z.string().optional(),
  googleId: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramChatIdHash: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['citizen', 'lawyer', 'admin']).optional(),
  lawFirmId: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional()
  }).optional()
});

export const insertLawFirmSchema = z.object({
  name: z.string().min(1),
  subscriptionPlan: z.enum(['free', 'pro', 'enterprise']).optional(),
  proBonoLimit: z.number().optional(),
  specialty: z.string().optional()
});

export const insertLeadSchema = z.object({
  lawFirmId: z.string(),
  citizenId: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  summary: z.string().optional(),
  status: z.enum(['new', 'contacted', 'negotiation', 'converted', 'archived']).optional(),
  isProBono: z.boolean().optional(),
  source: z.enum(['whatsapp', 'telegram', 'web_widget', 'platform']).optional()
});

export const insertCaseFileSchema = z.object({
  lawFirmId: z.string(),
  clientId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  caseNumber: z.string().optional(),
  court: z.string().optional(),
  judge: z.string().optional(),
  status: z.enum(['active', 'closed', 'suspended']).optional(),
});

export const insertEmergencyContactSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  phone: z.string().min(1),
  relationship: z.string().min(1),
  whatsappEnabled: z.boolean().optional(),
});

export const insertLegalProcessSchema = z.object({
  userId: z.string(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  currentStep: z.number().optional(),
  totalSteps: z.number().min(1),
  metadata: z.any().optional(),
});

export const insertConsultationSchema = z.object({
  userId: z.string(),
  query: z.string().min(1),
  response: z.string().min(1),
  country: z.string().optional(),
  language: z.string().optional(),
  metadata: z.any().optional(),
});

export const insertEmergencyAlertSchema = z.object({
  userId: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address: z.string().optional(),
  contactsNotified: z.any().optional(),
  status: z.string().min(1),
});

// TypeScript types
export interface UserDocument extends Document {
  email: string;
  name: string;
  password?: string;
  phone?: string;
  phoneHash?: string;
  googleId?: string;
  telegramChatId?: string;
  telegramChatIdHash?: string;
  language: string;
  country: string;
  role: 'citizen' | 'lawyer' | 'admin';
  lawFirmId?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LawFirmDocument extends Document {
  name: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  proBonoLimit: number;
  proBonoUsed: number;
  notorietyScore: number;
  whatsAppSessionActive: boolean;
  whatsAppProvider: 'baileys' | 'twilio' | 'meta';
  twilioConfig?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  metaConfig?: {
    accessToken: string;
    phoneNumberId: string;
    verifyToken: string;
  };
  telegramConfig?: {
    botToken: string;
    isActive: boolean;
  };
  specialty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppSessionDocument extends Document {
  tenantId: string;
  creds: string;
  updatedAt: Date;
}

export interface LeadDocument extends Document {
  lawFirmId: string;
  citizenId?: string;
  name: string;
  phone?: string;
  email?: string;
  summary?: string;
  status: 'new' | 'contacted' | 'negotiation' | 'converted' | 'archived';
  isProBono: boolean;
  source: 'whatsapp' | 'telegram' | 'web_widget' | 'platform';
  createdAt: Date;
}

export interface CaseFileDocument extends Document {
  lawFirmId: string;
  clientId: string;
  title: string;
  description?: string;
  caseNumber?: string;
  court?: string;
  judge?: string;
  status: 'active' | 'closed' | 'suspended';
  progress: number;
  documents: Array<{
    name: string;
    fileUrl: string;
    ocrText?: string;
    uploadedAt: Date;
  }>;
  invoices: Array<{
    amount: number;
    status: 'pending' | 'paid';
    dueDate?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContactDocument extends Document {
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  whatsappEnabled: boolean;
  createdAt: Date;
}

export interface LegalProcessDocument extends Document {
  userId: string;
  type: string;
  title: string;
  description?: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationDocument extends Document {
  userId: string;
  query: string;
  response: string;
  country: string;
  language: string;
  metadata?: any;
  createdAt: Date;
}

export interface EmergencyAlertDocument extends Document {
  userId: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  contactsNotified?: any;
  status: string;
  createdAt: Date;
}

export interface LegalDocumentDocument extends Document {
  title: string;
  content: string;
  country: string;
  category: string;
  tags: string[];
  embedding: number[];
  constitutionId?: string;
  sectionId?: string;
  sectionName?: string;
  createdAt: Date;
}

export interface ConversationDocument extends Document {
  userId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  context?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfigDocument extends Document {
  key: string;
  value: any;
  updatedAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLawFirm = z.infer<typeof insertLawFirmSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertCaseFile = z.infer<typeof insertCaseFileSchema>;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type InsertLegalProcess = z.infer<typeof insertLegalProcessSchema>;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;

// Training Readiness metadata to build a defensible proprietary model pipeline (the Moat)
// while safeguarding sovereign private data as required by the IAGS protocol.
export const TrainingMetadata = {
  User: {
    email: { trainingSafe: false, hashOnExport: true },
    name: { trainingSafe: false },
    phone: { trainingSafe: false },
    googleId: { trainingSafe: false },
    telegramChatId: { trainingSafe: false },
    language: { trainingSafe: true },
    country: { trainingSafe: true },
    role: { trainingSafe: true },
    location: { trainingSafe: false },
    did: { trainingSafe: true },
    publicKey: { trainingSafe: false }
  },
  Consultation: {
    userId: { trainingSafe: false },
    query: { trainingSafe: false }, // Specific client facts are confidential
    response: { trainingSafe: true }, // Verified general legal explanations are safe for training
    country: { trainingSafe: true },
    language: { trainingSafe: true }
  },
  EmergencyAlert: {
    userId: { trainingSafe: false },
    latitude: { trainingSafe: false },
    longitude: { trainingSafe: false },
    address: { trainingSafe: false },
    status: { trainingSafe: true }
  },
  Lead: {
    lawFirmId: { trainingSafe: false },
    citizenId: { trainingSafe: false },
    name: { trainingSafe: false },
    phone: { trainingSafe: false },
    email: { trainingSafe: false },
    summary: { trainingSafe: false },
    status: { trainingSafe: true },
    isProBono: { trainingSafe: true },
    source: { trainingSafe: true }
  },
  CaseFile: {
    lawFirmId: { trainingSafe: false },
    clientId: { trainingSafe: false },
    title: { trainingSafe: true, hashOnExport: true },
    description: { trainingSafe: false },
    caseNumber: { trainingSafe: false },
    court: { trainingSafe: true },
    judge: { trainingSafe: false },
    status: { trainingSafe: true },
    progress: { trainingSafe: true }
  }
};