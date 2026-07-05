/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Currently, Telegram commands and webhooks are handled centrally.
 * In a P2P decentralized state:
 * 1. Centralized bot logic is replaced by local-first interfaces or P2P decentralized chat bots.
 * 2. Handlers listen directly on peer-to-peer pubsub overlay networks instead of central HTTP webhooks.
 */

import { multiAgentService } from "./multi-agent";
import { matchmakerService } from "./matchmaker";
import { transcriptionService } from "./transcription";
import { prisma, executeWithRetry } from "../prisma-client";
import { storage } from "../storage";
import crypto from 'crypto';

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export class TelegramService {
  private async getBotToken(): Promise<string | null> {
    try {
      const config = await executeWithRetry(() =>
        prisma.systemConfig.findFirst({ where: { key: 'b2c_telegram_token' } })
      );
      if (config && config.value) {
        return config.value as string;
      }
    } catch (e) {
      console.error("[TelegramService] Error getting token from DB:", e);
    }
    return process.env.TELEGRAM_BOT_TOKEN || null;
  }

  async isConfigured(): Promise<boolean> {
    const token = await this.getBotToken();
    return !!token;
  }

  // Send message to a specific Telegram chat ID
  async sendMessage(chatId: string, text: string, replyMarkup?: any): Promise<boolean> {
    try {
      const token = await this.getBotToken();
      if (!token) {
        console.warn("[TelegramService] Cannot send message: Bot token is not configured.");
        return false;
      }

      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const body: any = {
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      };

      if (replyMarkup) {
        body.reply_markup = replyMarkup;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[TelegramService] Error sending message: Status ${response.status} - ${errText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[TelegramService] Send error:", error);
      return false;
    }
  }

  // Configure Telegram Bot Webhook
  async setWebhook(domain: string): Promise<boolean> {
    try {
      const token = await this.getBotToken();
      if (!token) return false;

      const webhookUrl = `${domain}/api/webhooks/telegram`;
      console.log(`[TelegramService] Setting webhook to: ${webhookUrl}`);

      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl })
      });

      const data = await response.json();
      return !!(data && data.ok);
    } catch (error) {
      console.error("[TelegramService] Error setting webhook:", error);
      return false;
    }
  }

  // Remove Telegram Bot Webhook
  async deleteWebhook(): Promise<boolean> {
    try {
      const token = await this.getBotToken();
      if (!token) return false;

      const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
        method: "POST"
      });

      const data = await response.json();
      return !!(data && data.ok);
    } catch (error) {
      console.error("[TelegramService] Error deleting webhook:", error);
      return false;
    }
  }

  // Main message routing handler for Telegram updates
  async handleUpdate(update: any): Promise<void> {
    if (!update || !update.message) return;

    const message = update.message;
    const chatId = message.chat.id.toString();
    let text = message.text;
    const contact = message.contact;
    const voice = message.voice || message.audio;

    try {
      // 0. Handle voice transcription
      if (voice) {
        const token = await this.getBotToken();
        if (token) {
          try {
            const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${voice.file_id}`);
            const fileData = await fileRes.json();
            if (fileData.ok) {
              const filePath = fileData.result.file_path;
              const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
              const transcription = await transcriptionService.transcribeAudioUrl(fileUrl);
              text = `[Nota de Voz]: "${transcription}"`;
            }
          } catch (e) {
            console.error("[TelegramService] Error processing voice message:", e);
          }
        }
      }

      // 1. Process contact sharing (onboarding)
      if (contact) {
        let phone = contact.phone_number;
        phone = phone.replace(/\D/g, "");

        const phoneHash = hashValue(phone);
        let user = await executeWithRetry(() =>
          prisma.user.findFirst({ where: { phoneHash } })
        );

        if (!user) {
          user = await executeWithRetry(() =>
            prisma.user.create({
              data: {
                email: `${phone}@lefri.ai`,
                name: `${contact.first_name} ${contact.last_name || ""}`.trim(),
                phone: phone,
                phoneHash: phoneHash,
                telegramChatId: chatId,
                role: "citizen",
                country: "EC",
                language: "es"
              }
            })
          );

          await this.sendMessage(chatId, `¡Bienvenido a LeFriApp! He creado tu cuenta de ciudadano asociada al número *${phone}*.\n\nSoy tu Mediador Legal de IA personal. Pregúntame lo que desees sobre tus derechos o redacta borradores de documentos.`, {
            remove_keyboard: true
          });
        } else {
          await executeWithRetry(() =>
            prisma.user.update({
              where: { id: user!.id },
              data: { telegramChatId: chatId }
            })
          );

          await this.sendMessage(chatId, `¡Perfecto, *${user.name}*! Tu cuenta de LeFriApp ha sido vinculada correctamente con Telegram. Ahora podré responder tus consultas con acceso directo a tus borradores y casos.`, {
            remove_keyboard: true
          });
        }
        return;
      }

      // 2. Handle /start command
      if (text && text.toLowerCase().startsWith("/start")) {
        const chatIdHash = hashValue(chatId);
        const user = await executeWithRetry(() =>
          prisma.user.findFirst({ where: { telegramChatIdHash: chatIdHash } })
        );
        if (user) {
          await this.sendMessage(
            chatId,
            `¡Hola de nuevo, *${user.name}*! ¿En qué puedo asistirte legalmente hoy? Recuerda que puedo ver tus borradores de documentos y procesos educativos.`
          );
        } else {
          await this.sendMessage(
            chatId,
            `¡Hola! Bienvenido al asistente legal de *LeFriApp*. Para poder ayudarte de forma personalizada, necesitamos vincular tu número de teléfono registrado en nuestra plataforma.`,
            {
              keyboard: [[{
                text: "📱 Compartir mi número de teléfono",
                request_contact: true
              }]],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          );
        }
        return;
      }

      // 3. Process regular text message
      if (text) {
        const chatIdHash = hashValue(chatId);
        const user = await executeWithRetry(() =>
          prisma.user.findFirst({ where: { telegramChatIdHash: chatIdHash } })
        );

        if (!user) {
          await this.sendMessage(
            chatId,
            `Para chatear conmigo y ver tu historial de LeFriApp, por favor vincula tu cuenta compartiendo tu número de teléfono:`,
            {
              keyboard: [[{
                text: "📱 Compartir mi número de teléfono",
                request_contact: true
              }]],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          );
          return;
        }

        // Send a typing notification
        const token = await this.getBotToken();
        if (token) {
          fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action: "typing" })
          }).catch(() => {});
        }

        // Fetch conversation history using Prisma
        const sessionId = `tg_${chatId}`;
        let conversation = await executeWithRetry(() =>
          prisma.conversation.findFirst({ where: { userId: user.id, sessionId } })
        );

        if (!conversation) {
          conversation = await executeWithRetry(() =>
            prisma.conversation.create({
              data: {
                userId: user.id,
                sessionId,
                messages: [],
                context: { referralPending: false, summary: "" }
              }
            })
          );
        }

        const messages = (conversation.messages as any[]) || [];
        const context = (conversation.context as any) || { referralPending: false, summary: "" };
        const referralPending = context.referralPending === true;
        const lowerText = text.trim().toLowerCase();

        if (referralPending && (lowerText === "si" || lowerText === "sí" || lowerText === "yes")) {
          const matchResult = await matchmakerService.matchAndAssignLead({
            citizenId: user.id.toString(),
            citizenName: user.name,
            citizenPhone: user.phone || undefined,
            country: user.country || "EC",
            querySummary: context.summary || "Consulta legal por Telegram",
            isProBono: true
          });

          await executeWithRetry(() =>
            prisma.conversation.update({
              where: { id: conversation!.id },
              data: { context: { referralPending: false, summary: context.summary } }
            })
          );

          if (matchResult.success) {
            await this.sendMessage(
              chatId,
              `¡Excelente! He compartido tu caso con la firma de abogados *"${matchResult.lawFirm.name}"*. El abogado asignado es *${matchResult.lawyer.name}*. Se comunicarán contigo a la brevedad.`
            );

            if (matchResult.lawFirm.whatsAppSessionActive && matchResult.lawyer.phone) {
              const whatsappApiUrl = process.env.WHATSAPP_API_URL || "http://localhost:3001";
              const lawyerMsg = `📢 *Nuevo Lead Asignado (ProBono)*\n\nHola ${matchResult.lawyer.name}, se te ha asignado un nuevo prospecto desde el canal público de Telegram.\n\n*Cliente:* ${user.name}\n*Teléfono:* ${user.phone || 'No provisto'}\n*Caso:* ${context.summary}\n\nIngresa a tu dashboard de LeFriApp para ver los detalles.`;

              fetch(`${whatsappApiUrl}/whatsapp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tenantId: matchResult.lawFirm.id.toString(),
                  phone: matchResult.lawyer.phone,
                  text: lawyerMsg
                })
              }).catch((err: any) => console.error("Error notifying lawyer via WA:", err));
            }
          } else {
            await this.sendMessage(
              chatId,
              `Disculpa, no pudimos asignarte un abogado de inmediato: ${matchResult.message || 'Inténtalo de nuevo más tarde.'}`
            );
          }
          return;
        } else if (referralPending) {
          const updatedMessages = [
            ...messages,
            { role: 'user', content: text, timestamp: new Date().toISOString() },
            { role: 'assistant', content: 'Entendido. Si en algún momento necesitas un abogado, avísame.', timestamp: new Date().toISOString() }
          ];
          await executeWithRetry(() =>
            prisma.conversation.update({
              where: { id: conversation!.id },
              data: {
                messages: updatedMessages,
                context: { referralPending: false, summary: context.summary }
              }
            })
          );

          await this.sendMessage(chatId, "Entendido. Si en algún momento deseas contactar con un abogado profesional, házmelo saber.");
          return;
        }

        // Format history
        const history = messages.slice(-6).map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

        // Run Citizen Mediator Agent
        const agentResponse = await multiAgentService.citizenMediatorAgent(
          text,
          user.country || "EC",
          user.language || "es",
          history
        );

        const newContext = agentResponse.suggestLawyer
          ? { referralPending: true, summary: text }
          : { referralPending: false, summary: context.summary };

        const updatedMessages = [
          ...messages,
          { role: 'user', content: text, timestamp: new Date().toISOString() },
          { role: 'assistant', content: agentResponse.text, timestamp: new Date().toISOString() }
        ];

        await executeWithRetry(() =>
          prisma.conversation.update({
            where: { id: conversation!.id },
            data: {
              messages: updatedMessages,
              context: newContext
            }
          })
        );

        const referralNotice = agentResponse.suggestLawyer
          ? "\n\n⚠️ *He detectado que tu caso requiere asesoría profesional.* ¿Te gustaría que te conecte de forma gratuita con un abogado especialista cercano? Responde con la palabra *'SÍ'* para coordinar."
          : "";

        await this.sendMessage(chatId, agentResponse.text + referralNotice);
      }
    } catch (error: any) {
      console.error("[TelegramService] Error handling update:", error);
      await this.sendMessage(chatId, "Lo siento, ha ocurrido un error al procesar tu mensaje.");
    }
  }
}

export const telegramService = new TelegramService();
