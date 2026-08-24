/**
 * message-queue.ts
 * 
 * Data Structure 5: FIFO Message Queue with Humanized Delivery Rate Limiter (O(1))
 * Handles asynchronous burst control, typing simulation, and message splitting
 * for WhatsApp (Baileys) and Telegram to prevent provider rate limits and anti-ban triggers.
 */

export interface QueuedMessage {
  id: string;
  channel: 'whatsapp' | 'telegram';
  recipient: string; // phone or chatId
  text: string;
  tenantId?: string;
  replyMarkup?: any;
  priority: number;
  enqueuedAt: number;
}

export class MessageQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing: boolean = false;
  private sendHandler?: (msg: QueuedMessage) => Promise<boolean>;

  /**
   * Register delivery dispatcher
   */
  setHandler(handler: (msg: QueuedMessage) => Promise<boolean>): void {
    this.sendHandler = handler;
  }

  /**
   * Enqueue message (O(1))
   */
  enqueue(msg: Omit<QueuedMessage, 'id' | 'enqueuedAt'>): string {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMsg: QueuedMessage = {
      ...msg,
      id,
      enqueuedAt: Date.now()
    };
    this.queue.push(fullMsg);
    this.processQueue();
    return id;
  }

  /**
   * Split long text into natural paragraphs / conversational bubbles (O(N))
   */
  static splitHumanizedBubbles(text: string, maxChunkLength = 400): string[] {
    if (text.length <= maxChunkLength) return [text];

    const paragraphs = text.split(/\n\n+/);
    const bubbles: string[] = [];
    let currentBubble = "";

    for (const para of paragraphs) {
      if ((currentBubble + "\n\n" + para).length <= maxChunkLength) {
        currentBubble = currentBubble ? `${currentBubble}\n\n${para}` : para;
      } else {
        if (currentBubble) bubbles.push(currentBubble.trim());
        if (para.length > maxChunkLength) {
          // Break by single newline or sentences
          const sentences = para.split(/(?<=[.?!])\s+/);
          let sentenceChunk = "";
          for (const s of sentences) {
            if ((sentenceChunk + " " + s).length <= maxChunkLength) {
              sentenceChunk = sentenceChunk ? `${sentenceChunk} ${s}` : s;
            } else {
              if (sentenceChunk) bubbles.push(sentenceChunk.trim());
              sentenceChunk = s;
            }
          }
          if (sentenceChunk) currentBubble = sentenceChunk;
        } else {
          currentBubble = para;
        }
      }
    }
    if (currentBubble) bubbles.push(currentBubble.trim());
    return bubbles.filter(b => b.length > 0);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const msg = this.queue.shift()!;
        if (this.sendHandler) {
          // Humanized delay: 20ms per character, clamped between 500ms and 1500ms
          const typingDelay = Math.min(1500, Math.max(500, msg.text.length * 15));
          await new Promise(r => setTimeout(r, typingDelay));
          
          try {
            await this.sendHandler(msg);
          } catch (err) {
            console.error(`[MessageQueue] Failed to deliver ${msg.id}:`, err);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  size(): number {
    return this.queue.length;
  }
}

export const messageQueue = new MessageQueue();
