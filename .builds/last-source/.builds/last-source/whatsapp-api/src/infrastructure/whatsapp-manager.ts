import * as Baileys from "@whiskeysockets/baileys";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import pino from "pino";
import axios from "axios";

// MongoDB Session schema for Baileys
const whatsappSessionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  files: { type: Map, of: String }, // filename -> base64 content
  updatedAt: { type: Date, default: Date.now }
});

const WhatsAppSessionModel = mongoose.models.WhatsAppSession || mongoose.model("WhatsAppSession", whatsappSessionSchema);

export class WhatsAppManager {
  private static instances: Map<string, Baileys.WASocket> = new Map();
  private static qrCodes: Map<string, string> = new Map();
  private static connectionStates: Map<string, string> = new Map();

  public static async getClient(tenantId: string): Promise<Baileys.WASocket> {
    if (this.instances.has(tenantId)) {
      return this.instances.get(tenantId)!;
    }
    return await this.initSession(tenantId);
  }

  public static getQrCode(tenantId: string): string | undefined {
    return this.qrCodes.get(tenantId);
  }

  public static getConnectionStatus(tenantId: string): string {
    return this.connectionStates.get(tenantId) || "disconnected";
  }

  public static async disconnect(tenantId: string): Promise<void> {
    const socket = this.instances.get(tenantId);
    if (socket) {
      try {
        socket.end(undefined);
      } catch (err) {
        console.error(`Error closing socket for ${tenantId}:`, err);
      }
      this.instances.delete(tenantId);
      this.connectionStates.set(tenantId, "disconnected");
      this.qrCodes.delete(tenantId);
    }

    // Clear session files locally and in DB
    const sessionDir = path.join("/tmp", "sessions", tenantId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
    await WhatsAppSessionModel.deleteOne({ tenantId });
  }

  private static async initSession(tenantId: string): Promise<Baileys.WASocket> {
    const sessionDir = path.join("/tmp", "sessions", tenantId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // 1. Restore files from MongoDB if available
    try {
      const dbSession = await WhatsAppSessionModel.findOne({ tenantId });
      if (dbSession && dbSession.files) {
        console.log(`[WA-Manager] Restoring session files for: ${tenantId}`);
        for (const [filename, contentBase64] of dbSession.files.entries()) {
          const filePath = path.join(sessionDir, filename);
          // Ensure subdirectory exists inside sessionDir if filename contains slashes
          const fileDir = path.dirname(filePath);
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }
          fs.writeFileSync(filePath, Buffer.from(contentBase64, "base64"));
        }
      }
    } catch (error) {
      console.error(`[WA-Manager] Error restoring session for ${tenantId}:`, error);
    }

    // 2. Initialize Baileys Multi-File Auth State pointing to our /tmp/sessionDir
    const { state, saveCreds } = await Baileys.useMultiFileAuthState(sessionDir);

    const socket = Baileys.default({
      printQRInTerminal: false,
      browser: Baileys.Browsers.macOS("Desktop"),
      logger: pino({ level: "silent" }) as any,
      auth: state,
    });

    this.instances.set(tenantId, socket);
    this.connectionStates.set(tenantId, "connecting");

    // Helper to save all files back to MongoDB
    const saveSessionToMongo = async () => {
      try {
        const filesMap: Record<string, string> = {};
        const readDirRecursive = (dir: string, baseRelative: string = "") => {
          if (!fs.existsSync(dir)) return;
          const list = fs.readdirSync(dir);
          for (const file of list) {
            const fullPath = path.join(dir, file);
            const relativePath = path.join(baseRelative, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              readDirRecursive(fullPath, relativePath);
            } else {
              const fileContent = fs.readFileSync(fullPath);
              filesMap[relativePath] = fileContent.toString("base64");
            }
          }
        };

        readDirRecursive(sessionDir);

        await WhatsAppSessionModel.findOneAndUpdate(
          { tenantId },
          { files: filesMap, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`[WA-Manager] Error saving session to DB for ${tenantId}:`, err);
      }
    };

    // Listen to credentials update
    socket.ev.on("creds.update", async () => {
      await saveCreds();
      await saveSessionToMongo();
    });

    // Listen to connection update
    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Save QR code in memory to serve it to the frontend
        this.qrCodes.set(tenantId, qr);
        this.connectionStates.set(tenantId, "qr_ready");
        console.log(`[WA-Manager] QR generated for tenant: ${tenantId}`);
      }

      if (connection === "open") {
        this.qrCodes.delete(tenantId);
        this.connectionStates.set(tenantId, "connected");
        console.log(`[WA-Manager] Session connected successfully for tenant: ${tenantId}`);
        await saveSessionToMongo(); // Final backup
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== Baileys.DisconnectReason.loggedOut;
        console.log(`[WA-Manager] Connection closed for tenant: ${tenantId}. Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          this.connectionStates.set(tenantId, "reconnecting");
          // Re-initialize
          this.instances.delete(tenantId);
          setTimeout(() => this.initSession(tenantId), 5000);
        } else {
          // Logged out
          await this.disconnect(tenantId);
        }
      }
    });

    // Listen for incoming messages to route them to the main backend AI agent
    socket.ev.on("messages.upsert", async (m) => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            const phone = msg.key.remoteJid?.split("@")[0];
            let text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            let audioBase64: string | undefined;

            if (msg.message.audioMessage) {
              try {
                const stream = await Baileys.downloadContentFromMessage(msg.message.audioMessage, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                  buffer = Buffer.concat([buffer, chunk]);
                }
                audioBase64 = buffer.toString('base64');
              } catch (e) {
                console.error('Error downloading audio message:', e);
              }
            }

            if (phone && (text || audioBase64)) {
              this.forwardToBackend(phone, text, audioBase64, tenantId);
            }
          }
        }
      }
    });

    return socket;
  }

  // Forward incoming message to LeFriApp's Express server
  private static async forwardToBackend(phone: string, text: string | null | undefined, audioBase64: string | undefined, tenantId: string) {
    try {
      const backendUrl = process.env.LEFRI_BACKEND_URL || "http://localhost:5000";
      await axios.post(`${backendUrl}/api/webhooks/whatsapp`, {
        phone,
        text,
        audioBase64,
        tenantId
      });
    } catch (err: any) {
      console.error(`[WA-Manager] Error forwarding message from ${phone} to backend:`, err.message);
    }
  }

  // Helper method to send messages
  public static async sendMessage(tenantId: string, phone: string, text: string): Promise<any> {
    const socket = await this.getClient(tenantId);
    if (!socket) {
      throw new Error(`WhatsApp client not ready for tenant ${tenantId}`);
    }
    const formattedPhone = phone.includes("@c.us") ? phone : `${phone}@c.us`;
    return await socket.sendMessage(formattedPhone, { text });
  }

  // Autostart all sessions stored in database upon server launch
  public static async autoStartAll() {
    try {
      const sessions = await WhatsAppSessionModel.find({}, { tenantId: 1 });
      console.log(`[WA-Manager] Autostarting ${sessions.length} sessions...`);
      for (const session of sessions) {
        this.initSession(session.tenantId).catch(err => {
          console.error(`Failed to autostart session for ${session.tenantId}:`, err);
        });
      }
    } catch (err) {
      console.error("[WA-Manager] Error autostarting sessions:", err);
    }
  }
}
