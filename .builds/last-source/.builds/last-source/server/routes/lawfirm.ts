import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth";
import multer from 'multer';
import { WhatsAppManager } from "../whatsapp/whatsapp-manager";
import qr from "qr-image";

export const lawfirmRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const requireLawyer = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Authentication required' });
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'lawyer') return res.status(403).json({ error: 'Access denied: Lawyer role required' });
  req.userId = user.id;
  req.lawFirmId = user.lawFirmId;
  next();
};

lawfirmRouter.post("/firm", requireAuth, async (req: any, res) => {
  try {
    const { name, specialty } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre del bufete requerido." });

    const firm = await storage.createLawFirm({
      name,
      specialty: specialty || 'general',
      subscriptionPlan: 'free',
      proBonoLimit: 3,
      proBonoUsed: 0,
      notorietyScore: 0
    });

    await storage.updateUser(req.userId, {
      role: "lawyer",
      lawFirmId: firm.id
    });

    res.json({ success: true, firm });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.get("/dashboard", requireLawyer, async (req: any, res) => {
  try {
    if (!req.lawFirmId) return res.status(400).json({ error: "Abogado no está asociado a ningún bufete/firma." });

    const firm = await storage.getLawFirmById(req.lawFirmId);
    if (!firm) return res.status(404).json({ error: "Firma de abogados no encontrada." });

    const newLeads = await storage.countLeads({ lawFirmId: req.lawFirmId, status: "new" });
    const totalLeads = await storage.countLeads({ lawFirmId: req.lawFirmId });
    const activeCases = await storage.countCaseFiles({ lawFirmId: req.lawFirmId, status: "active" });

    res.json({
      firmName: firm.name,
      specialty: firm.specialty,
      subscriptionPlan: firm.subscriptionPlan,
      proBonoLimit: firm.proBonoLimit,
      proBonoUsed: firm.proBonoUsed,
      notorietyScore: firm.notorietyScore,
      newLeads,
      totalLeads,
      activeCases
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.get("/leads", requireLawyer, async (req: any, res) => {
  try {
    if (!req.lawFirmId) return res.json([]);
    const leads = await storage.getLeads({ lawFirmId: req.lawFirmId });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.patch("/leads/:id", requireLawyer, async (req: any, res) => {
  try {
    const { status } = req.body;
    const lead = await storage.updateLead({ _id: req.params.id, lawFirmId: req.lawFirmId }, { status });
    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.post("/leads/:id/convert", requireLawyer, async (req: any, res) => {
  try {
    const lead = await storage.getLead({ _id: req.params.id, lawFirmId: req.lawFirmId });
    if (!lead) return res.status(404).json({ error: "Lead no encontrado." });

    let clientUser = null;
    if (lead.citizenId) {
      clientUser = await storage.getUser(lead.citizenId);
    } else {
      clientUser = await storage.createUser({
        email: lead.email || `${lead.phone || Date.now()}@lefri.ai`,
        name: lead.name,
        phone: lead.phone,
        role: "citizen"
      });
    }

    const newCase = await storage.createCaseFile({
      lawFirmId: req.lawFirmId,
      clientId: clientUser!.id,
      title: `Caso de ${lead.name} - ${lead.isProBono ? 'ProBono' : 'Contrato'}`,
      description: lead.summary || "Generado automáticamente desde Lead CRM",
      status: "active",
      progress: 10,
      documents: [],
      invoices: []
    });

    await storage.updateLead({ _id: lead.id }, { status: "converted" });

    res.json({ success: true, caseFile: newCase });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.get("/cases", requireLawyer, async (req: any, res) => {
  try {
    if (!req.lawFirmId) return res.json([]);
    const cases = await storage.getCaseFiles({ lawFirmId: req.lawFirmId });
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.post("/cases", requireLawyer, async (req: any, res) => {
  try {
    const { clientId, title, description, caseNumber, court, judge } = req.body;
    const newCase = await storage.createCaseFile({
      lawFirmId: req.lawFirmId,
      clientId,
      title,
      description,
      caseNumber,
      court,
      judge,
      status: "active",
      progress: 10,
      documents: [],
      invoices: []
    });
    res.json(newCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lawfirmRouter.patch("/cases/:id", requireLawyer, async (req: any, res) => {
  try {
    const updates = req.body;
    const caseFile = await storage.updateCaseFile({ _id: req.params.id, lawFirmId: req.lawFirmId }, { ...updates, updatedAt: new Date() });
    res.json(caseFile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lawyer/whatsapp/status -> Estado de conexión WhatsApp de la firma
lawfirmRouter.get("/whatsapp/status", requireLawyer, async (req: any, res) => {
  try {
    const firm = await storage.getLawFirmById(req.lawFirmId);
    if (!firm) return res.status(404).json({ error: "Firma de abogados no encontrada." });

    if (firm.whatsAppProvider === 'twilio' && firm.twilioConfig?.accountSid) {
      return res.json({ status: 'connected', provider: 'twilio' });
    }
    if (firm.whatsAppProvider === 'meta' && firm.metaConfig?.phoneNumberId) {
      return res.json({ status: 'connected', provider: 'meta' });
    }

    // Default to integrated Baileys (WhatsAppManager)
    const status = WhatsAppManager.getConnectionStatus(req.lawFirmId);
    res.json({ status, provider: 'baileys' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lawyer/whatsapp/qr -> Sirve la imagen QR para escanear
lawfirmRouter.get("/whatsapp/qr", requireLawyer, async (req: any, res) => {
  try {
    const tenantId = req.lawFirmId;
    // Ensure client is initialized
    await WhatsAppManager.getClient(tenantId);

    let code = WhatsAppManager.getQrCode(tenantId);
    let attempts = 0;
    while (!code && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      code = WhatsAppManager.getQrCode(tenantId);
      attempts++;
    }

    if (!code) {
      const status = WhatsAppManager.getConnectionStatus(tenantId);
      if (status === "connected") {
        return res.status(200).send("CONNECTED");
      }
      return res.status(404).send("QR code not ready yet, please refresh in a moment.");
    }

    const qrImage = qr.image(code, { type: "png", margin: 4 });
    res.setHeader("Content-Type", "image/png");
    qrImage.pipe(res);
  } catch (error: any) {
    console.error("Error serving lawyer WhatsApp QR:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lawyer/whatsapp/provider -> Cambiar proveedor de WhatsApp
lawfirmRouter.post("/whatsapp/provider", requireLawyer, async (req: any, res) => {
  try {
    const { provider, twilioConfig, metaConfig } = req.body;
    await storage.updateLawFirm(req.lawFirmId, {
      whatsAppProvider: provider,
      ...(provider === 'twilio' ? { twilioConfig } : {}),
      ...(provider === 'meta' ? { metaConfig } : {})
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lawyer/whatsapp/disconnect -> Desconectar la sesión de WhatsApp
lawfirmRouter.post("/whatsapp/disconnect", requireLawyer, async (req: any, res) => {
  try {
    // Disconnect from integrated WhatsAppManager
    await WhatsAppManager.disconnect(req.lawFirmId);
    await storage.updateLawFirm(req.lawFirmId, {
      whatsAppSessionActive: false,
      whatsAppProvider: 'baileys',
      twilioConfig: null,
      metaConfig: null
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
