/**
 * whatsapp.ts (service)
 *
 * High-level WhatsApp service used by the application layer.
 * Now delegates Baileys sessions to the embedded WhatsAppManager
 * instead of making HTTP calls to a separate microservice.
 */

import { storage } from "../storage";
import twilio from "twilio";
import axios from "axios";
import { WhatsAppManager } from "../whatsapp/whatsapp-manager";

export interface WhatsAppMessage {
  to: string;
  message: string;
  tenantId?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private defaultTenantId: string;

  constructor() {
    this.defaultTenantId = "SYSTEM_B2C";
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      const tenantId = message.tenantId || this.defaultTenantId;
      console.log(
        `[WhatsAppService] Sending message to ${message.to} via tenant ${tenantId}`
      );

      let lawFirm = null;
      if (tenantId && tenantId !== this.defaultTenantId) {
        lawFirm = await storage.getLawFirmById(tenantId);
      }

      const provider = lawFirm?.whatsAppProvider || "baileys";

      if (
        provider === "twilio" &&
        lawFirm?.twilioConfig?.accountSid &&
        lawFirm?.twilioConfig?.authToken
      ) {
        const client = new twilio.Twilio(
          lawFirm.twilioConfig.accountSid,
          lawFirm.twilioConfig.authToken
        );
        const twilioMessage = await client.messages.create({
          body: message.message,
          from: `whatsapp:${lawFirm.twilioConfig.phoneNumber}`,
          to: `whatsapp:+${message.to.replace(/\D/g, "")}`,
        });
        return {
          success: true,
          messageId: twilioMessage.sid,
        };
      } else if (
        provider === "meta" &&
        lawFirm?.metaConfig?.accessToken &&
        lawFirm?.metaConfig?.phoneNumberId
      ) {
        const { phoneNumberId, accessToken } = lawFirm.metaConfig;
        const response = await axios.post(
          `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
          {
            messaging_product: "whatsapp",
            to: message.to.replace(/\D/g, ""),
            type: "text",
            text: { body: message.message },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        return {
          success: true,
          messageId: response.data?.messages?.[0]?.id,
        };
      } else {
        // Default: Baileys via the embedded WhatsAppManager
        const result = await WhatsAppManager.sendMessage(
          tenantId,
          message.to,
          message.message
        );
        return {
          success: true,
          messageId: (result as any)?.key?.id || "sent",
        };
      }
    } catch (error) {
      console.error("[WhatsAppService] send error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendEmergencyAlert(params: {
    contacts: Array<{ phone: string; name: string }>;
    message: string;
    location?: { latitude: number; longitude: number };
    voiceNoteUrl?: string;
    tenantId?: string;
  }): Promise<Array<{ phone: string; name: string; success: boolean; error?: string }>> {
    const results = [];
    const tenantId = params.tenantId || this.defaultTenantId;

    for (const contact of params.contacts) {
      let messageToSend = params.message;

      if (params.location) {
        const mapsUrl = `https://maps.google.com/maps?q=${params.location.latitude},${params.location.longitude}`;
        messageToSend += `\n\nUbicación: ${mapsUrl}`;
      }

      if (params.voiceNoteUrl) {
        messageToSend += `\n\n🎤 Nota de voz de emergencia: ${params.voiceNoteUrl}`;
      }

      const textResult = await this.sendMessage({
        to: contact.phone,
        message: messageToSend,
        tenantId,
      });

      results.push({
        phone: contact.phone,
        name: contact.name,
        success: textResult.success,
        error: textResult.error,
      });
    }

    return results;
  }

  async sendVoiceNote(params: {
    to: string;
    audioUrl: string;
    caption?: string;
    tenantId?: string;
  }): Promise<WhatsAppResponse> {
    const tenantId = params.tenantId || this.defaultTenantId;
    return this.sendMessage({
      to: params.to,
      message: `${params.caption || "Nota de voz"}: ${params.audioUrl}`,
      tenantId,
    });
  }

  isConfigured(): boolean {
    return true; // Always available via embedded WhatsAppManager
  }
}

export const whatsAppService = new WhatsAppService();