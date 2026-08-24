/**
 * triage-heap.ts
 * 
 * Data Structure 3: Max-Heap Priority Queue (O(1) Top / O(log N) Insert/Extract)
 * Prioritizes emergency legal triage cases based on urgency score:
 * - Flagrancia / Detención policial: Priority 10
 * - Violencia / Medidas de Protección: Priority 9
 * - Despido Intempestivo / Acoso Grave: Priority 7
 * - Alimentos / Régimen Visitas: Priority 5
 * - Consultas Generales / Contratos: Priority 2
 */

export interface TriageItem {
  id: string;
  citizenId?: string;
  source: 'web' | 'whatsapp' | 'telegram';
  category: string;
  query: string;
  urgencyScore: number; // 1 to 10
  timestamp: number;
  contact?: string;
}

export class LegalTriageHeap {
  private heap: TriageItem[] = [];

  /**
   * Insert a new triage case into the heap (O(log N))
   */
  insert(item: TriageItem): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Peek highest priority case (O(1))
   */
  peek(): TriageItem | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Extract highest priority case (O(log N))
   */
  extractMax(): TriageItem | null {
    if (this.heap.length === 0) return null;
    const max = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return max;
  }

  /**
   * Calculate automatic urgency score based on legal keywords (O(L))
   */
  static calculateUrgency(text: string, category?: string): { score: number; detectedCategory: string } {
    const lower = text.toLowerCase();
    
    // Penal / Detención / Emergencia (Score 10)
    if (lower.includes('detenido') || lower.includes('arrestado') || lower.includes('policia') || 
        lower.includes('flagrancia') || lower.includes('preso') || lower.includes('comisaria') || lower.includes('sos')) {
      return { score: 10, detectedCategory: 'penal_emergencia' };
    }
    
    // Violencia / Amenazas (Score 9)
    if (lower.includes('violencia') || lower.includes('amenaza') || lower.includes('golpe') || 
        lower.includes('boleta de auxilio') || lower.includes('medida de proteccion')) {
      return { score: 9, detectedCategory: 'violencia_proteccion' };
    }
    
    // Laboral / Despido (Score 7)
    if (lower.includes('despido') || lower.includes('liquidaci') || lower.includes('finiquito') || 
        lower.includes('sueldo') || lower.includes('patrono') || lower.includes('acoso laboral')) {
      return { score: 7, detectedCategory: 'laboral' };
    }
    
    // Familia / Alimentos (Score 5)
    if (lower.includes('alimento') || lower.includes('pension') || lower.includes('divorcio') || 
        lower.includes('custodia') || lower.includes('hijo') || lower.includes('patria potestad')) {
      return { score: 5, detectedCategory: 'familia' };
    }
    
    // Default Category Mapping
    if (category === 'triage_penal') return { score: 9, detectedCategory: 'penal' };
    if (category === 'triage_laboral') return { score: 7, detectedCategory: 'laboral' };
    if (category === 'triage_familia') return { score: 5, detectedCategory: 'familia' };
    
    return { score: 3, detectedCategory: category || 'general' };
  }

  private bubbleUp(idx: number): void {
    const element = this.heap[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.heap[parentIdx];
      if (element.urgencyScore <= parent.urgencyScore) break;
      this.heap[idx] = parent;
      this.heap[parentIdx] = element;
      idx = parentIdx;
    }
  }

  private sinkDown(idx: number): void {
    const length = this.heap.length;
    const element = this.heap[idx];

    while (true) {
      let leftChildIdx = 2 * idx + 1;
      let rightChildIdx = 2 * idx + 2;
      let leftChild: TriageItem | null = null;
      let rightChild: TriageItem | null = null;
      let swap: number | null = null;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.urgencyScore > element.urgencyScore) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.urgencyScore > element.urgencyScore) ||
          (swap !== null && leftChild && rightChild.urgencyScore > leftChild.urgencyScore)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[idx] = this.heap[swap];
      this.heap[swap] = element;
      idx = swap;
    }
  }

  size(): number {
    return this.heap.length;
  }
}

export const legalTriageHeap = new LegalTriageHeap();
