import { Router } from "express";
import { telegramService } from "../services/telegram";
import { transcriptionService } from "../services/transcription";
import { multiAgentService } from "../services/multi-agent";
import { prisma, executeWithRetry } from "../prisma-client";
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
      const buffer = Buffer.from(audioBase64, 'base64');
      const transcription = await transcriptionService.transcribeAudioBuffer(buffer, 'whatsapp_audio.ogg');
      text = `[Nota de Voz]: "${transcription}"`;
    }

    if (!text || !phone) {
      return res.sendStatus(200);
    }

    // Identificar ciudadano por hash del teléfono usando Prisma
    const phoneHash = hashPhone(phone);
    let user = await executeWithRetry(() =>
      prisma.user.findFirst({ where: { phoneHash } })
    );

    if (!user) {
      user = await executeWithRetry(() =>
        prisma.user.create({
          data: {
            email: `${phone.replace(/\D/g, '')}@lefri.ai`,
            name: `Usuario ${phone}`,
            phone: phone,
            phoneHash: phoneHash,
            role: "citizen",
            country: "EC",
            language: "es",
          }
        })
      );
    }

    // Recuperar historial de conversación usando Prisma
    const sessionId = `wa_${phone}`;
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

    const messages = (conversation.messages as any[]) || [];
    const history = messages.slice(-6).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    const agentResponse = await multiAgentService.citizenMediatorAgent(
      text,
      user.country || "EC",
      user.language || "es",
      history
    );

    const updatedMessages = [
      ...messages,
      { role: 'user', content: text, timestamp: new Date().toISOString() },
      { role: 'assistant', content: agentResponse.text, timestamp: new Date().toISOString() }
    ];

    await executeWithRetry(() =>
      prisma.conversation.update({
        where: { id: conversation!.id },
        data: { messages: updatedMessages }
      })
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Error in whatsapp webhook:", error);
    res.sendStatus(500);
  }
});
