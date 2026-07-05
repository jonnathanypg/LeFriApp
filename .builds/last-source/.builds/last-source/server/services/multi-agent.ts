/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Currently, specialized agent orchestration is managed on a central Node.js server.
 * To migrate to a decentralized P2P agentic model:
 * 1. The coordination logic and agent prompts will run client-side in the user's browser (local-first).
 * 2. Specialized agents (Research, Planning, Document Generation) will be instantiated as modular,
 *    decentralized microservices running on P2P network nodes (e.g. using IPFS libp2p pubsub).
 * 3. Grounding data will be fetched directly from decentralized legal databases (e.g. IPFS legal document repositories)
 *    and indexed locally via in-memory vector databases.
 */

import fs from 'fs';
import path from 'path';
import { constituteService } from './constitute';
import { tavilySearch } from './tavily';
import { skillAdapter } from './skill-adapter';

function loadSkill(filename: string, params: Record<string, string>): string {
  let template = fs.readFileSync(path.join(process.cwd(), 'skills', filename), 'utf-8');
  for (const [key, value] of Object.entries(params)) {
    template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return template;
}

export interface AgentResponse {
  text: string;
  confidence: number;
  citations?: string[];
  nextSteps?: string[];
  suggestLawyer?: boolean;
  error?: string;
}

export interface ProcessContext {
  processId: string;
  title: string;
  type: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  metadata?: any;
  country: string;
  language: string;
}

export class MultiAgentService {
  constructor() {
    // LLM calls are now fully abstracted by SkillAdapter
  }

  // Legal Research Agent - Enriched with Tavily
  async legalResearchAgent(query: string, context: ProcessContext): Promise<AgentResponse> {
    try {
      // 1. Get relevant constitutional articles
      const constitutionalArticles = await constituteService.getRelevantArticles({
        query: `${query} ${context.title} ${context.description}`,
        country: context.country,
        language: context.language,
        limit: 3
      });

      // 2. Perform real-time web search with Tavily
      const webSearchResults = await tavilySearch(
        `${query} ${context.title}`,
        context.country
      );

      const prompt = loadSkill('Legal_Research_Agent.md', {
        type: context.type,
        title: context.title,
        description: context.description || 'Not specified',
        currentStep: String(context.currentStep),
        totalSteps: String(context.totalSteps),
        country: context.country,
        metadata: JSON.stringify(context.metadata, null, 2),
        constitutionalArticles: constitutionalArticles.map((article, index) => `${index + 1}. ${article}`).join('\n'),
        webSearchResults: webSearchResults,
        query: query,
        language: context.language === 'es' ? 'Spanish' : 'English'
      });

      const text = await skillAdapter.generate(prompt);

      return {
        text,
        confidence: 85,
        citations: constitutionalArticles.slice(0, 3)
      };
    } catch (error) {
      console.error('Legal research agent error:', error);
      return {
        text: 'Error in legal analysis. Please try again.',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process Planning Agent
  async processPlanningAgent(query: string, context: ProcessContext): Promise<AgentResponse> {
    try {
      const prompt = loadSkill('Process_Planning_Agent.md', {
        type: context.type,
        title: context.title,
        description: context.description || 'Not specified',
        currentStep: String(context.currentStep),
        totalSteps: String(context.totalSteps),
        country: context.country,
        metadata: JSON.stringify(context.metadata, null, 2),
        query: query,
        language: context.language === 'es' ? 'Spanish' : 'English'
      });

      const text = await skillAdapter.generate(prompt);

      const nextSteps = [
        `Review documentation for step ${context.currentStep + 1}`,
        'Verify compliance with legal requirements',
        'Prepare necessary documents',
        'Coordinate with competent authorities'
      ];

      return {
        text,
        confidence: 90,
        nextSteps
      };
    } catch (error) {
      console.error('Process planning agent error:', error);
      return {
        text: 'Error in process planning. Please try again.',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Document Generation Agent
  async documentGenerationAgent(query: string, context: ProcessContext): Promise<AgentResponse> {
    try {
      const prompt = loadSkill('Document_Generation_Agent.md', {
        type: context.type,
        title: context.title,
        description: context.description || 'No especificada',
        country: context.country,
        metadata: JSON.stringify(context.metadata, null, 2),
        query: query,
        language: context.language === 'es' ? 'español' : context.language
      });

      const text = await skillAdapter.generate(prompt);

      return {
        text,
        confidence: 88,
        citations: ['Código Civil', 'Constitución Nacional', 'Jurisprudencia aplicable']
      };
    } catch (error) {
      console.error('Document generation agent error:', error);
      return {
        text: 'Error en la generación de documentos. Por favor, intenta nuevamente.',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Citizen Mediator Agent - The main interactive agent for citizens (used on Web and WhatsApp)
  async citizenMediatorAgent(
    query: string,
    country: string,
    language: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    onChunk?: (chunk: string) => void
  ): Promise<AgentResponse> {
    try {
      // 1. Search Constitute API and Tavily for relevant laws
      const constitutionalArticles = await constituteService.getRelevantArticles({
        query,
        country,
        language,
        limit: 2
      });

      const webSearchResults = await tavilySearch(query, country);

      // 2. Format history for SkillAdapter
      const formattedHistory = conversationHistory
        .map(h => `${h.role === 'user' ? 'Ciudadano' : 'Mediador de IA'}: ${h.content}`)
        .join('\n');

      const prompt = loadSkill('Citizen_Mediator_Agent.md', {
        country: country,
        language: language === 'es' ? 'Español' : 'English',
        constitutionalArticles: constitutionalArticles.map((article, index) => `${index + 1}. ${article}`).join('\n'),
        webSearchResults: webSearchResults,
        formattedHistory: formattedHistory,
        query: query
      });

      let text = '';
      let suggestLawyer = false;

      if (onChunk) {
        let buffer = '';
        let outputIndex = 0;

        text = await skillAdapter.generateStream(prompt, {
          onChunk: (chunk) => {
            buffer += chunk;
            
            // Look for the metadata tag in the buffer
            const tagIndex = buffer.toLowerCase().indexOf('[suggest_lawyer');
            
            if (tagIndex === -1) {
              // If there's an open bracket at the end, hold it back in case it's part of the tag
              const openBracketIndex = buffer.lastIndexOf('[');
              let limit = buffer.length;
              if (openBracketIndex !== -1 && openBracketIndex >= outputIndex) {
                limit = openBracketIndex;
              }
              
              if (limit > outputIndex) {
                onChunk(buffer.substring(outputIndex, limit));
                outputIndex = limit;
              }
            } else {
              // We detected the tag starting, flush everything prior to the tag
              if (tagIndex > outputIndex) {
                onChunk(buffer.substring(outputIndex, tagIndex));
                outputIndex = tagIndex;
              }
            }
          }
        });

        // Clean and parse the tag from the final full text
        const suggestMatch = text.match(/\[SUGGEST_LAWYER:\s*(true|false)\]/i);
        if (suggestMatch) {
          suggestLawyer = suggestMatch[1].toLowerCase() === 'true';
          text = text.replace(/\[SUGGEST_LAWYER:\s*(true|false)\]/gi, '').trim();
        }
      } else {
        text = await skillAdapter.generate(prompt);

        // Parse the SUGGEST_LAWYER flag for non-streaming
        const suggestMatch = text.match(/\[SUGGEST_LAWYER:\s*(true|false)\]/i);
        if (suggestMatch) {
          suggestLawyer = suggestMatch[1].toLowerCase() === 'true';
          text = text.replace(/\[SUGGEST_LAWYER:\s*(true|false)\]/gi, '').trim();
        }
      }

      return {
        text,
        confidence: 90,
        suggestLawyer,
        citations: constitutionalArticles
      };
    } catch (error) {
      console.error('Citizen mediator agent error:', error);
      return {
        text: 'Lo siento, he tenido un inconveniente procesando tu consulta legal. Por favor, intenta de nuevo.',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Coordinator Agent - Routes queries to appropriate specialized agents
  async coordinatorAgent(query: string, context: ProcessContext): Promise<AgentResponse> {
    try {
      // Determine which agent(s) to use based on query intent
      const intentPrompt = loadSkill('Coordinator_Agent.md', {
        query: query,
        type: context.type,
        currentStep: String(context.currentStep),
        totalSteps: String(context.totalSteps)
      });

      const intent = (await skillAdapter.generate(intentPrompt)).trim().toUpperCase();

      switch (intent) {
        case 'RESEARCH':
          return await this.legalResearchAgent(query, context);
        
        case 'PLANNING':
          return await this.processPlanningAgent(query, context);
        
        case 'DOCUMENT':
          return await this.documentGenerationAgent(query, context);
        
        case 'GENERAL':
        default:
          const [research, planning] = await Promise.all([
            this.legalResearchAgent(query, context),
            this.processPlanningAgent(query, context)
          ]);

          const combinedText = `
## Análisis Legal
${research.text}

## Planificación del Proceso
${planning.text}
`;

          return {
            text: combinedText,
            confidence: Math.round((research.confidence + planning.confidence) / 2),
            citations: [...(research.citations || []), ...(planning.citations || [])],
            nextSteps: planning.nextSteps
          };
      }
    } catch (error) {
      console.error('Coordinator agent error:', error);
      return {
        text: 'Error en la coordinación de agentes. Por favor, intenta nuevamente.',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Main entry point for process-specific chat
  async processChat(query: string, context: ProcessContext): Promise<AgentResponse> {
    return await this.coordinatorAgent(query, context);
  }
}

export const multiAgentService = new MultiAgentService();
export default multiAgentService;