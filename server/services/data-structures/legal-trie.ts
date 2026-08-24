/**
 * legal-trie.ts
 * 
 * Data Structure 4: Prefix Tree / Trie (O(L) where L is length of keyword)
 * Provides microsecond search for Ecuadorian / Latin American legal articles,
 * keywords, and constitutional rights without invoking heavy vector RAG pipelines for exact terms.
 */

export interface LegalArticleInfo {
  code: string;         // e.g. "Constitución", "Código de Trabajo", "COIP"
  article: string;      // e.g. "Art. 76", "Art. 185", "Art. 526"
  title: string;
  summary: string;
  category: string;     // 'constitucional' | 'laboral' | 'penal' | 'familia'
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  articles: LegalArticleInfo[] = [];
}

export class LegalConceptTrie {
  private root: TrieNode = new TrieNode();

  constructor() {
    this.seedDefaultKnowledge();
  }

  /**
   * Insert keyword and associated legal article into Trie (O(L))
   */
  insert(keyword: string, article: LegalArticleInfo): void {
    let current = this.root;
    const normalized = keyword.toLowerCase().trim();

    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    if (!current.articles.some(a => a.article === article.article && a.code === article.code)) {
      current.articles.push(article);
    }
  }

  /**
   * Search exact prefix or keyword (O(L))
   */
  searchPrefix(prefix: string): LegalArticleInfo[] {
    let current = this.root;
    const normalized = prefix.toLowerCase().trim();

    for (const char of normalized) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    return this.collectAllArticles(current);
  }

  /**
   * Extract legal citations from user query by checking matching Trie words (O(W * L))
   */
  matchQuery(query: string): LegalArticleInfo[] {
    const words = query.toLowerCase().split(/[\s,.;:!?()]+/);
    const matchedArticles = new Map<string, LegalArticleInfo>();

    for (let i = 0; i < words.length; i++) {
      for (let len = 1; len <= 3 && i + len <= words.length; len++) {
        const phrase = words.slice(i, i + len).join(' ');
        const results = this.searchPrefix(phrase);
        for (const art of results) {
          const key = `${art.code}_${art.article}`;
          if (!matchedArticles.has(key)) {
            matchedArticles.set(key, art);
          }
        }
      }
    }

    const output: LegalArticleInfo[] = [];
    matchedArticles.forEach(art => output.push(art));
    return output;
  }

  private collectAllArticles(node: TrieNode): LegalArticleInfo[] {
    let list: LegalArticleInfo[] = [...node.articles];
    node.children.forEach(child => {
      list = list.concat(this.collectAllArticles(child));
    });
    
    const unique = new Map<string, LegalArticleInfo>();
    for (const item of list) {
      unique.set(`${item.code}_${item.article}`, item);
    }
    const result: LegalArticleInfo[] = [];
    unique.forEach(item => result.push(item));
    return result;
  }

  private seedDefaultKnowledge(): void {
    const seeds: Array<{ keywords: string[]; article: LegalArticleInfo }> = [
      {
        keywords: ['debido proceso', 'derecho a la defensa', 'presuncion de inocencia'],
        article: {
          code: 'Constitución del Ecuador',
          article: 'Art. 76',
          title: 'Garantías Básicas del Debido Proceso',
          summary: 'En todo proceso en el que se determinen derechos y obligaciones, se asegurará el derecho al debido proceso y presunción de inocencia.',
          category: 'constitucional'
        }
      },
      {
        keywords: ['detencion', 'flagrancia', 'arresto', 'policia'],
        article: {
          code: 'Código Orgánico Integral Penal (COIP)',
          article: 'Art. 526',
          title: 'Aprehensión en Flagrancia',
          summary: 'Cualquier persona puede aprehender a quien sea sorprendido en delito flagrante. Debe entregarse de inmediato a la Policía Nacional. La detención no puede superar 24 horas sin audiencia.',
          category: 'penal'
        }
      },
      {
        keywords: ['despido intempestivo', 'despido', 'finiquito', 'indemnizacion laboral'],
        article: {
          code: 'Código del Trabajo',
          article: 'Art. 185 / 188',
          title: 'Indemnización por Despido Intempestivo y Desahucio',
          summary: 'El empleador que despida intempestivamente al trabajador será condenado a indemnizarlo con el equivalente a un mes de remuneración por cada año de servicio, más bonificación de desahucio (25%).',
          category: 'laboral'
        }
      },
      {
        keywords: ['pension alimenticia', 'alimentos', 'pension hijos', 'supa'],
        article: {
          code: 'Código de la Niñez y Adolescencia',
          article: 'Art. Innumerado 2 y 15',
          title: 'Derecho a Alimentos de Niños y Adolescentes',
          summary: 'Los padres tienen el deber ineludible de prestar alimentos según la Tabla de Pensiones Alimenticias Mínimas fijada por el Consejo de la Judicatura.',
          category: 'familia'
        }
      },
      {
        keywords: ['violencia intrafamiliar', 'boleta de auxilio', 'medidas de proteccion'],
        article: {
          code: 'Ley Orgánica para Prevenir y Erradicar la Violencia contra las Mujeres',
          article: 'Art. 51',
          title: 'Medidas Administrativas de Protección Inmediata',
          summary: 'Emisión inmediata de boletas de auxilio y orden de salida del agresor del domicilio familiar.',
          category: 'penal'
        }
      }
    ];

    for (const seed of seeds) {
      for (const kw of seed.keywords) {
        this.insert(kw, seed.article);
      }
    }
  }
}

export const legalConceptTrie = new LegalConceptTrie();
