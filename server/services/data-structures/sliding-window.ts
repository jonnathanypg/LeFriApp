/**
 * sliding-window.ts
 * 
 * Data Structure 2: Doubly Linked List for Conversational Memory Sliding Window (O(1))
 * Maintains the latest N messages for LLM context without costly array slicing or memory churn.
 */

export interface ChatMessageNode {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  prev: ChatMessageNode | null;
  next: ChatMessageNode | null;
}

export class SlidingWindowMemory {
  private head: ChatMessageNode | null = null;
  private tail: ChatMessageNode | null = null;
  private size: number = 0;
  private readonly maxSize: number;

  constructor(maxSize = 8) {
    this.maxSize = maxSize;
  }

  /**
   * Append a new message to the end of the sliding window (O(1))
   */
  push(role: 'user' | 'assistant' | 'system', content: string, timestamp?: string): void {
    const newNode: ChatMessageNode = {
      role,
      content,
      timestamp: timestamp || new Date().toISOString(),
      prev: this.tail,
      next: null
    };

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
      }
    }
    this.size++;

    // Evict oldest from head in O(1) if capacity exceeded
    if (this.size > this.maxSize) {
      this.evictHead();
    }
  }

  /**
   * Remove oldest message from head (O(1))
   */
  private evictHead(): void {
    if (!this.head) return;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.head) this.head.prev = null;
    }
    this.size--;
  }

  /**
   * Convert linked list to clean LLM history array (O(k) where k <= maxSize)
   */
  toArray(): Array<{ role: 'user' | 'assistant'; content: string }> {
    const result: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let curr = this.head;
    while (curr) {
      if (curr.role === 'user' || curr.role === 'assistant') {
        result.push({ role: curr.role, content: curr.content });
      }
      curr = curr.next;
    }
    return result;
  }

  /**
   * Seed linked list from existing array
   */
  static fromArray(messages: any[], maxSize = 8): SlidingWindowMemory {
    const memory = new SlidingWindowMemory(maxSize);
    const slice = messages.slice(-maxSize);
    for (const msg of slice) {
      memory.push(msg.role, msg.content, msg.timestamp);
    }
    return memory;
  }

  getSize(): number {
    return this.size;
  }
}
