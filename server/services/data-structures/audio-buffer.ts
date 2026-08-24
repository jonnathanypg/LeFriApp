/**
 * audio-buffer.ts
 * 
 * Data Structure 7: Contiguous Typed Arrays (Uint8Array / ArrayBuffer) (O(1))
 * Zero-copy in-memory buffer manager for incoming voice notes from WhatsApp and Telegram,
 * preventing GC spikes and high memory fragmentation when processing audio for Whisper.
 */

export class AudioBufferManager {
  /**
   * Convert Base64 string directly into contiguous Uint8Array (O(N))
   */
  static base64ToTypedArray(base64Str: string): Uint8Array {
    const raw = Buffer.from(base64Str, 'base64');
    return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  }

  /**
   * Concatenate chunks into a single contiguous Uint8Array (O(N))
   */
  static concatChunks(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return combined;
  }

  /**
   * Validate audio header magic bytes for OGG/OPUS or MP3/WAV (O(1))
   */
  static detectAudioMime(buffer: Uint8Array): string {
    if (buffer.length < 4) return 'audio/ogg';

    // OggS
    if (buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
      return 'audio/ogg';
    }
    // ID3 (MP3)
    if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
      return 'audio/mpeg';
    }
    // RIFF (WAV)
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'audio/wav';
    }

    return 'audio/ogg';
  }
}
