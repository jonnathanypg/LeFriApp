import { Router, Request, Response } from "express";
import { WhatsAppManager } from "../whatsapp-manager";
import qr from "qr-image";

const router: Router = Router();

// GET /whatsapp/qr/:tenantId -> Devuelve la imagen del QR para escanear
router.get("/qr/:tenantId", async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  try {
    // Asegurar que el cliente esté inicializado y generando QR
    await WhatsAppManager.getClient(tenantId);
    
    // Esperar un instante para que se genere el QR si acaba de iniciar
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
    console.error("Error serving WhatsApp QR:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /whatsapp/status/:tenantId -> Devuelve el estado de la conexión
router.get("/status/:tenantId", (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const status = WhatsAppManager.getConnectionStatus(tenantId);
  res.json({ tenantId, status });
});

// POST /whatsapp/send -> Envía un mensaje a un teléfono
router.post("/send", async (req: Request, res: Response) => {
  const { tenantId, phone, text } = req.body;
  
  if (!tenantId || !phone || !text) {
    return res.status(400).json({ error: "Missing tenantId, phone, or text" });
  }

  try {
    const response = await WhatsAppManager.sendMessage(tenantId, phone, text);
    res.json({ success: true, response });
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /whatsapp/disconnect/:tenantId -> Cierra y elimina la sesión
router.post("/disconnect/:tenantId", async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  try {
    await WhatsAppManager.disconnect(tenantId);
    res.json({ success: true, message: `Disconnected session for tenant: ${tenantId}` });
  } catch (error: any) {
    console.error("Error disconnecting session:", error);
    res.status(500).json({ error: error.message });
  }
});

export { router };
