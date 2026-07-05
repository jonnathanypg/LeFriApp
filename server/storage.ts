import { 
  type UserDocument, type EmergencyContactDocument, type LegalProcessDocument, 
  type ConsultationDocument, type EmergencyAlertDocument,
  type InsertUser, type InsertEmergencyContact, type InsertLegalProcess, 
  type InsertConsultation, type InsertEmergencyAlert,
  cryptoHelpers,
  hashHelpers
} from "@shared/schema";
import { prisma, executeWithRetry } from "./prisma-client";
import { encrypt, decrypt } from "./utils/crypto";
import crypto from 'crypto';

cryptoHelpers.encrypt = encrypt;
cryptoHelpers.decrypt = decrypt;

hashHelpers.hash = (val: string) => {
  if (!val) return val;
  const cleaned = val.replace(/\D/g, "");
  return crypto.createHash('sha256').update(cleaned).digest('hex');
};

function mapPrismaUser(user: any): any {
  if (!user) return undefined;
  return {
    ...user,
    _id: user.id, // For backward compatibility with Mongoose calls
  };
}

export interface IStorage {
  getUser(id: string): Promise<UserDocument | undefined>;
  getUserByEmail(email: string): Promise<UserDocument | undefined>;
  getUserByGoogleId(googleId: string): Promise<UserDocument | undefined>;
  createUser(user: InsertUser): Promise<UserDocument>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<UserDocument>;
  getUsers(): Promise<UserDocument[]>;
  countUsers(filter: any): Promise<number>;
  countLawFirms(): Promise<number>;
  countLeads(filter: any): Promise<number>;
  countCaseFiles(filter: any): Promise<number>;
  countConversations(): Promise<number>;
  getSystemConfig(key: string): Promise<any>;
  updateSystemConfig(key: string, value: string): Promise<any>;
  getLawFirms(): Promise<any[]>;
  getUserByDid(did: string): Promise<UserDocument | undefined>;
  createLawFirm(firm: any): Promise<any>;
  getLawFirmById(id: string): Promise<any>;
  updateLawFirm(id: string, updates: any): Promise<any>;
  getCaseFiles(filter: any): Promise<any[]>;
  getLeads(filter: any): Promise<any[]>;
  updateLead(filter: any, updates: any): Promise<any>;
  getLead(filter: any): Promise<any>;
  createCaseFile(caseFile: any): Promise<any>;
  updateCaseFile(filter: any, updates: any): Promise<any>;

  getEmergencyContacts(userId: string): Promise<EmergencyContactDocument[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContactDocument>;
  updateEmergencyContact(id: string, updates: Partial<InsertEmergencyContact>): Promise<EmergencyContactDocument>;
  deleteEmergencyContact(id: string): Promise<void>;

  getLegalProcesses(userId: string): Promise<LegalProcessDocument[]>;
  getLegalProcess(id: string): Promise<LegalProcessDocument | undefined>;
  createLegalProcess(process: InsertLegalProcess): Promise<LegalProcessDocument>;
  updateLegalProcess(id: string, updates: Partial<InsertLegalProcess>): Promise<LegalProcessDocument>;

  getConsultations(userId: string): Promise<ConsultationDocument[]>;
  createConsultation(consultation: InsertConsultation): Promise<ConsultationDocument>;

  getEmergencyAlerts(userId: string): Promise<EmergencyAlertDocument[]>;
  createEmergencyAlert(alert: InsertEmergencyAlert): Promise<EmergencyAlertDocument>;
}

export class MemoryStorage implements IStorage {
  private users: Map<string, UserDocument> = new Map();
  private emergencyContacts: Map<string, EmergencyContactDocument> = new Map();
  private legalProcesses: Map<string, LegalProcessDocument> = new Map();
  private consultations: Map<string, ConsultationDocument> = new Map();
  private emergencyAlerts: Map<string, EmergencyAlertDocument> = new Map();

