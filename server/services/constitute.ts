/**
 * constitute.ts
 * 
 * Integration with The Constitute Project Services API (https://www.constituteproject.org/service)
 * Implements constitution headers, topic searches (constopicsearch, sectionstopicsearch),
 * free-text searches (textsearch with 'q' and 'cons_id'), and full HTML extractions.
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

  // Mapping ISO 2-letter codes to Constitute Project country IDs
  private countryMapping: Record<string, string> = {
    'EC': 'Ecuador',
    'CO': 'Colombia',
    'PE': 'Peru',
    'MX': 'Mexico',
    'CL': 'Chile',
    'AR': 'Argentina',
    'ES': 'Spain',
    'US': 'United_States_of_America',
    'BO': 'Bolivia',
    'VE': 'Venezuela',
    'BR': 'Brazil',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'GT': 'Guatemala',
    'CR': 'Costa_Rica',
    'PA': 'Panama',
    'DO': 'Dominican_Republic',
    'SV': 'El_Salvador',
    'HN': 'Honduras',
    'NI': 'Nicaragua'
  };

  constructor() {
    this.baseUrl = process.env.CONSTITUTE_API_BASE_URL || 'https://www.constituteproject.org/service';
  }

  private resolveCountry(countryOrCode: string): string {
    const codeUpper = (countryOrCode || 'EC').toUpperCase();
    return this.countryMapping[codeUpper] || countryOrCode;
  }

  /**
   * Request list of constitutions
   * Method: GET /constitutions?[country=<c>&region=<r>&lang=<lang>&from_year=<y>&to_year=<y>&historic=<bool>]
   */
  async getConstitutions(params: {
    country?: string;
    region?: string;
    language?: string;
    from_year?: string;
    to_year?: string;
    historic?: boolean;
  } = {}): Promise<Constitution[]> {
    try {
      const countryName = params.country ? this.resolveCountry(params.country) : undefined;
      const cacheKey = `constitutions_${JSON.stringify({ ...params, country: countryName })}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const queryParams = new URLSearchParams();
      if (countryName) queryParams.append('country', countryName);
      if (params.region) queryParams.append('region', params.region);
      if (params.language) queryParams.append('lang', params.language || 'es');
      if (params.from_year) queryParams.append('from_year', params.from_year);
      if (params.to_year) queryParams.append('to_year', params.to_year);
      if (params.historic !== undefined) queryParams.append('historic', String(params.historic));

      const url = `${this.baseUrl}/constitutions?${queryParams.toString()}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) {
        throw new Error(`Constitute API error: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      setTimeout(() => this.cache.delete(cacheKey), 3600000); // 1 hr cache

      return data;
    } catch (error) {
      console.warn('[ConstituteService] Error fetching constitutions:', error);
      return [];
    }
  }

  /**
   * Free-Text Search
   * Method: GET /textsearch?q=<term>&[country=<c>&cons_id=<id>&lang=<lang>&historic=<bool>]
   */
  async textSearch(params: {
    query: string;
    country?: string;
    language?: string;
    cons_id?: string;
    historic?: boolean;
  }): Promise<any> {
    try {
      const countryName = params.country ? this.resolveCountry(params.country) : undefined;
      const cacheKey = `textsearch_${JSON.stringify({ ...params, country: countryName })}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const queryParams = new URLSearchParams();
      // Official parameter is 'q'
      queryParams.append('q', params.query);
      if (countryName) queryParams.append('country', countryName);
      if (params.language) queryParams.append('lang', params.language || 'es');
      if (params.cons_id) queryParams.append('cons_id', params.cons_id);
      if (params.historic !== undefined) queryParams.append('historic', String(params.historic));

      const url = `${this.baseUrl}/textsearch?${queryParams.toString()}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) {
        throw new Error(`Constitute API error: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      setTimeout(() => this.cache.delete(cacheKey), 1800000); // 30 min cache

      return data;
    } catch (error) {
      console.warn('[ConstituteService] Error in textSearch:', error);
      return null;
    }
  }

  /**
   * Topic Search across a single constitution's sections
   * Method: GET /sectionstopicsearch?key=<topic_key>&cons_id=<id>&lang=<lang>
   */
  async sectionsTopicSearch(topicKey: string, consId: string, language = 'es'): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/sectionstopicsearch?key=${encodeURIComponent(topicKey)}&cons_id=${encodeURIComponent(consId)}&lang=${language}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) return [];

      const data = await response.json();
      const constitutionData = data[consId];
      if (!constitutionData || !constitutionData.results) return [];

      return constitutionData.results.map((htmlString: string) => this.stripHtml(htmlString)).filter(Boolean);
    } catch (error) {
      console.warn('[ConstituteService] Error in sectionsTopicSearch:', error);
      return [];
    }
  }

  /**
   * Request full constitution HTML
   * Method: GET /html?cons_id=<id>&lang=<lang>
   */
  async getConstitutionHtml(constitutionId: string, language = 'es'): Promise<string> {
    try {
      const cacheKey = `html_${constitutionId}_${language}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const url = `${this.baseUrl}/html?cons_id=${constitutionId}&lang=${language}`;
      const response = await fetch(url);
      if (!response.ok) return '';

      const data = await response.json();
      const html = data?.html || '';
      this.cache.set(cacheKey, html);
      setTimeout(() => this.cache.delete(cacheKey), 86400000); // 24 hr cache

      return html;
    } catch (error) {
      console.warn('[ConstituteService] Error fetching constitution HTML:', error);
      return '';
    }
  }

  /**
   * Retrieve structured articles matching a user's legal crisis query
   */
  async getRelevantArticles(params: {
    query: string;
    country: string;
    language?: string;
    limit?: number;
  }): Promise<string[]> {
    try {
      const { query, country, language = 'es', limit = 3 } = params;
      const countryName = this.resolveCountry(country);

      // 1. Fetch available in-force constitutions for this country
      const constitutions = await this.getConstitutions({
        country: countryName,
        language,
        historic: false
      });

      if (!constitutions || constitutions.length === 0) {
        return [];
      }

      // Pick the primary active constitution
      const activeCons = constitutions.find(c => c.in_force) || constitutions[0];
      const consId = activeCons.id;

      // 2. Perform text search against this specific constitution
      const sectionResults = await this.textSearch({
        query,
        cons_id: consId,
        language
      });

      if (sectionResults && sectionResults[consId] && sectionResults[consId].results) {
        const rawResults: string[] = sectionResults[consId].results;
        const cleaned = rawResults
          .slice(0, limit)
          .map(html => this.stripHtml(html))
          .filter(text => text.length > 20);

        if (cleaned.length > 0) {
          return cleaned;
        }
      }

      // 3. Fallback: topic search if textsearch was empty
      const topics = ['debido proceso', 'derechos fundamentales', 'trabajo', 'familia', 'igualdad'];
      for (const t of topics) {
        if (query.toLowerCase().includes(t)) {
          const topicArticles = await this.sectionsTopicSearch(t, consId, language);
          if (topicArticles.length > 0) {
            return topicArticles.slice(0, limit);
          }
        }
      }

      return [];
    } catch (error) {
      console.warn('[ConstituteService] Error getting relevant articles:', error);
      return [];
    }
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const constituteService = new ConstituteService();
