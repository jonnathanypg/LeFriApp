/**
 * telegram.ts (service)
 * 
 * Interactive Telegram Bot Handler for LeFriApp
 * Supports voice note transcription, inline button wizards, data structure acceleration,
 * guest public access, and multi-agent legal triage.
 */

import { multiAgentService } from "./multi-agent";
import { matchmakerService } from "./matchmaker";
import { transcriptionService } from "./transcription";
import { prisma, executeWithRetry } from "../prisma-client";
import { authHashCache, SlidingWindowMemory, LegalTriageHeap, legalConceptTrie } from "./data-structures";
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

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    try {
      const token = await this.getBotToken();
      if (!token) return;
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text })
      });
    } catch (err) {
      console.error("[TelegramService] Error answering callback query:", err);
    }
  }

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

  async handleUpdate(update: any): Promise<void> {
    if (!update) return;

    // Handle Inline Button Clicks (Callback Queries)
    if (update.callback_query) {
      const callback = update.callback_query;
      const chatId = callback.message.chat.id.toString();
      const data = callback.data;

      await this.answerCallbackQuery(callback.id);

      if (data.startsWith('triage_')) {
        const category = data.replace('triage_', '');
        await this.sendMessage(chatId, `📋 *Triaje Seleccionado: ${category.toUpperCase()}*\n\nPor favor describe los detalles de tu situación legal (puedes enviar un texto o grabar una nota de voz) para generar tu orientación fundamentada en ley:`);
      } else if (data === 'connect_lawyer') {
        const chatIdHash = hashValue(chatId);
        let user = authHashCache.getUserByTelegramHash(chatIdHash);
        if (!user) {
          user = await executeWithRetry(() =>
            prisma.user.findFirst({ where: { telegramChatIdHash: chatIdHash } })
          );
        }
        if (user) {
          const matchResult = await matchmakerService.matchAndAssignLead({
            citizenId: user.id.toString(),
            citizenName: user.name,
            citizenPhone: user.phone || undefined,
            country: user.country || "EC",
            querySummary: "Solicitud directa de contacto con abogado vía Telegram",
            isProBono: true
          });
          if (matchResult.success) {
            await this.sendMessage(chatId, `✅ Te hemos conectado con la firma *"${matchResult.lawFirm.name}"*. El abogado asignado es *${matchResult.lawyer.name}*. Se pondrán en contacto contigo pronto.`);
          } else {
            await this.sendMessage(chatId, `⚠️ No fue posible asignar un abogado de inmediato. Inténtalo más tarde.`);
          }
        } else {
          await this.sendMessage(chatId, `📱 Para conectarte con un abogado verificado, por favor comparte tu número de teléfono usando el botón del menú.`);
        }
      }
      return;
    }

    if (!update.message) return;

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

      const chatIdHash = hashValue(chatId);

      // 1. Process account linking via /start link_TOKEN
      if (text && text.startsWith('/start link_')) {
        const linkToken = text.replace('/start link_', '').trim();
        let user = await executeWithRetry(() =>
          prisma.user.findFirst({ where: { id: linkToken } })
        );
        if (user) {
          user = await executeWithRetry(() =>
            prisma.user.update({
              where: { id: user!.id },
              data: { telegramChatId: chatId, telegramChatIdHash: chatIdHash }
            })
          );
          authHashCache.setUserByTelegramHash(chatIdHash, user);
          await this.sendMessage(
            chatId,
            `🎉 ¡Cuenta vinculada exitosamente, *${user.name}*!\n\nAhora tus consultas en Telegram se sincronizarán directamente con tu panel web de LeFriApp. ¿En qué área jurídica necesitas orientación hoy?`,
            {
              inline_keyboard: [
                [
                  { text: "⚖️ Triaje Laboral", callback_data: "triage_laboral" },
                  { text: "🚨 Emergencia Penal / SOS", callback_data: "triage_penal" }
                ],
                [
                  { text: "👨‍👩‍👧 Familia / Alimentos", callback_data: "triage_familia" },
                  { text: "👨‍⚖️ Contactar Abogado", callback_data: "connect_lawyer" }
                ]
              ]
            }
          );
          return;
        }
      }

      // 2. Process contact sharing (onboarding)
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
                telegramChatIdHash: chatIdHash,
                role: "citizen",
                country: "EC",
                language: "es"
              }
            })
          );
        } else {
          user = await executeWithRetry(() =>
            prisma.user.update({
              where: { id: user!.id },
              data: {
                telegramChatId: chatId,
                telegramChatIdHash: chatIdHash
              }
            })
          );
        }

        // Cache in memory O(1)
        authHashCache.setUserByTelegramHash(chatIdHash, user);
        authHashCache.setUserByPhoneHash(phoneHash, user);

        await this.sendMessage(
          chatId,
          `¡Bienvenido a *LeFriApp*, *${user.name}*! Tu cuenta ha sido vinculada correctamente con tu número de teléfono.\n\nSoy tu Asistente Legal de Emergencia 24/7 gratuito. Selecciona un área para comenzar tu triaje o escribe tu duda directamente:`,
          {
            inline_keyboard: [
              [
                { text: "⚖️ Triaje Laboral", callback_data: "triage_laboral" },
                { text: "🚨 Alerta SOS / Penal", callback_data: "triage_penal" }
              ],
              [
                { text: "👨‍👩‍👧 Familia / Civil", callback_data: "triage_familia" },
                { text: "👨‍⚖️ Solicitar Abogado", callback_data: "connect_lawyer" }
              ]
            ]
          }
        );
        return;
      }

      // 3. Handle /start, /menu, /ayuda commands
      if (text && (text.toLowerCase().startsWith("/start") || text.toLowerCase().startsWith("/menu") || text.toLowerCase().startsWith("/ayuda"))) {
        let user = authHashCache.getUserByTelegramHash(chatIdHash);
        if (!user) {
          user = await executeWithRetry(() =>
            prisma.user.findFirst({ where: { telegramChatIdHash: chatIdHash } })
          );
          if (user) authHashCache.setUserByTelegramHash(chatIdHash, user);
        }

        const greeting = user ? `¡Hola de nuevo, *${user.name}*!` : `¡Hola! Bienvenido al servicio de orientación legal pública de *LeFriApp*.`;

        await this.sendMessage(
          chatId,
          `${greeting}\n\nSelecciona el área de tu consulta o escribe tu caso directamente (puedes enviar texto o nota de voz):`,
          {
            inline_keyboard: [
              [
                { text: "⚖️ Triaje Laboral", callback_data: "triage_laboral" },
                { text: "🚨 Emergencia Penal / SOS", callback_data: "triage_penal" }
              ],
              [
                { text: "👨‍👩‍👧 Familia / Alimentos", callback_data: "triage_familia" },
                { text: "👨‍⚖️ Hablar con Abogado", callback_data: "connect_lawyer" }
              ]
            ]
          }
        );
        return;
      }

      // 4. Process regular text message (Open for ALL public)
      if (text) {
        let user = authHashCache.getUserByTelegramHash(chatIdHash);
        if (!user) {
          user = await executeWithRetry(() =>
            prisma.user.findFirst({ where: { telegramChatIdHash: chatIdHash } })
          );
          if (user) authHashCache.setUserByTelegramHash(chatIdHash, user);
        }

        // Fast keyword check with Trie O(L)
        const triageUrgency = LegalTriageHeap.calculateUrgency(text);
        const legalCitations = legalConceptTrie.matchQuery(text);

        // Send a typing notification
        const token = await this.getBotToken();
        if (token) {
          fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action: "typing" })
          }).catch(() => {});
        }

        // Fetch or initialize conversation
        const sessionId = `tg_${chatId}`;
        let conversation = null;
        if (user) {
          conversation = await executeWithRetry(() =>
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
        }

        const messages = (conversation?.messages as any[]) || [];
        const slidingMemory = SlidingWindowMemory.fromArray(messages, 6);
        const history = slidingMemory.toArray();

        // Run Multi-Agent Legal Mediator
        const agentResponse = await multiAgentService.citizenMediatorAgent(
          text,
          user?.country || "EC",
          user?.language || "es",
          history
        );

        let responseText = agentResponse.text;

        // Append high-speed Trie citations if available and relevant
        if (legalCitations.length > 0 && !responseText.includes(legalCitations[0].article)) {
          responseText += `\n\n📌 *Base Legal Detectada (${legalCitations[0].code})*:\n_${legalCitations[0].title} (${legalCitations[0].article})_: ${legalCitations[0].summary}`;
        }

        if (user && conversation) {
          const updatedMessages = [
            ...messages,
            { role: 'user', content: text, timestamp: new Date().toISOString() },
            { role: 'assistant', content: responseText, timestamp: new Date().toISOString() }
          ];

          await executeWithRetry(() =>
            prisma.conversation.update({
              where: { id: conversation!.id },
              data: {
                messages: updatedMessages,
                context: {
                  referralPending: !!agentResponse.suggestLawyer,
                  summary: text,
                  urgencyScore: triageUrgency.score
                }
              }
            })
          );
        }

        const replyMarkup: any = {
          inline_keyboard: []
        };

        if (agentResponse.suggestLawyer || triageUrgency.score >= 7) {
          replyMarkup.inline_keyboard.push([
            { text: "👨‍⚖️ Conectar con Abogado Especialista", callback_data: "connect_lawyer" }
          ]);
        }

        if (!user) {
          replyMarkup.inline_keyboard.push([
            { text: "📱 Vincular mi número de teléfono", callback_data: "link_contact" }
          ]);
        }

        await this.sendMessage(
          chatId,
          responseText,
          replyMarkup.inline_keyboard.length > 0 ? replyMarkup : undefined
        );
      }
    } catch (error: any) {
      console.error("[TelegramService] Error handling update:", error);
      await this.sendMessage(chatId, "Lo siento, ha ocurrido un error al procesar tu consulta. Por favor intenta de nuevo en unos momentos.");
    }
  }
}

export const telegramService = new TelegramService();
