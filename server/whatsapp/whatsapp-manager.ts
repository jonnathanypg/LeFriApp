/**
 * whatsapp-manager.ts
 *
 * WhatsApp session manager integrated directly into the main Express server.
 * Uses Baileys (multi-file auth) to manage multiple tenant sessions in memory,
 * persisting credentials to MySQL via Prisma for reconnection on server restart.
 *
 * Architecture note: Previously this ran as a separate microservice on port 3001.
 * It is now embedded in the main Express server process to simplify deployment
 * on Hostinger Business Hosting (single Node.js app per project).
 */

import * as Baileys from "@whiskeysockets/baileys";
import { prisma, executeWithRetry } from "../prisma-client";
import fs from "fs";
import path from "path";
import pino from "pino";
import axios from "axios";

// ──────────────────────────────────────────────────────────────────────────────
// WhatsAppManager — static class managing multiple tenant Baileys sockets
// ──────────────────────────────────────────────────────────────────────────────
export class WhatsAppManager {
  private static instances: Map<string, Baileys.WASocket> = new Map();
  private static qrCodes: Map<string, string> = new Map();
  private static connectionStates: Map<string, string> = new Map();

  /** Get or initialize a WhatsApp socket for the given tenantId */
  public static async getClient(tenantId: string): Promise<Baileys.WASocket> {
    if (this.instances.has(tenantId)) {
      return this.instances.get(tenantId)!;
    }
    return await this.initSession(tenantId);
  }

  /** Get the QR code string for the given tenantId (if available) */
  public static getQrCode(tenantId: string): string | undefined {
    return this.qrCodes.get(tenantId);
  }

  /** Get the current connection status string for the given tenantId */
  public static getConnectionStatus(tenantId: string): string {
    return this.connectionStates.get(tenantId) || "disconnected";
  }

  /** Disconnect and clean up a tenant session */
  public static async disconnect(tenantId: string): Promise<void> {
    const socket = this.instances.get(tenantId);
    if (socket) {
      try {
        socket.end(undefined);
      } catch (err) {
        console.error(`[WA-Manager] Error closing socket for ${tenantId}:`, err);
      }
      this.instances.delete(tenantId);
      this.connectionStates.set(tenantId, "disconnected");
      this.qrCodes.delete(tenantId);
    }

    // Remove session files from /tmp
    const sessionDir = path.join("/tmp", "wa_sessions", tenantId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }

    // Remove from MySQL via Prisma
    try {
      await executeWithRetry(() =>
        prisma.whatsAppSession.deleteMany({ where: { tenantId } })
      );
    } catch (err) {
      console.error(`[WA-Manager] Error deleting DB session for ${tenantId}:`, err);
    }
  }

  /** Initialize a Baileys session for a tenant */
  private static async initSession(tenantId: string): Promise<Baileys.WASocket> {
    const sessionDir = path.join("/tmp", "wa_sessions", tenantId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // 1. Restore Baileys auth files from MySQL if available
    try {
      const dbSession = await executeWithRetry(() =>
        prisma.whatsAppSession.findUnique({ where: { tenantId } })
      );
      if (dbSession?.creds) {
        // creds is stored as a JSON string containing the file map
        const filesMap: Record<string, string> = JSON.parse(dbSession.creds);
        console.log(`[WA-Manager] Restoring ${Object.keys(filesMap).length} session files for tenant: ${tenantId}`);
        for (const [filename, contentBase64] of Object.entries(filesMap)) {
          const filePath = path.join(sessionDir, filename);
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

    // 2. Initialize Baileys Multi-File Auth State
    const { state, saveCreds } = await Baileys.useMultiFileAuthState(sessionDir);

    const socket = Baileys.default({
      printQRInTerminal: false,
      browser: Baileys.Browsers.macOS("Desktop"),
      logger: pino({ level: "silent" }) as any,
      auth: state,
    });

    this.instances.set(tenantId, socket);
    this.connectionStates.set(tenantId, "connecting");

    // Helper to persist all session files to MySQL via Prisma
    const saveSessionToMySQL = async () => {
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
              filesMap[relativePath] = fs.readFileSync(fullPath).toString("base64");
            }
          }
        };
        readDirRecursive(sessionDir);

        await executeWithRetry(() =>
          prisma.whatsAppSession.upsert({
            where: { tenantId },
            update: { creds: JSON.stringify(filesMap) },
            create: { tenantId, creds: JSON.stringify(filesMap) },
          })
        );
      } catch (err) {
        console.error(`[WA-Manager] Error saving session to MySQL for ${tenantId}:`, err);
      }
    };

    // Listen to credentials update
    socket.ev.on("creds.update", async () => {
      await saveCreds();
      await saveSessionToMySQL();
    });

    // Listen to connection state changes
    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCodes.set(tenantId, qr);
        this.connectionStates.set(tenantId, "qr_ready");
        console.log(`[WA-Manager] QR generado para tenant: ${tenantId}`);
      }

