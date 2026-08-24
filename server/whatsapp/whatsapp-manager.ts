/**
 * whatsapp-manager.ts
 *
 * WhatsApp session manager integrated directly into the main Express server.
 * Uses Baileys (useMultiFileAuthState) with persistent local storage in sessions/
 * and automatic synchronization to MySQL via Prisma.
 * Zero MongoDB dependency: 100% unified in MySQL.
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

  private static getSessionDir(tenantId: string): string {
    const baseDir = path.join(process.cwd(), "sessions");
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    const sessionDir = path.join(baseDir, `wa_${tenantId}`);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    return sessionDir;
  }

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

    // Remove session files from sessions dir
    const sessionDir = this.getSessionDir(tenantId);
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
    const sessionDir = this.getSessionDir(tenantId);

    // 1. Restore Baileys auth files from MySQL if available and directory is empty
    try {
      const dbSession = await executeWithRetry(() =>
        prisma.whatsAppSession.findUnique({ where: { tenantId } })
      );
      if (dbSession?.creds) {
        const filesMap: Record<string, string> = JSON.parse(dbSession.creds);
        console.log(`[WA-Manager] Restoring ${Object.keys(filesMap).length} session files from MySQL for tenant: ${tenantId}`);
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
      console.error(`[WA-Manager] Error restoring session from MySQL for ${tenantId}:`, error);
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
        console.log(`[WA-Manager] QR code generated for tenant: ${tenantId}`);
      }

      if (connection === "close") {
        this.connectionStates.set(tenantId, "disconnected");
        this.qrCodes.delete(tenantId);
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== Baileys.DisconnectReason.loggedOut;
        console.log(`[WA-Manager] Connection closed for ${tenantId}. Code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(() => this.initSession(tenantId), 5000);
        } else {
          await this.disconnect(tenantId);
        }
      } else if (connection === "open") {
        this.connectionStates.set(tenantId, "connected");
        this.qrCodes.delete(tenantId);
        console.log(`[WA-Manager] WhatsApp connection OPEN for tenant: ${tenantId}`);
        await saveSessionToMySQL();
      }
    });

    // Listen for incoming messages and forward to /api/webhooks/whatsapp
    socket.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        const from = msg.key.remoteJid;
        if (!from || from.endsWith("@g.us")) continue; // Skip group messages

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          "";

        console.log(`[WA-Manager] Incoming message from ${from} for tenant ${tenantId}`);
        this.forwardToWebhook(tenantId, from.replace("@s.whatsapp.net", ""), text, msg);
      }
    });

    return socket;
  }

  /**
   * Forward incoming WhatsApp message to the /api/webhooks/whatsapp endpoint.
   */
  private static async forwardToWebhook(
    tenantId: string,
    phone: string,
    text: string,
    rawMessage: any
  ): Promise<void> {
    const port = process.env.PORT || 8080;
    try {
      await axios.post(`http://127.0.0.1:${port}/api/webhooks/whatsapp`, {
        tenantId,
        phone,
        text,
        rawMessage,
      });
    } catch (err: any) {
      console.error(`[WA-Manager] Error forwarding to webhook:`, err.message);
    }
  }

  /**
   * Send a humanized WhatsApp message (with typing simulation and paragraph chunking).
   */
  public static async sendHumanizedMessage(
    tenantId: string,
    to: string,
    message: string
  ): Promise<any> {
    const socket = await this.getClient(tenantId);
    const jid = to.includes("@s.whatsapp.net") ? to : `${to.replace(/\D/g, "")}@s.whatsapp.net`;

    // 1. Simulate typing presence
    try {
      await socket.sendPresenceUpdate("composing", jid);
    } catch (e) {}

    const typingDelay = Math.min(1500, Math.max(500, message.length * 15));
    await new Promise((r) => setTimeout(r, typingDelay));

    try {
      await socket.sendPresenceUpdate("paused", jid);
    } catch (e) {}

    // 2. Send message
    return await socket.sendMessage(jid, { text: message });
  }

  /**
   * Auto-start all saved WhatsApp sessions from MySQL on server startup.
   */
  public static async autoStartAll(): Promise<void> {
    try {
      const sessions = await executeWithRetry(() =>
        prisma.whatsAppSession.findMany({ select: { tenantId: true } })
      );
      console.log(`[WA-Manager] Found ${sessions.length} saved WhatsApp sessions in MySQL.`);
      for (const { tenantId } of sessions) {
        this.initSession(tenantId).catch((err) =>
          console.error(`[WA-Manager] Failed to auto-start session for ${tenantId}:`, err)
        );
      }
    } catch (error) {
      console.error("[WA-Manager] Error in autoStartAll:", error);
    }
  }
}
