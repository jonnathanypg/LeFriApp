/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * All AI-powered skills are accessed through this SkillAdapter, an abstraction layer that allows
 * for swapping the underlying LLM provider without changing the core application logic.
 * To migrate to a decentralized P2P network:
 * 1. Swapping from centralized providers (Google Gemini) to decentralized compute networks (e.g. Akash, Bittensor, or Petals).
 * 2. Deploying local, quantized models (like Llama-3-8B-Instruct) on user machines using WebGPU / ONNX runtime,
 *    running entirely offline and client-side (local-first intelligence).
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

function loadSkill(filename: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'skills', filename), 'utf-8').trim();
}

export interface SkillOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  onChunk?: (chunk: string) => void;
}

export class SkillAdapter {
  private genAI: GoogleGenerativeAI | null = null;
  private primaryProvider: string;
  private primaryModel: string;
  private openAiApiKey: string | null = null;

  constructor() {
    this.primaryProvider = process.env.DEFAULT_LLM_PROVIDER || 'openai';
    this.primaryModel = process.env.DEFAULT_LLM_MODEL || 'gpt-5-nano';
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    
    this.openAiApiKey = process.env.OPENAI_API_KEY || null;
    
    if (!apiKey && !this.openAiApiKey) {
      console.warn("SkillAdapter: Neither GEMINI_API_KEY nor OPENAI_API_KEY is defined. Using mock fallback responses.");
    }
  }

  /**
   * Generates a response from the LLM. If the primary provider fails, 
   * automatically fallbacks to a simulated response to maintain high execution reliability.
   */
  async generate(prompt: string, options: SkillOptions = {}): Promise<string> {
    try {
      if (this.primaryProvider === 'openai' || this.primaryProvider === 'gpt') {
        return await this.generateOpenAI(prompt, options);
      }
      if (this.primaryProvider === 'gemini') {
        return await this.generateGemini(prompt, options);
      }
      throw new Error(`Provider ${this.primaryProvider} is not supported by SkillAdapter`);
    } catch (error) {
      console.error(`SkillAdapter: ${this.primaryProvider} call failed. Cascade failover active.`, error);
      return this.getFallbackMessage(prompt);
    }
  }

  /**
   * Generates a streaming response for responsive UIs.
   */
  async generateStream(
    prompt: string, 
    options: SkillOptions & { onChunk: (chunk: string) => void }
  ): Promise<string> {
    try {
      if (this.primaryProvider === 'openai' || this.primaryProvider === 'gpt') {
        return await this.generateOpenAIStream(prompt, options);
      }
      if (this.primaryProvider === 'gemini') {
        return await this.generateGeminiStream(prompt, options);
      }
      throw new Error(`Streaming not supported by provider ${this.primaryProvider}`);
    } catch (error) {
      console.error(`SkillAdapter: ${this.primaryProvider} streaming failed. Using simulated typing stream.`, error);
      const fallbackText = this.getFallbackMessage(prompt);
      await this.simulateStream(fallbackText, options.onChunk);
      return fallbackText;
    }
  }

  private async generateGemini(prompt: string, options: SkillOptions): Promise<string> {
    if (!this.genAI) throw new Error("Gemini SDK not configured (missing API Key)");
    const model = this.genAI.getGenerativeModel({ model: this.primaryModel });
    
    // Inject system instruction if present
    const contents: any[] = [];
    
    // In gemini-1.5, we can pass systemInstruction directly in options
    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens,
    };
    
    const modelOptions: any = {
      model: this.primaryModel,
      generationConfig,
    };
    
    if (options.systemPrompt) {
      modelOptions.systemInstruction = options.systemPrompt;
    }

    const activeModel = this.genAI.getGenerativeModel(modelOptions);
    const result = await activeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async generateGeminiStream(
    prompt: string, 
    options: SkillOptions & { onChunk: (chunk: string) => void }
  ): Promise<string> {
    if (!this.genAI) throw new Error("Gemini SDK not configured (missing API Key)");
    
    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens,
    };
    
    const modelOptions: any = {
      model: this.primaryModel,
      generationConfig,
    };
    
    if (options.systemPrompt) {
      modelOptions.systemInstruction = options.systemPrompt;
    }

    const activeModel = this.genAI.getGenerativeModel(modelOptions);
    const result = await activeModel.generateContentStream(prompt);
    
    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      options.onChunk(chunkText);
    }
    return fullText;
  }

  private async generateOpenAI(prompt: string, options: SkillOptions): Promise<string> {
    const apiKey = this.openAiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured (missing OPENAI_API_KEY)");

    const systemPrompt = options.systemPrompt || loadSkill('Legal_Assistant.md');
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.primaryModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: Status ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private async generateOpenAIStream(
    prompt: string,
    options: SkillOptions & { onChunk: (chunk: string) => void }
  ): Promise<string> {
    const apiKey = this.openAiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured (missing OPENAI_API_KEY)");

    const systemPrompt = options.systemPrompt || loadSkill('Legal_Assistant.md');

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.primaryModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature ?? 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: Status ${response.status} - ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Could not acquire reader for response stream");

    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleanedLine = line.trim();
        if (!cleanedLine || cleanedLine === "data: [DONE]") continue;

        if (cleanedLine.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(cleanedLine.substring(6));
            const chunkText = parsed.choices?.[0]?.delta?.content || "";
            if (chunkText) {
              fullText += chunkText;
              options.onChunk(chunkText);
            }
          } catch (e) {
            // Ignore parsing errors for partial lines
          }
        }
      }
    }
    return fullText;
  }


  private async simulateStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
    const words = text.split(' ');
    for (const word of words) {
      onChunk(word + ' ');
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  }

  private getFallbackMessage(prompt: string): string {
    return loadSkill('Fallback_Message.md');
  }
}

export const skillAdapter = new SkillAdapter();
export default skillAdapter;
