/**
 * RAG Grounding Service: Busca leyes relevantes para la consulta del ciudadano.
 * Implementa una estrategia robusta de búsqueda vectorial sobre Pinecone (producción)
 * y una búsqueda semántica en memoria sobre MySQL (desarrollo/fallback).
 */

import { geminiService } from './gemini';
import { prisma } from '../prisma-client';
import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;
try {
  if (process.env.PINECONE_API_KEY) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
  }
} catch (e) {
  console.warn('Failed to initialize Pinecone client', e);
}

// Función para calcular similitud coseno en memoria
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RagGroundingService {
  /**
   * Realiza una búsqueda de documentos legales relevantes para la consulta del ciudadano.
   * Prioriza Pinecone con namespaces aislados por país y cae en MySQL con cálculo de similitud en memoria.
   */
  async searchRelevantLaws(query: string, country: string, limit = 4): Promise<any[]> {
    try {
      const queryEmbedding = await geminiService.getEmbedding(query);

      // 1. Intentar búsqueda vectorial en Pinecone utilizando Namespaces
      try {
        if (pineconeClient && process.env.PINECONE_INDEX) {
          console.log(`Attempting Pinecone Vector Search on index: ${process.env.PINECONE_INDEX}...`);
          const index = pineconeClient.Index(process.env.PINECONE_INDEX);
          
          // Estandarización de namespaces por país (ej: country_laws_EC)
          const namespace = `country_laws_${country.toUpperCase()}`;
          const queryResponse = await index.namespace(namespace).query({
            vector: queryEmbedding,
            topK: limit,
            includeMetadata: true
          });
          
          if (queryResponse.matches && queryResponse.matches.length > 0) {
            console.log(`Pinecone Vector Search returned ${queryResponse.matches.length} results.`);
            return queryResponse.matches.map(match => {
              const metadata: any = match.metadata || {};
              return {
                id: match.id,
                title: metadata.title || 'Documento Legal',
                category: metadata.category || 'General',
                content: metadata.content || '',
                country: metadata.country || country,
                embedding: queryEmbedding
              };
            });
          }
        }
      } catch (pineconeError) {
        console.warn('Pinecone Vector Search failed. Falling back to MySQL.', pineconeError);
      }

      // 2. Fallback de cálculo de similitud coseno en memoria sobre la base de datos MySQL
      console.log(`Querying MySQL legal documents for country: ${country}...`);
      const docs = await prisma.legalDocument.findMany({
        where: { country: country.toUpperCase() }
      });

      if (!docs || docs.length === 0) {
        console.log('No documents found in MySQL database for country:', country);
        return [];
      }

      const scoredDocs = docs
        .map((doc: any) => {
          let docEmbedding: number[] = [];
          if (doc.embedding) {
            docEmbedding = typeof doc.embedding === 'string' 
              ? JSON.parse(doc.embedding) 
              : (doc.embedding as any as number[]);
          }
          const score = cosineSimilarity(queryEmbedding, docEmbedding);
          return { doc, score };
        })
        .filter((item: any) => item.score > 0.1) // Filtrar coincidencias débiles
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limit)
        .map((item: any) => ({
          ...item.doc,
          _id: item.doc.id // compatibilidad con Mongoose
        }));

      console.log(`In-memory RAG Fallback completed. Found ${scoredDocs.length} candidate documents in MySQL.`);
      return scoredDocs;
    } catch (error) {
      console.error('Error during RAG Grounding Search:', error);
      return [];
    }
  }

  /**
   * Genera el contexto de Grounding formateado para inyectar en el prompt del LLM.
   */
  async getGroundingContext(query: string, country: string): Promise<{
    constitutionalArticles: string[];
    legalDocuments: string[];
  }> {
    const laws = await this.searchRelevantLaws(query, country);
    
    const constitutionalArticles: string[] = [];
    const legalDocuments: string[] = [];

    laws.forEach(law => {
      const formattedText = `[Fuente: ${law.title} (${law.category})]
${law.content}`;

      if (law.category.toLowerCase().includes('constitucion') || law.category.toLowerCase().includes('constitution')) {
        constitutionalArticles.push(formattedText);
      } else {
        legalDocuments.push(formattedText);
      }
    });

    return {
      constitutionalArticles,
      legalDocuments
    };
  }
}

export const ragGroundingService = new RagGroundingService();