      if (connection === "open") {
        this.qrCodes.delete(tenantId);
        this.connectionStates.set(tenantId, "connected");
        console.log(`[WA-Manager] Sesión conectada para tenant: ${tenantId}`);
        await saveSessionToMySQL(); // Final backup after connect
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as any)?.output?.statusCode !==
          Baileys.DisconnectReason.loggedOut;
        console.log(
          `[WA-Manager] Conexión cerrada para tenant: ${tenantId}. Reconectando: ${shouldReconnect}`
        );

        if (shouldReconnect) {
          this.connectionStates.set(tenantId, "reconnecting");
          this.instances.delete(tenantId);
          setTimeout(() => this.initSession(tenantId), 5000);
        } else {
          // Logged out — clean up everything
          await this.disconnect(tenantId);
        }
      }
    });

    // Forward incoming messages to the webhook handler in the same process
    socket.ev.on("messages.upsert", async (m) => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            const phone = msg.key.remoteJid?.split("@")[0];
            let text =
              msg.message.conversation ||
              msg.message.extendedTextMessage?.text;
            let audioBase64: string | undefined;

            if (msg.message.audioMessage) {
              try {
                const stream = await Baileys.downloadContentFromMessage(
                  msg.message.audioMessage,
                  "audio"
                );
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                  buffer = Buffer.concat([buffer, chunk]);
                }
                audioBase64 = buffer.toString("base64");
              } catch (e) {
                console.error("[WA-Manager] Error descargando audio:", e);
              }
            }

            if (phone && (text || audioBase64)) {
              this.forwardToWebhook(phone, text, audioBase64, tenantId);
            }
          }
        }
      }
    });

    return socket;
  }

  /**
   * Forward incoming WhatsApp message to the /api/webhooks/whatsapp endpoint.
   * Since both run in the same process, we POST to localhost on the same port.
   */
  private static forwardToWebhook(
    phone: string,
    text: string | null | undefined,
    audioBase64: string | undefined,
    tenantId: string
  ) {
    const port = process.env.PORT || 8080;
    axios
      .post(`http://127.0.0.1:${port}/api/webhooks/whatsapp`, {
        phone,
        text,
        audioBase64,
        tenantId,
      })
      .catch((err) => {
        console.error(
          `[WA-Manager] Error reenviando mensaje de ${phone}:`,
          err.message
        );
      });
  }

  /** Send a text message from a tenant's WhatsApp session */
  public static async sendMessage(
    tenantId: string,
    phone: string,
    text: string
  ): Promise<any> {
    const socket = await this.getClient(tenantId);
    if (!socket) {
      throw new Error(`Cliente WhatsApp no disponible para tenant ${tenantId}`);
    }
    const formattedPhone = phone.includes("@s.whatsapp.net")
      ? phone
      : `${phone.replace(/\D/g, "")}@s.whatsapp.net`;
    return await socket.sendMessage(formattedPhone, { text });
  }

  /** Autostart all sessions that have stored credentials in MySQL */
  public static async autoStartAll(): Promise<void> {
    try {
      const sessions = await executeWithRetry(() =>
        prisma.whatsAppSession.findMany({ select: { tenantId: true } })
      );
      console.log(`[WA-Manager] Reiniciando ${sessions.length} sesiones guardadas...`);
      for (const session of sessions) {
        this.initSession(session.tenantId).catch((err) => {
          console.error(
            `[WA-Manager] Error reiniciando sesión para ${session.tenantId}:`,
            err
          );
        });
      }
    } catch (err) {
      console.error("[WA-Manager] Error al reiniciar sesiones:", err);
    }
  }
}
