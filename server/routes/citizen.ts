import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth";
import { constituteService } from "../services/constitute";
import { multiAgentService } from "../services/multi-agent";
import { geminiService } from "../services/gemini";
import { whatsAppService } from "../services/whatsapp";
import { emailService } from "../services/email";
import { voiceService } from "../services/voice";
import { transcriptionService } from "../services/transcription";
import { skillAdapter } from "../services/skill-adapter";
import { prisma, executeWithRetry } from "../prisma-client";
import {
  authHashCache,
  SlidingWindowMemory,
  LegalTriageHeap,
  legalConceptTrie
} from "../services/data-structures";
import { insertEmergencyContactSchema } from "@shared/schema";
import multer from 'multer';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

export const citizenRouter = Router();

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Public & Authenticated Unified Legal Chat (SSE Streaming)
 * Free for ALL the public, with guest session tracking & RAG integration.
 */
citizenRouter.post("/ask", async (req: any, res) => {
  try {
    const { query, country, language, guestId } = req.body;
    const userId = req.session?.userId;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 1. Instant Data Structure Evaluation (Trie O(L) & Heap Urgency)
    const urgency = LegalTriageHeap.calculateUrgency(query);
    const trieCitations = legalConceptTrie.matchQuery(query);

    // 2. Fetch Constitutional Articles RAG
    const constitutionalArticles = await constituteService.getRelevantArticles({
      query,
      country: country || "EC",
      language: language || "es",
      limit: 3
    });

    const citations = constitutionalArticles.map((articleText, index) => ({
      title: `Artículo Constitucional ${index + 1}`,
      url: `#article-${index + 1}`,
      relevance: Math.max(95 - index * 5, 75),
      source: 'Constitución'
    }));

    // Add Trie citations if found
    for (const trieArt of trieCitations) {
      citations.unshift({
        title: `${trieArt.title} (${trieArt.article})`,
        url: `#trie-${trieArt.article}`,
        relevance: 98,
        source: trieArt.code
      });
    }

    res.write(`data: ${JSON.stringify({ type: 'citations', data: { citations, urgencyScore: urgency.score } })}\n\n`);

    // 3. Build Conversation History (Sliding Window O(1))
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (userId) {
      const previousConsultations = await storage.getConsultations(userId);
      const rawHistory = previousConsultations
        .slice(-5)
        .map(c => [
          { role: 'user' as const, content: c.query },
          { role: 'assistant' as const, content: c.response }
        ])
        .flat();
      history = SlidingWindowMemory.fromArray(rawHistory, 6).toArray();
    } else if (guestId) {
      const guestSession = authHashCache.getGuestSession(guestId);
      history = SlidingWindowMemory.fromArray(guestSession.messages, 6).toArray();
      authHashCache.decrementGuestQuota(guestId);
    }

    // 4. Run Multi-Agent Legal Processing with Streaming Chunks
    const agentResponse = await multiAgentService.citizenMediatorAgent(
      query,
      country || "EC",
      language || "es",
      history,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
      }
    );

    let fullResponse = agentResponse.text;

    // Append legal basis from Trie if relevant
    if (trieCitations.length > 0 && !fullResponse.includes(trieCitations[0].article)) {
      const extraCite = `\n\n📌 *Base Legal Aplicable (${trieCitations[0].code})*:\n*${trieCitations[0].title} (${trieCitations[0].article})*: ${trieCitations[0].summary}`;
      res.write(`data: ${JSON.stringify({ type: 'chunk', data: extraCite })}\n\n`);
      fullResponse += extraCite;
    }

    // 5. Persist consultation
    if (userId) {
      await storage.createConsultation({
        userId,
        query,
        response: fullResponse,
        country: country || "EC",
        language: language || "es"
      });
    } else if (guestId) {
      authHashCache.addGuestMessage(guestId, { role: 'user', content: query });
      authHashCache.addGuestMessage(guestId, { role: 'assistant', content: fullResponse });
    }

    res.write(`data: ${JSON.stringify({
      type: 'complete',
      data: {
        confidence: agentResponse.error ? 0.6 : 0.94,
        suggestLawyer: agentResponse.suggestLawyer || urgency.score >= 7,
        urgencyScore: urgency.score
      }
    })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /ask:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', data: { error: "Failed to process legal consultation" } })}\n\n`);
    res.end();
  }
});

