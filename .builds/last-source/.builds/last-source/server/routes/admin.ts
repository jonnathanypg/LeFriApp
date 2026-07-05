import { Router } from "express";
import { storage } from "../storage";
import { telegramService } from "../services/telegram";
import axios from 'axios';
import { WhatsAppManager } from "../whatsapp/whatsapp-manager";
import qr from "qr-image";

export const adminRouter = Router();

export const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Authentication required' });
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Access denied: Admin role required' });
  req.userId = user.id;
  next();
};

adminRouter.get("/config", requireAdmin, async (req, res) => {
  try {
    const telegramTokenConfig = await storage.getSystemConfig('b2c_telegram_token');

    const waStatus = WhatsAppManager.getConnectionStatus('SYSTEM_B2C');

    const totalUsers = await storage.countUsers({});
    const totalCitizens = await storage.countUsers({ role: 'citizen' });
    const totalLawyers = await storage.countUsers({ role: 'lawyer' });
    const totalFirms = await storage.countLawFirms();
    const totalLeads = await storage.countLeads({});
    const totalCases = await storage.countCaseFiles({});
    const totalConversations = await storage.countConversations();

    res.json({
      telegramToken: telegramTokenConfig ? telegramTokenConfig.value : "",
      whatsappStatus: waStatus,
      stats: { totalUsers, totalCitizens, totalLawyers, totalFirms, totalLeads, totalCases, totalConversations }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/config", requireAdmin, async (req, res) => {
  try {
    const { telegramToken } = req.body;
    if (telegramToken !== undefined) {
      await storage.updateSystemConfig('b2c_telegram_token', telegramToken);
      if (telegramToken) {
        const host = req.get('host');
        if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
          await telegramService.setWebhook(`${req.protocol}://${host}`);
        }
      } else {
        await telegramService.deleteWebhook();
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/whatsapp/qr -> Sirve la imagen QR del canal B2C central
adminRouter.get("/whatsapp/qr", requireAdmin, async (req, res) => {
  try {
    const tenantId = 'SYSTEM_B2C';
    // Initialize client if not yet started
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
    console.error("Error serving admin WhatsApp QR:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/whatsapp/disconnect -> Desconectar el canal B2C central
adminRouter.post("/whatsapp/disconnect", requireAdmin, async (req, res) => {
  try {
    await WhatsAppManager.disconnect('SYSTEM_B2C');
    res.json({ success: true, message: "Canal B2C desconectado correctamente." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/whatsapp/connect -> Iniciar el canal B2C central
adminRouter.post("/whatsapp/connect", requireAdmin, async (req, res) => {
  try {
    await WhatsAppManager.getClient('SYSTEM_B2C');
    res.json({ success: true, message: "Canal B2C iniciado. Escanea el QR." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/firms", requireAdmin, async (req, res) => {
  try {
    const firms = await storage.getLawFirms();
    res.json(firms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