  constructor() {
    const demoUserId = '66a1b2c3d4e5f6789abc1234';
    const demoUser = {
      _id: demoUserId,
      email: "demo@lefri.ai",
      name: "Usuario Demo",
      googleId: "demo_google_id",
      language: "es",
      country: "EC",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    this.users.set(demoUserId, demoUser);
  }

  async getUsers(): Promise<UserDocument[]> { return Array.from(this.users.values()); }
  async countUsers(filter: any): Promise<number> { return this.users.size; }
  async countLawFirms(): Promise<number> { return 0; }
  async countLeads(filter: any): Promise<number> { return 0; }
  async countCaseFiles(filter: any): Promise<number> { return 0; }
  async countConversations(): Promise<number> { return 0; }
  async getSystemConfig(key: string): Promise<any> { return null; }
  async updateSystemConfig(key: string, value: string): Promise<any> { return null; }
  async getLawFirms(): Promise<any[]> { return []; }
  async getUserByDid(did: string): Promise<UserDocument | undefined> { return undefined; }
  async createLawFirm(firm: any): Promise<any> { return { id: Date.now().toString(), ...firm }; }
  async getLawFirmById(id: string): Promise<any> { return null; }
  async updateLawFirm(id: string, updates: any): Promise<any> { return { id, ...updates }; }
  async getCaseFiles(filter: any): Promise<any[]> { return []; }
  async getLeads(filter: any): Promise<any[]> { return []; }
  async updateLead(filter: any, updates: any): Promise<any> { return null; }
  async getLead(filter: any): Promise<any> { return null; }
  async createCaseFile(caseFile: any): Promise<any> { return { id: Date.now().toString(), ...caseFile }; }
  async updateCaseFile(filter: any, updates: any): Promise<any> { return null; }

  async getUser(id: string): Promise<UserDocument | undefined> { return this.users.get(id); }
  async getUserByEmail(email: string): Promise<UserDocument | undefined> { return Array.from(this.users.values()).find(u => u.email === email); }
  async getUserByGoogleId(googleId: string): Promise<UserDocument | undefined> { return Array.from(this.users.values()).find(u => u.googleId === googleId); }
  async createUser(insertUser: InsertUser): Promise<UserDocument> {
    const id = Date.now().toString();
    const user = { _id: id, ...insertUser, createdAt: new Date(), updatedAt: new Date() } as any;
    this.users.set(id, user);
    return user;
  }
  async updateUser(id: string, updates: Partial<InsertUser>): Promise<UserDocument> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...updates, updatedAt: new Date() } as any;
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async getEmergencyContacts(userId: string): Promise<EmergencyContactDocument[]> { return Array.from(this.emergencyContacts.values()).filter(c => c.userId === userId); }
  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContactDocument> {
    const id = Date.now().toString();
    const contact = { _id: id, ...insertContact, createdAt: new Date() } as any;
    this.emergencyContacts.set(id, contact);
    return contact;
  }
  async updateEmergencyContact(id: string, updates: Partial<InsertEmergencyContact>): Promise<EmergencyContactDocument> {
    const contact = this.emergencyContacts.get(id);
    if (!contact) throw new Error('Emergency contact not found');
    const updatedContact = { ...contact, ...updates } as any;
    this.emergencyContacts.set(id, updatedContact);
    return updatedContact;
  }
  async deleteEmergencyContact(id: string): Promise<void> { this.emergencyContacts.delete(id); }
  async getLegalProcesses(userId: string): Promise<LegalProcessDocument[]> { return Array.from(this.legalProcesses.values()).filter(p => p.userId === userId); }
  async getLegalProcess(id: string): Promise<LegalProcessDocument | undefined> { return this.legalProcesses.get(id); }
  async createLegalProcess(insertProcess: InsertLegalProcess): Promise<LegalProcessDocument> {
    const id = Date.now().toString();
    const process = { _id: id, ...insertProcess, createdAt: new Date(), updatedAt: new Date() } as any;
    this.legalProcesses.set(id, process);
    return process;
  }
  async updateLegalProcess(id: string, updates: Partial<InsertLegalProcess>): Promise<LegalProcessDocument> {
    const process = this.legalProcesses.get(id);
    if (!process) throw new Error('Legal process not found');
    const updatedProcess = { ...process, ...updates, updatedAt: new Date() } as any;
    this.legalProcesses.set(id, updatedProcess);
    return updatedProcess;
  }
  async getConsultations(userId: string): Promise<ConsultationDocument[]> {
    return Array.from(this.consultations.values()).filter(c => c.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createConsultation(insertConsultation: InsertConsultation): Promise<ConsultationDocument> {
    const id = Date.now().toString();
    const consultation = { _id: id, ...insertConsultation, createdAt: new Date() } as any;
    this.consultations.set(id, consultation);
    return consultation;
  }
  async getEmergencyAlerts(userId: string): Promise<EmergencyAlertDocument[]> {
    return Array.from(this.emergencyAlerts.values()).filter(a => a.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createEmergencyAlert(insertAlert: InsertEmergencyAlert): Promise<EmergencyAlertDocument> {
    const id = Date.now().toString();
    const alert = { _id: id, ...insertAlert, createdAt: new Date() } as any;
    this.emergencyAlerts.set(id, alert);
    return alert;
  }
}

export class PrismaStorage implements IStorage {
  async getUser(id: string): Promise<UserDocument | undefined> {
    return executeWithRetry(async () => {
      const u = await prisma.user.findUnique({ where: { id } });
      return mapPrismaUser(u);
    });
  }

  async getUserByEmail(email: string): Promise<UserDocument | undefined> {
    return executeWithRetry(async () => {
      const u = await prisma.user.findUnique({ where: { email } });
      return mapPrismaUser(u);
    });
  }

  async getUserByGoogleId(googleId: string): Promise<UserDocument | undefined> {
    return executeWithRetry(async () => {
      const u = await prisma.user.findUnique({ where: { googleId } });
      return mapPrismaUser(u);
    });
  }

  async getUserByDid(did: string): Promise<UserDocument | undefined> {
    return executeWithRetry(async () => {
      const u = await prisma.user.findUnique({ where: { did } });
      return mapPrismaUser(u);
    });
  }

  async createUser(insertUser: InsertUser): Promise<UserDocument> {
    return executeWithRetry(async () => {
      const { location, ...rest } = insertUser;
      const u = await prisma.user.create({
        data: {
          ...rest,
          location: location ? (location as any) : undefined,
        },
      });
      return mapPrismaUser(u);
    });
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<UserDocument> {
    return executeWithRetry(async () => {
      const { location, ...rest } = updates;
      const u = await prisma.user.update({
        where: { id },
        data: {
          ...rest,
          location: location ? (location as any) : undefined,
        },
      });
      return mapPrismaUser(u);
    });
  }

  async getUsers(): Promise<UserDocument[]> {
    return executeWithRetry(async () => {
      const users = await prisma.user.findMany();
      return users.map(mapPrismaUser);
    });
  }

  async countUsers(filter: any): Promise<number> {
    return executeWithRetry(async () => {
      const where: any = {};
      if (filter && filter.role) where.role = filter.role;
      return await prisma.user.count({ where });
    });
  }

  async countLawFirms(): Promise<number> {
    return executeWithRetry(async () => {
      return await prisma.lawFirm.count();
    });
  }

  async countLeads(filter: any): Promise<number> {
    return executeWithRetry(async () => {
      const where: any = {};
      if (filter && filter.lawFirmId) where.lawFirmId = filter.lawFirmId;
      return await prisma.lead.count({ where });
    });
  }

  async countCaseFiles(filter: any): Promise<number> {
    return executeWithRetry(async () => {
      const where: any = {};
      if (filter && filter.lawFirmId) where.lawFirmId = filter.lawFirmId;
      return await prisma.caseFile.count({ where });
    });
  }

  async countConversations(): Promise<number> {
    return executeWithRetry(async () => {
      return await prisma.conversation.count();
    });
  }

  async getSystemConfig(key: string): Promise<any> {
    return executeWithRetry(async () => {
      const config = await prisma.systemConfig.findUnique({ where: { key } });
      return config ? config.value : null;
    });
  }

  async updateSystemConfig(key: string, value: string): Promise<any> {
    return executeWithRetry(async () => {
      return await prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });
  }

  async getLawFirms(): Promise<any[]> {
    return executeWithRetry(async () => {
      const firms = await prisma.lawFirm.findMany({ orderBy: { createdAt: 'desc' } });
      return firms.map((f: any) => ({ ...f, _id: f.id }));
    });
  }

  async createLawFirm(firm: any): Promise<any> {
    return executeWithRetry(async () => {
      const { twilioConfig, metaConfig, telegramConfig, ...rest } = firm;
      const f = await prisma.lawFirm.create({
        data: {
          ...rest,
          twilioConfig: twilioConfig || undefined,
          metaConfig: metaConfig || undefined,
          telegramConfig: telegramConfig || undefined,
        },
      });
      return { ...f, _id: f.id };
    });
  }

  async getLawFirmById(id: string): Promise<any> {
    return executeWithRetry(async () => {
      const f = await prisma.lawFirm.findUnique({ where: { id } });
      return f ? { ...f, _id: f.id } : null;
    });
  }

  async updateLawFirm(id: string, updates: any): Promise<any> {
    return executeWithRetry(async () => {
      const { twilioConfig, metaConfig, telegramConfig, ...rest } = updates;
      const f = await prisma.lawFirm.update({
        where: { id },
        data: {
          ...rest,
          ...(twilioConfig !== undefined ? { twilioConfig: twilioConfig || null } : {}),
          ...(metaConfig !== undefined ? { metaConfig: metaConfig || null } : {}),
          ...(telegramConfig !== undefined ? { telegramConfig: telegramConfig || null } : {}),
        },
      });
      return { ...f, _id: f.id };
    });
  }

  async getCaseFiles(filter: any): Promise<any[]> {
    return executeWithRetry(async () => {
      const where: any = {};
      if (filter && filter.lawFirmId) where.lawFirmId = filter.lawFirmId;
      if (filter && filter.clientId) where.clientId = filter.clientId;
      const files = await prisma.caseFile.findMany({ where });
      return files.map((f: any) => ({ ...f, _id: f.id }));
    });
  }

  async getLeads(filter: any): Promise<any[]> {
    return executeWithRetry(async () => {
      const where: any = {};
      if (filter && filter.lawFirmId) where.lawFirmId = filter.lawFirmId;
      const leads = await prisma.lead.findMany({ where });
      return leads.map((l: any) => ({ ...l, _id: l.id }));
    });
  }

  async updateLead(filter: any, updates: any): Promise<any> {
    return executeWithRetry(async () => {
      const id = filter._id || filter.id;
      const l = await prisma.lead.update({
        where: { id },
        data: updates,
      });
      return { ...l, _id: l.id };
    });
  }

  async getLead(filter: any): Promise<any> {
    return executeWithRetry(async () => {
      const id = filter._id || filter.id;
      const l = await prisma.lead.findUnique({ where: { id } });
      return l ? { ...l, _id: l.id } : null;
    });
  }

  async createCaseFile(caseFile: any): Promise<any> {
    return executeWithRetry(async () => {
      const { documents, invoices, ...rest } = caseFile;
      const c = await prisma.caseFile.create({
        data: {
          ...rest,
          documents: documents || undefined,
          invoices: invoices || undefined,
        },
      });
      return { ...c, _id: c.id };
    });
  }

  async updateCaseFile(filter: any, updates: any): Promise<any> {
    return executeWithRetry(async () => {
      const id = filter._id || filter.id;
      const { documents, invoices, ...rest } = updates;
      const c = await prisma.caseFile.update({
        where: { id },
        data: {
          ...rest,
          ...(documents !== undefined ? { documents } : {}),
          ...(invoices !== undefined ? { invoices } : {}),
        },
      });
      return { ...c, _id: c.id };
    });
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContactDocument[]> {
    return executeWithRetry(async () => {
      const contacts = await prisma.emergencyContact.findMany({ where: { userId } });
      return contacts.map((c: any) => ({ ...c, _id: c.id })) as any;
    });
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContactDocument> {
    return executeWithRetry(async () => {
      const c = await prisma.emergencyContact.create({ data: contact });
      return { ...c, _id: c.id } as any;
    });
  }

  async updateEmergencyContact(id: string, updates: Partial<InsertEmergencyContact>): Promise<EmergencyContactDocument> {
    return executeWithRetry(async () => {
      const c = await prisma.emergencyContact.update({ where: { id }, data: updates });
      return { ...c, _id: c.id } as any;
    });
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    return executeWithRetry(async () => {
      await prisma.emergencyContact.delete({ where: { id } });
    });
  }

  async getLegalProcesses(userId: string): Promise<LegalProcessDocument[]> {
    return executeWithRetry(async () => {
      const processes = await prisma.legalProcess.findMany({ where: { userId } });
      return processes.map((p: any) => ({ ...p, _id: p.id })) as any;
    });
  }

  async getLegalProcess(id: string): Promise<LegalProcessDocument | undefined> {
    return executeWithRetry(async () => {
      const p = await prisma.legalProcess.findUnique({ where: { id } });
      return p ? ({ ...p, _id: p.id } as any) : undefined;
    });
  }

  async createLegalProcess(process: InsertLegalProcess): Promise<LegalProcessDocument> {
    return executeWithRetry(async () => {
      const { steps, requiredDocuments, constitutionalArticles, metadata, ...rest } = process as any;
      const p = await prisma.legalProcess.create({
        data: {
          ...rest,
          steps: steps || undefined,
          requiredDocuments: requiredDocuments || undefined,
          constitutionalArticles: constitutionalArticles || undefined,
          metadata: metadata || undefined,
        },
      });
      return { ...p, _id: p.id } as any;
    });
  }

  async updateLegalProcess(id: string, updates: Partial<InsertLegalProcess>): Promise<LegalProcessDocument> {
    return executeWithRetry(async () => {
      const { steps, requiredDocuments, constitutionalArticles, metadata, ...rest } = updates as any;
      const p = await prisma.legalProcess.update({
        where: { id },
        data: {
          ...rest,
          ...(steps !== undefined ? { steps } : {}),
          ...(requiredDocuments !== undefined ? { requiredDocuments } : {}),
          ...(constitutionalArticles !== undefined ? { constitutionalArticles } : {}),
          ...(metadata !== undefined ? { metadata } : {}),
        },
      });
      return { ...p, _id: p.id } as any;
    });
  }

  async getConsultations(userId: string): Promise<ConsultationDocument[]> {
    return executeWithRetry(async () => {
      const consultations = await prisma.consultation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return consultations.map((c: any) => ({ ...c, _id: c.id })) as any;
    });
  }

  async createConsultation(consultation: InsertConsultation): Promise<ConsultationDocument> {
    return executeWithRetry(async () => {
      const { metadata, ...rest } = consultation;
      const c = await prisma.consultation.create({
        data: {
          ...rest,
          metadata: metadata || undefined,
        },
      });
      return { ...c, _id: c.id } as any;
    });
  }

  async getEmergencyAlerts(userId: string): Promise<EmergencyAlertDocument[]> {
    return executeWithRetry(async () => {
      const alerts = await prisma.emergencyAlert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return alerts.map((a: any) => ({ ...a, _id: a.id })) as any;
    });
  }

  async createEmergencyAlert(alert: InsertEmergencyAlert): Promise<EmergencyAlertDocument> {
    return executeWithRetry(async () => {
      const { contactsNotified, ...rest } = alert;
      const a = await prisma.emergencyAlert.create({
        data: {
          ...rest,
          contactsNotified: contactsNotified || undefined,
        },
      });
      return { ...a, _id: a.id } as any;
    });
  }
}

// Export the robust PrismaStorage as default storage provider
export const storage = new PrismaStorage();