/**
 * Sync guest history to authenticated user account (Soft-Onboarding completion)
 */
citizenRouter.post("/sync-guest-history", requireAuth, async (req: any, res) => {
  try {
    const { guestId } = req.body;
    if (!guestId) return res.status(400).json({ error: "guestId is required" });

    const guestSession = authHashCache.getGuestSession(guestId);
    const messages = guestSession.messages || [];

    if (messages.length > 0) {
      for (let i = 0; i < messages.length - 1; i += 2) {
        const userMsg = messages[i];
        const assistantMsg = messages[i + 1];
        if (userMsg && assistantMsg) {
          await storage.createConsultation({
            userId: req.userId,
            query: userMsg.content,
            response: assistantMsg.content,
            country: "EC",
            language: "es"
          });
        }
      }
    }

    res.json({ success: true, syncedMessages: messages.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync guest history" });
  }
});

/**
 * Get connected omnichannel channels status (Web, WhatsApp, Telegram)
 */
citizenRouter.get("/channels", requireAuth, async (req: any, res) => {
  try {
    const user = await executeWithRetry(() =>
      prisma.user.findUnique({ where: { id: req.userId } })
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const telegramConnected = !!(user.telegramChatId || user.telegramChatIdHash);
    const whatsappConnected = !!(user.phone || user.phoneHash);

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "LeFriLegalBot";
    const telegramDeepLink = `https://t.me/${botUsername}?start=link_${user.id}`;
    const whatsappBotNumber = process.env.WHATSAPP_BOT_NUMBER || "1234567890";
    const whatsappDeepLink = `https://wa.me/${whatsappBotNumber}?text=Hola,%20deseo%20vincular%20mi%20cuenta%20LeFriApp%20ID:${user.id}`;

    res.json({
      web: { connected: true, active: true },
      telegram: {
        connected: telegramConnected,
        deepLink: telegramDeepLink,
        chatId: user.telegramChatId ? "Vinculado" : null
      },
      whatsapp: {
        connected: whatsappConnected,
        phone: user.phone ? user.phone.slice(-4) : null,
        deepLink: whatsappDeepLink
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load channel status" });
  }
});

/**
 * Get Unified Cross-Channel Timeline (Web + WhatsApp + Telegram)
 */
citizenRouter.get("/unified-history", requireAuth, async (req: any, res) => {
  try {
    const user = await executeWithRetry(() =>
      prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          consultations: { orderBy: { createdAt: 'desc' }, take: 20 },
          conversations: true
        }
      })
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const timeline: Array<{
      id: string;
      source: 'web' | 'whatsapp' | 'telegram';
      title: string;
      query: string;
      response: string;
      createdAt: string;
    }> = [];

    // 1. Add Web consultations
    for (const c of user.consultations) {
      timeline.push({
        id: c.id,
        source: 'web',
        title: c.query.slice(0, 60) + (c.query.length > 60 ? '...' : ''),
        query: c.query,
        response: c.response,
        createdAt: c.createdAt.toISOString()
      });
    }

    // 2. Add WhatsApp & Telegram conversations
    for (const conv of user.conversations) {
      const source: 'whatsapp' | 'telegram' = conv.sessionId.startsWith('wa_') ? 'whatsapp' : 'telegram';
      const msgs = (conv.messages as any[]) || [];
      for (let i = 0; i < msgs.length - 1; i += 2) {
        const u = msgs[i];
        const a = msgs[i + 1];
        if (u && a) {
          timeline.push({
            id: `${conv.id}_${i}`,
            source,
            title: `[${source.toUpperCase()}] ` + u.content.slice(0, 50),
            query: u.content,
            response: a.content,
            createdAt: u.timestamp || conv.createdAt.toISOString()
          });
        }
      }
    }

    timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: "Failed to load unified history" });
  }
});

// Emergency alert endpoint
citizenRouter.post("/emergency", requireAuth, async (req: any, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    const user = await storage.getUser(req.userId);
    const contacts = await storage.getEmergencyContacts(req.userId);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const emergencyMessage = await geminiService.generateEmergencyMessage({
      userName: user.name,
      location: { latitude, longitude, address },
      language: user.language
    });

    const whatsappContacts = contacts.filter(contact => contact.whatsappEnabled);
    const whatsappResults = await whatsAppService.sendEmergencyAlert({
      contacts: whatsappContacts.map(c => ({ phone: c.phone, name: c.name })),
      message: emergencyMessage.text,
      location: { latitude, longitude }
    });

    const emailResults = [];
    for (const contact of contacts) {
      if (contact.phone.includes('@')) {
        const emailResult = await emailService.sendEmergencyEmail({
          to: contact.phone,
          userName: user.name,
          message: emergencyMessage.text,
          location: { latitude, longitude, address }
        });
        emailResults.push({ phone: contact.phone, name: contact.name, success: emailResult.success, error: emailResult.error });
      }
    }

    const allResults = [...whatsappResults, ...emailResults];
    const contactsNotified = allResults.map(result => ({
      id: Date.now() + Math.random(),
      name: result.name,
      phone: result.phone,
      status: result.success ? "sent" : "failed",
      sentAt: new Date().toISOString(),
      error: result.error
    }));
    
    await storage.createEmergencyAlert({
      userId: req.userId,
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
      address,
      contactsNotified,
      status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed"
    });
    
    res.json({
      status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed",
      contactsNotified,
      location: { latitude, longitude, address },
      message: emergencyMessage.text
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send emergency alert" });
  }
});

// Emergency contacts endpoints
citizenRouter.get("/emergency-contacts", requireAuth, async (req: any, res) => {
  try {
    const contacts = await storage.getEmergencyContacts(req.userId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get emergency contacts" });
  }
});

citizenRouter.post("/emergency-contacts", requireAuth, async (req: any, res) => {
  try {
    const data = insertEmergencyContactSchema.parse({ ...req.body, userId: req.userId });
    const contact = await storage.createEmergencyContact(data);
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: "Invalid contact data" });
  }
});

citizenRouter.put("/emergency-contacts/:id", requireAuth, async (req: any, res) => {
  try {
    const contact = await storage.updateEmergencyContact(req.params.id, req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
});

citizenRouter.delete("/emergency-contacts/:id", requireAuth, async (req: any, res) => {
  try {
    await storage.deleteEmergencyContact(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// User profile endpoints
citizenRouter.put("/profile", requireAuth, async (req: any, res) => {
  try {
    const updates = req.body;
    const user = await storage.updateUser(req.userId, updates);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Activity endpoints
citizenRouter.get("/consultations", requireAuth, async (req: any, res) => {
  try {
    const consultations = await storage.getConsultations(req.userId);
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Failed to get consultations" });
  }
});

citizenRouter.get("/cases", requireAuth, async (req: any, res) => {
  try {
    const cases = await storage.getCaseFiles({ clientId: req.userId });
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Explore Constitutional Articles via Constitute Project
 */
citizenRouter.get("/constitution/explore", async (req: any, res) => {
  try {
    const country = (req.query.country as string) || "EC";
    const q = (req.query.q as string) || "derechos fundamentales debido proceso";

    const articles = await constituteService.getRelevantArticles({
      query: q,
      country,
      language: "es",
      limit: 6
    });

    const structuredArticles = articles.map((content, idx) => {
      let title = `Disposición Constitucional ${idx + 1}`;
      const match = content.match(/(Art(?:[ií]culo)?\.?\s*\d+[^\.\:\n]*)/i);
      if (match) {
        title = match[1].trim();
      }
      return {
        id: `art_${idx + 1}`,
        title,
        content
      };
    });

    res.json({ articles: structuredArticles });
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /constitution/explore:", error);
    res.status(500).json({ error: "Failed to explore constitution" });
  }
});

/**
 * Explain Constitutional Article in Plain Natural Language
 */
citizenRouter.post("/constitution/explain", async (req: any, res) => {
  try {
    const { articleText, country = "EC", language = "es" } = req.body;
    if (!articleText) {
      return res.status(400).json({ error: "articleText is required" });
    }

    const prompt = `Eres un mediador legal ciudadano experto y pedagógico de LeFriApp.
Tu misión es traducir el siguiente artículo o norma constitucional de ${country} a un lenguaje natural, accesible, didáctico y directo para cualquier ciudadano de a pie sin conocimientos jurídicos previos.

Norma Constitucional a Analizar:
"${articleText}"

Instrucciones de formato:
1. 🎯 **¿Qué significa este derecho en palabras simples?**: Explica el sentido general en 1 o 2 párrafos concisos sin tecnicismos ni jerga enrevesada.
2. 🛡️ **¿Cómo te protege en la vida cotidiana?**: Da 2 ejemplos prácticos y cotidianos de situaciones reales donde este derecho entra en juego.
3. ⚖️ **¿Qué debes hacer si vulneran este derecho?**: Pasos inmediatos y qué garantías o instituciones ciudadanas puedes activar.

Responde en idioma ${language === "en" ? "English" : language === "pt" ? "Português" : "Español"} de manera empática, clara y con formato Markdown limpio.`;

    const explanation = await skillAdapter.generate(prompt);
    res.json({ explanation });
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /constitution/explain:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

/**
 * Generate formal legal document draft
 */
citizenRouter.post("/documents/generate", async (req: any, res) => {
  try {
    const {
      type,
      title,
      facts,
      claimantName,
      claimantId,
      opposingParty,
      country = "EC",
      language = "es",
      customDetails
    } = req.body;

    const prompt = `Eres el Agente Especialista en Documentos Legales de LeFriApp.
Genera una minuta / documento legal formal y completo basado en los siguientes datos:
- Tipo de Documento: ${type}
- Título: ${title || 'Escrito Legal Formal'}
- Compareciente / Actor: ${claimantName || 'CIUDADANO COMPARECIENTE'} (Identificación: ${claimantId || 'N/A'})
- Parte Contraria / Demandado o Entidad: ${opposingParty || 'PARTE REQUERIDA'}
- Jurisdicción / País: ${country}
- Hechos y Antecedentes:
${facts || 'No se proporcionaron hechos específicos.'}
${customDetails ? `- Detalles Adicionales: ${customDetails}` : ''}

El documento debe tener la estructura jurídica formal habitual del país (${country}):
1. Encabezado formal y designación de autoridad u órgano competente.
2. Generales de ley del solicitante.
3. Relación clara y numerada de los hechos.
4. Fundamentos de derecho (Constitución de la República y Códigos pertinentes).
5. Petición concreta o pretensión.
6. Notificaciones y firma.

Redacta el texto completo listo para revisión o impresión en formato Markdown limpio.`;

    const documentContent = await skillAdapter.generate(prompt);
    res.json({
      title: title || "Documento Legal Redactado",
      documentContent,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /documents/generate:", error);
    res.status(500).json({ error: "Failed to generate document" });
  }
});

/**
 * Export Document to PDF
 */
citizenRouter.post("/documents/export-pdf", async (req: any, res) => {
  try {
    const { title = "Documento Legal", content } = req.body;
    if (!content) return res.status(400).json({ error: "content is required" });

    // HTML template for PDF conversion
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; margin: 40px; color: #111; }
    h1 { font-size: 16pt; text-align: center; margin-bottom: 20px; }
    p { margin-bottom: 12px; text-align: justify; }
    .footer { margin-top: 40px; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</div>
  <div class="footer">Generado automáticamente por LeFriApp - Asistencia Legal Inteligente</div>
</body>
</html>`;

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '2.5cm', right: '2.5cm', bottom: '2.5cm', left: '2.5cm' },
        printBackground: true
      });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.pdf"`);
      return res.send(pdfBuffer);
    } catch (puppeteerErr) {
      if (browser) await browser.close();
      console.warn("[CitizenRouter] Puppeteer fallback, returning html representation:", puppeteerErr);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /documents/export-pdf:", error);
    res.status(500).json({ error: "Failed to export PDF" });
  }
});

/**
 * Public system settings endpoint for frontend feature discovery
 */
citizenRouter.get("/system/settings", async (_req, res) => {
  try {
    const i18nConfig = await storage.getSystemConfig('internationalization_enabled');
    res.json({
      internationalizationEnabled: i18nConfig ? Boolean(i18nConfig.value) : false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Legal Processes Endpoints (/api/processes)
 */
citizenRouter.get("/processes", requireAuth, async (req: any, res) => {
  try {
    const processes = await storage.getLegalProcesses(req.userId);
    res.json(processes);
  } catch (error: any) {
    console.error("[CitizenRouter] Error in GET /processes:", error);
    res.status(500).json({ error: "Failed to fetch processes" });
  }
});

citizenRouter.get("/processes/:id", requireAuth, async (req: any, res) => {
  try {
    const process = await storage.getLegalProcess(req.params.id);
    if (!process) {
      return res.status(404).json({ error: "Process not found" });
    }
    res.json(process);
  } catch (error: any) {
    console.error("[CitizenRouter] Error in GET /processes/:id:", error);
    res.status(500).json({ error: "Failed to fetch process" });
  }
});

citizenRouter.post("/processes", requireAuth, async (req: any, res) => {
  try {
    const { title, type, description, priority, deadline, steps, requiredDocuments, constitutionalArticles, metadata } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const defaultSteps = steps || [
      { id: '1', title: 'Evaluación y Recolección de Pruebas', description: 'Reunir comprobantes, testigos y narrativa detallada.', completed: true, documents: [], requirements: [] },
      { id: '2', title: 'Redacción del Escrito Inicial', description: 'Elaboración de minuta o petición formal.', completed: false, documents: [], requirements: [] },
      { id: '3', title: 'Radicación / Presentación Formal', description: 'Ingreso ante autoridad judicial o administrativa competente.', completed: false, documents: [], requirements: [] },
      { id: '4', title: 'Seguimiento y Notificación', description: 'Esperar contestación y comparecencia de la contraparte.', completed: false, documents: [], requirements: [] },
      { id: '5', title: 'Resolución o Acuerdo', description: 'Emisión de sentencia, acta de mediación o finiquito.', completed: false, documents: [], requirements: [] },
    ];

    const newProcess = await storage.createLegalProcess({
      userId: req.userId,
      title,
      type: type || 'otros',
      description: description || '',
      status: 'in_progress',
      progress: 20,
      currentStep: 1,
      totalSteps: defaultSteps.length,
      steps: defaultSteps,
      requiredDocuments: requiredDocuments || ['Copia de C.I.', 'Documentos probatorios'],
      constitutionalArticles: constitutionalArticles || [],
      metadata: {
        priority: priority || 'medium',
        deadline: deadline || undefined,
        ...(metadata || {})
      }
    } as any);

    res.status(201).json(newProcess);
  } catch (error: any) {
    console.error("[CitizenRouter] Error in POST /processes:", error);
    res.status(500).json({ error: error.message || "Failed to create process" });
  }
});

citizenRouter.patch("/processes/:id", requireAuth, async (req: any, res) => {
  try {
    const existing = await storage.getLegalProcess(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Process not found" });
    }

    const updated = await storage.updateLegalProcess(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("[CitizenRouter] Error in PATCH /processes/:id:", error);
    res.status(500).json({ error: "Failed to update process" });
  }
});

/**
 * Speech-To-Text Audio Transcription via MediaSuite Central API (media.weblifetech.com)
 * Handles audio uploads from legal intake wizard, dynamic chat, and legal document generator.
 */
citizenRouter.post("/transcribe", upload.any(), async (req: any, res) => {
  try {
    const file = req.file || (req.files && req.files.find((f: any) => f.fieldname === 'file' || f.fieldname === 'audio')) || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log(`[CitizenRouter] Received audio for transcription: ${file.originalname || 'audio.webm'} (${file.size} bytes)`);
    const transcription = await transcriptionService.transcribeAudioBuffer(file.buffer, file.originalname || 'audio.webm');

    res.json({
      success: true,
      text: transcription || ""
    });
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /transcribe:", error);
    res.status(500).json({ error: error.message || "Failed to transcribe audio" });
  }
});

/**
 * Voice Recording Upload & Storage endpoint (/api/voice/upload or /api/citizen/voice/upload)
 * Saves recording metadata and performs MediaSuite STT transcription.
 */
citizenRouter.post("/voice/upload", upload.any(), async (req: any, res) => {
  try {
    const file = req.file || (req.files && req.files.find((f: any) => f.fieldname === 'audio' || f.fieldname === 'file')) || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const userId = req.userId || req.session?.userId || (req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : 1);
    const type = (req.body.type as any) || 'consultation';

    console.log(`[CitizenRouter] Uploading voice recording for user ${userId}, type ${type}, size ${file.size} bytes`);
    
    // Save recording to voiceService
    const saved = await voiceService.saveVoiceRecording({
      userId,
      audioBuffer: file.buffer,
      type,
      originalName: file.originalname || `voice_${Date.now()}.webm`
    });

    // Also attempt transcription via MediaSuite STT
    let transcriptionText = "";
    try {
      transcriptionText = await transcriptionService.transcribeAudioBuffer(file.buffer, file.originalname || 'audio.webm');
    } catch (sttErr: any) {
      console.warn("[CitizenRouter] Transcription during voice/upload fallback:", sttErr.message);
    }

    const url = voiceService.getVoiceRecordingUrl(saved.id);

    res.status(201).json({
      id: saved.id,
      url,
      filename: saved.filename,
      transcription: transcriptionText,
      text: transcriptionText
    });
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /voice/upload:", error);
    res.status(500).json({ error: error.message || "Failed to upload voice recording" });
  }
});

/**
 * Emergency SOS Alert with Voice Recording
 */
citizenRouter.post("/emergency/with-voice", upload.any(), async (req: any, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const file = req.file || (req.files && req.files.find((f: any) => f.fieldname === 'voiceNote' || f.fieldname === 'audio' || f.fieldname === 'file')) || (req.files && req.files[0]);

    const userId = req.userId || req.session?.userId || (req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : 1);
    const user = (await storage.getUser(userId)) || { name: 'Ciudadano LeFriApp', language: 'es' };
    const contacts = await storage.getEmergencyContacts(userId);

    let voiceTranscription = "";
    if (file) {
      try {
        voiceTranscription = await transcriptionService.transcribeAudioBuffer(file.buffer, file.originalname || 'emergency_voice.webm');
      } catch (sttErr: any) {
        console.warn("[CitizenRouter] STT error during emergency voice processing:", sttErr.message);
      }
    }

    const emergencyDetails = voiceTranscription 
      ? `Mensaje de voz transcrito por MediaSuite STT: "${voiceTranscription}"`
      : "Alerta activada con nota de voz.";

    const emergencyMessage = await geminiService.generateEmergencyMessage({
      userName: user.name,
      location: { 
        latitude: latitude ? parseFloat(latitude) : undefined, 
        longitude: longitude ? parseFloat(longitude) : undefined, 
        address 
      },
      language: user.language
    });

    const fullMessage = `${emergencyMessage.text}\n\n📢 ${emergencyDetails}`;

    const whatsappContacts = contacts.filter(contact => contact.whatsappEnabled);
    const whatsappResults = await whatsAppService.sendEmergencyAlert({
      contacts: whatsappContacts.map(c => ({ phone: c.phone, name: c.name })),
      message: fullMessage,
      location: { latitude: latitude ? parseFloat(latitude) : 0, longitude: longitude ? parseFloat(longitude) : 0 }
    });

    const emailResults = [];
    for (const contact of contacts) {
      if (contact.phone.includes('@')) {
        const emailResult = await emailService.sendEmergencyEmail({
          to: contact.phone,
          userName: user.name,
          message: fullMessage,
          location: { latitude: latitude ? parseFloat(latitude) : undefined, longitude: longitude ? parseFloat(longitude) : undefined, address }
        });
        emailResults.push({ phone: contact.phone, name: contact.name, success: emailResult.success, error: emailResult.error });
      }
    }

    const allResults = [...whatsappResults, ...emailResults];
    const contactsNotified = allResults.map(result => ({
      id: Date.now() + Math.random(),
      name: result.name,
      phone: result.phone,
      status: result.success ? "sent" : "failed",
      sentAt: new Date().toISOString(),
      error: result.error
    }));

    await storage.createEmergencyAlert({
      userId,
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
      address,
      contactsNotified,
      status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed"
    });

    res.json({
      status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed",
      contactsNotified,
      transcription: voiceTranscription,
      message: fullMessage
    });
  } catch (error: any) {
    console.error("[CitizenRouter] Error in /emergency/with-voice:", error);
    res.status(500).json({ error: error.message || "Failed to dispatch emergency with voice" });
  }
});



