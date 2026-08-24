import { Router } from "express";
import { telegramService } from "../services/telegram";
import { whatsAppService } from "../services/whatsapp";
import { transcriptionService } from "../services/transcription";
import { multiAgentService } from "../services/multi-agent";
import { prisma, executeWithRetry } from "../prisma-client";
import {
  authHashCache,
  SlidingWindowMemory,
  LegalTriageHeap,
  legalConceptTrie,
  AudioBufferManager,
  MessageQueue
} from "../services/data-structures";
import crypto from 'crypto';

export const webhooksRouter = Router();

function hashPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

webhooksRouter.post("/telegram", async (req, res) => {
  try {
    await telegramService.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error in telegram webhook:", error);
    res.sendStatus(500);
  }
});

webhooksRouter.post("/whatsapp", async (req, res) => {
  try {
    const { phone, tenantId, audioBase64 } = req.body;
    let { text } = req.body;

    if (audioBase64) {
      const typedBuffer = AudioBufferManager.base64ToTypedArray(audioBase64);
      const buffer = Buffer.from(typedBuffer.buffer, typedBuffer.byteOffset, typedBuffer.byteLength);
      const transcription = await transcriptionService.transcribeAudioBuffer(buffer, 'whatsapp_audio.ogg');
      text = `[Nota de Voz]: "${transcription}"`;
    }

    if (!text || !phone) {
      return res.sendStatus(200);
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    const phoneHash = hashPhone(cleanedPhone);

    // 1. Resolve user in O(1) from Hash Cache or database
    let user = authHashCache.getUserByPhoneHash(phoneHash);
    let isNewUser = false;

    if (!user) {
      user = await executeWithRetry(() =>
        prisma.user.findFirst({ where: { phoneHash } })
      );

      if (!user) {
        isNewUser = true;
        user = await executeWithRetry(() =>
          prisma.user.create({
            data: {
              email: `${cleanedPhone}@lefri.ai`,
              name: `Ciudadano ${cleanedPhone.slice(-4)}`,
              phone: cleanedPhone,
              phoneHash: phoneHash,
              role: "citizen",
              country: "EC",
              language: "es",
            }
          })
        );
      }
      authHashCache.setUserByPhoneHash(phoneHash, user);
    }

    // 2. Resolve or create conversation
    const sessionId = `wa_${cleanedPhone}`;
    let conversation = await executeWithRetry(() =>
      prisma.conversation.findFirst({ where: { userId: user!.id, sessionId } })
    );

    if (!conversation) {
      conversation = await executeWithRetry(() =>
        prisma.conversation.create({
          data: {
            userId: user!.id,
            sessionId,
            messages: [],
            context: { referralPending: false, summary: "" }
          }
        })
      );
    }

    // 3. Fast Data Structure evaluations (Heap urgency & Trie citations)
    const urgency = LegalTriageHeap.calculateUrgency(text);
    const legalCitations = legalConceptTrie.matchQuery(text);

    // 4. Sliding Window Memory (Doubly Linked List O(1))
    const existingMessages = (conversation.messages as any[]) || [];
    const slidingMemory = SlidingWindowMemory.fromArray(existingMessages, 6);
    const history = slidingMemory.toArray();

    // 5. Multi-Agent Legal Processing
    const agentResponse = await multiAgentService.citizenMediatorAgent(
      text,
      user.country || "EC",
      user.language || "es",
      history
    );

    let responseText = agentResponse.text;

    // Append legal basis from Trie if relevant
    if (legalCitations.length > 0 && !responseText.includes(legalCitations[0].article)) {
      responseText += `\n\n📌 *Base Legal Aplicable (${legalCitations[0].code})*:\n*${legalCitations[0].title} (${legalCitations[0].article})*: ${legalCitations[0].summary}`;
    }

    // Add welcome header if this is the first interaction
    if (isNewUser && existingMessages.length === 0) {
      responseText = `👋 *¡Bienvenido a LeFriApp!* Soy tu Asistente Legal de Emergencia 24/7 gratuito.\n\n` + responseText;
    }

    // If lawyer match is suggested, append contact link
    if (agentResponse.suggestLawyer || urgency.score >= 8) {
      responseText += `\n\n⚖️ _Si deseas que un abogado verificado revise tu caso personalmente, responde "HABLAR CON ABOGADO"._`;
    }

    // 6. Update database conversation
    const updatedMessages = [
      ...existingMessages,
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
            urgencyScore: urgency.score
          }
        }
      })
    );

    // 7. CRITICAL FIX: Send WhatsApp reply to user with Humanized Delivery
    const outgoingTenant = tenantId || "SYSTEM_B2C";
    await whatsAppService.sendMessage({
      to: cleanedPhone,
      message: responseText,
      tenantId: outgoingTenant
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error in whatsapp webhook:", error);
    res.sendStatus(500);
  }
});
