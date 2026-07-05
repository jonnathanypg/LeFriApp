import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth";
import { constituteService } from "../services/constitute";
import { multiAgentService } from "../services/multi-agent";
import { geminiService } from "../services/gemini";
import { whatsAppService } from "../services/whatsapp";
import { emailService } from "../services/email";
import { voiceService } from "../services/voice";
import { insertEmergencyContactSchema } from "@shared/schema";
import multer from 'multer';
import puppeteer from 'puppeteer';

export const citizenRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

citizenRouter.post("/ask", requireAuth, async (req: any, res) => {
  try {
    const { query, country, language } = req.body;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const constitutionalArticles = await constituteService.getRelevantArticles({
      query,
      country,
      language: language || "es",
      limit: 3
    });

    const citations = constitutionalArticles.map((article, index) => ({
      title: `Artículo Constitucional ${index + 1}`,
      url: `#article-${index + 1}`,
      relevance: Math.max(95 - index * 5, 75)
    }));

    if (citations.length === 0) {
      citations.push(
        { title: "Constitución Nacional", url: "#", relevance: 90 },
        { title: "Código Civil", url: "#", relevance: 85 }
      );
    }

    res.write(`data: ${JSON.stringify({ type: 'citations', data: { citations, constitutionalArticles: constitutionalArticles.slice(0, 2) } })}\n\n`);

    const previousConsultations = await storage.getConsultations(req.userId);
    const history = previousConsultations
      .slice(0, 5)
      .reverse()
      .map(c => [
        { role: 'user' as const, content: c.query },
        { role: 'assistant' as const, content: c.response }
      ])
      .flat();

    const agentResponse = await multiAgentService.citizenMediatorAgent(
      query,
      country || "EC",
      language || "es",
      history,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
      }
    );
    
    await storage.createConsultation({
      userId: req.userId,
      query,
      response: agentResponse.text,
      country: country || "EC",
      language: language || "es"
    });

    res.write(`data: ${JSON.stringify({ type: 'complete', data: { confidence: agentResponse.error ? 0.5 : 0.92 } })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: 'error', data: { error: "Failed to process consultation" } })}\n\n`);
    res.end();
  }
});

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
