/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Content generation has been moved to the provider-agnostic SkillAdapter.
 * In a P2P decentralized state:
 * 1. Text generation calls will run locally in the client browser or be dispatched
 *    to a decentralized LLM compute network (like Akash, Bittensor) via the SkillAdapter.
 * 2. Embedding generation will utilize a local transformer model loaded directly in
 *    the browser using ONNX runtime, eliminating dependencies on proprietary Google APIs.
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { skillAdapter } from './skill-adapter';

function loadSkill(filename: string, params: Record<string, string>): string {
  let template = fs.readFileSync(path.join(process.cwd(), 'skills', filename), 'utf-8');
  for (const [key, value] of Object.entries(params)) {
    template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return template;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

export interface ConsultationContext {
  query: string;
  country: string;
  language: string;
  constitutionalArticles?: string[];
  legalDocuments?: string[];
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateLegalResponse(context: ConsultationContext): Promise<GeminiResponse> {
    try {
      const prompt = this.buildLegalPrompt(context);
      const text = await skillAdapter.generate(prompt);
      return { text };
    } catch (error) {
      console.error('Gemini Service generation error:', error);
      return { 
        text: 'Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateLegalResponseStream(context: ConsultationContext & { onChunk?: (chunk: string) => void }): Promise<GeminiResponse> {
    try {
      const prompt = this.buildLegalPrompt(context);
      
      let text = '';
      if (context.onChunk) {
        text = await skillAdapter.generateStream(prompt, { onChunk: context.onChunk });
      } else {
        text = await skillAdapter.generate(prompt);
      }
      
      return { text };
    } catch (error) {
      console.error('Gemini Service streaming error:', error);
      const fallbackText = 'Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente.';
      if (context.onChunk) {
        this.simulateStreamingText(fallbackText, context.onChunk);
      }
      return { 
        text: fallbackText,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private simulateStreamingText(text: string, onChunk?: (chunk: string) => void): void {
    if (!onChunk) return;
    
    const words = text.split(' ');
    let currentIndex = 0;
    
    const sendChunk = () => {
      if (currentIndex < words.length) {
        const chunkSize = Math.floor(Math.random() * 3) + 1; // 1-3 words per chunk
        const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ') + ' ';
        onChunk(chunk);
        currentIndex += chunkSize;
        
        // Random delay between 50-150ms for realistic typing
        setTimeout(sendChunk, Math.random() * 100 + 50);
      }
    };
    
    sendChunk();
  }

  async generateEmergencyMessage(context: {
    userName: string;
    location: { latitude: number; longitude: number; address?: string };
    language: string;
  }): Promise<GeminiResponse> {
    try {
      const prompt = this.buildEmergencyPrompt(context);
      const text = await skillAdapter.generate(prompt);
      return { text };
    } catch (error) {
      console.error('Gemini Service emergency message generation error:', error);
      return {
        text: this.getFallbackEmergencyMessage(context),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateProcessStep(context: {
    processType: string;
    currentStep: number;
    userData: any;
    language: string;
  }): Promise<GeminiResponse> {
    try {
      const prompt = this.buildProcessPrompt(context);
      const text = await skillAdapter.generate(prompt);
      return { text };
    } catch (error) {
      console.error('Gemini Service process step generation error:', error);
      return {
        text: 'Error generando el siguiente paso del proceso.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildLegalPrompt(context: ConsultationContext): string {
    const { query, country, language, constitutionalArticles, legalDocuments } = context;
    
    let constitutionalArticlesText = '';
    if (constitutionalArticles && constitutionalArticles.length > 0) {
      constitutionalArticlesText = `Artículos constitucionales relevantes:\n${constitutionalArticles.join('\n\n')}\n`;
    }

    let legalDocumentsText = '';
    if (legalDocuments && legalDocuments.length > 0) {
      legalDocumentsText = `Documentos legales relevantes:\n${legalDocuments.join('\n\n')}\n`;
    }

    return loadSkill('Gemini_Legal_Prompt.md', {
      country: country,
      language: language === 'es' ? 'español' : language === 'en' ? 'inglés' : 'francés',
      query: query,
      constitutionalArticlesText: constitutionalArticlesText,
      legalDocumentsText: legalDocumentsText
    });
  }

  private buildEmergencyPrompt(context: {
    userName: string;
    location: { latitude: number; longitude: number; address?: string };
    language: string;
  }): string {
    const { userName, location, language } = context;
    
    return loadSkill('Gemini_Emergency_Prompt.md', {
      language: language === 'es' ? 'español' : language === 'en' ? 'inglés' : 'francés',
      userName: userName,
      address: location.address || `Lat: ${location.latitude}, Lng: ${location.longitude}`,
      latitude: String(location.latitude),
      longitude: String(location.longitude)
    });
  }

  private buildProcessPrompt(context: {
    processType: string;
    currentStep: number;
    userData: any;
    language: string;
  }): string {
    const { processType, currentStep, userData, language } = context;
    
    return loadSkill('Gemini_Process_Prompt.md', {
      currentStep: String(currentStep + 1),
      processType: processType,
      language: language === 'es' ? 'español' : language === 'en' ? 'inglés' : 'francés',
      userData: JSON.stringify(userData)
    });
  }

  private getFallbackEmergencyMessage(context: {
    userName: string;
    location: { latitude: number; longitude: number; address?: string };
    language: string;
  }): string {
    const { userName, location, language } = context;
    
    if (language === 'en') {
      return `🚨 EMERGENCY: ${userName} needs immediate help! Location: ${location.address || `${location.latitude}, ${location.longitude}`} https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    } else if (language === 'fr') {
      return `🚨 URGENCE: ${userName} a besoin d'aide immédiate! Localisation: ${location.address || `${location.latitude}, ${location.longitude}`} https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    } else {
      return `🚨 EMERGENCIA: ${userName} necesita ayuda inmediata! Ubicación: ${location.address || `${location.latitude}, ${location.longitude}`} https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Failed to generate embedding from Gemini API:', error);
      // Retornar un vector mock de longitud 768 en caso de error
      return Array.from({ length: 768 }, () => (Math.random() - 0.5) * 0.1);
    }
  }
}

export const geminiService = new GeminiService();