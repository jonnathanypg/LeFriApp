/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Grounding data is presently obtained from the centralized Constitute Project API.
 * In a P2P decentralized state:
 * 1. Constitutional data will be downloaded and indexed locally (as a static SQLite database or vector store).
 * 2. Peer nodes will serve chunked legal documents over decentralized filesystems (IPFS).
 */

export interface Constitution {
  id: string;
  country: string;
  country_id: string;
  title: string;
  title_long: string;
  region: string;
  language: string;
  year_enacted: string;
  in_force: boolean;
  word_length: string;
}

export interface ConstitutionSection {
  constitution_id: string;
  section_id: string;
  section_name: string;
  section_text: string;
  topics: string[];
}

export interface TopicSearchResult {
  constitution_id: string;
  section_id: string;
  section_name: string;
  section_text: string;
  topic_name: string;
  relevance_score: number;
}

export class ConstituteService {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.baseUrl = process.env.CONSTITUTE_API_BASE_URL || 'https://www.constituteproject.org/service';
  }

  async getConstitutions(params: {
    country?: string;
    region?: string;
    language?: string;
    from_year?: string;
    to_year?: string;
  } = {}): Promise<Constitution[]> {
    try {
      const cacheKey = `constitutions_${JSON.stringify(params)}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const queryParams = new URLSearchParams();
      if (params.country) queryParams.append('country', params.country);
      if (params.region) queryParams.append('region', params.region);
      if (params.language) queryParams.append('lang', params.language);
      if (params.from_year) queryParams.append('from_year', params.from_year);
      if (params.to_year) queryParams.append('to_year', params.to_year);

      const url = `${this.baseUrl}/constitutions?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Constitute API error: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      
      // Cache for 1 hour
      setTimeout(() => this.cache.delete(cacheKey), 3600000);
      
      return data;
    } catch (error) {
      console.error('Error fetching constitutions:', error);
      return [];
    }
  }

  async getConstitutionHtml(constitutionId: string): Promise<string> {
    try {
      const cacheKey = `html_${constitutionId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const url = `${this.baseUrl}/html?cons_id=${constitutionId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Constitute API error: ${response.status}`);
      }

      const html = await response.text();
      this.cache.set(cacheKey, html);
      
      // Cache for 24 hours
      setTimeout(() => this.cache.delete(cacheKey), 86400000);
      
      return html;
    } catch (error) {
      console.error('Error fetching constitution HTML:', error);
      return '';
    }
  }

  async searchByTopic(params: {
    topic: string;
    country?: string;
    language?: string;
  }): Promise<TopicSearchResult[]> {
    try {
      const cacheKey = `topic_${JSON.stringify(params)}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const queryParams = new URLSearchParams();
      queryParams.append('topic', params.topic);
      if (params.country) queryParams.append('country', params.country);
      if (params.language) queryParams.append('lang', params.language);

      const url = `${this.baseUrl}/constopicsearch?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Constitute API error: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      
      // Cache for 1 hour
      setTimeout(() => this.cache.delete(cacheKey), 3600000);
      
      return data;
    } catch (error) {
      console.error('Error searching by topic:', error);
      return [];
    }
  }

  async textSearch(params: {
    query: string;
    country?: string;
    language?: string;
    cons_id?: string;
  }): Promise<any[]> {
    try {
      const cacheKey = `textsearch_${JSON.stringify(params)}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const queryParams = new URLSearchParams();
      queryParams.append('query', params.query);
      if (params.country) queryParams.append('country', params.country);
      if (params.language) queryParams.append('lang', params.language);
      if (params.cons_id) queryParams.append('cons_id', params.cons_id);

      const url = `${this.baseUrl}/textsearch?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Constitute API error: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      
      // Cache for 30 minutes
      setTimeout(() => this.cache.delete(cacheKey), 1800000);
      
      return data;
    } catch (error) {
      console.error('Error in text search:', error);
      return [];
    }
  }

  async getRelevantArticles(params: {
    query: string;
    country: string;
    language?: string;
    limit?: number;
  }): Promise<string[]> {
    try {
      const { query, country, language = 'es', limit = 5 } = params;
      
      // First, get constitutions for the country
      const constitutions = await this.getConstitutions({ 
        country, 
        language 
      });

      if (constitutions.length === 0) {
        return [];
      }

      // Search for relevant sections using text search
      const searchResults = await this.textSearch({
        query,
        country,
        language
      });

      // Extract and format relevant articles
      const articles = searchResults
        .slice(0, limit)
        .map(result => {
          if (result.section_text && result.section_name) {
            return `Artículo: ${result.section_name}\n${result.section_text}`;
          }
          return null;
        })
        .filter((article): article is string => article !== null);

      return articles;
    } catch (error) {
      console.error('Error getting relevant articles:', error);
      return [];
    }
  }

  async getCountryTopics(country: string, language = 'es'): Promise<string[]> {
    try {
      const constitutions = await this.getConstitutions({ country, language });
      
      if (constitutions.length === 0) {
        return [];
      }

      // Common legal topics to search for
      const commonTopics = [
        'derechos fundamentales',
        'derechos humanos',
        'debido proceso',
        'igualdad',
        'libertad',
        'propiedad',
        'trabajo',
        'educación',
        'salud',
        'familia',
        'justicia',
        'procedimiento penal',
        'procedimiento civil'
      ];

      const topics: string[] = [];
      
      for (const topic of commonTopics) {
        const results = await this.searchByTopic({
          topic,
          country,
          language
        });
        
        if (results.length > 0) {
          topics.push(topic);
        }
      }

      return topics;
    } catch (error) {
      console.error('Error getting country topics:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const constituteService = new ConstituteService();