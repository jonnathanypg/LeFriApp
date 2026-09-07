import axios from 'axios';
import FormData from 'form-data';

export class TranscriptionService {
  private mediaSuiteApiUrl: string;
  private mediaSuiteToken: string;

  private mediaMicroUrl: string;

  constructor() {
    this.mediaMicroUrl = process.env.MEDIA_MICRO_STT_URL || 'https://media.weblifetech.com/api/micro/audio/transcribe';
    this.mediaSuiteApiUrl = process.env.MEDIA_STT_URL || process.env.MEDIASUITE_STT_URL || process.env.WHISPER_API_URL || 'https://media.weblifetech.com/api/external/transcribe';
    this.mediaSuiteToken = process.env.EXTERNAL_API_KEY || process.env.MEDIASUITE_API_TOKEN || process.env.WHISPER_API_KEY || 'wlt_sec_9fec604794cc3059ae0cadc1a9b14f166eebc5c4220f45ae';
  }

  async transcribeAudioBuffer(audioBuffer: Buffer, filename: string = 'audio.webm'): Promise<string> {
    const token = this.mediaSuiteToken?.trim().replace(/^['"]|['"]$/g, '');

    const ext = filename.split('.').pop()?.toLowerCase() || 'webm';
    const mimeMap: Record<string, string> = {
      'webm': 'audio/webm',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      'mp4': 'audio/mp4'
    };
    const contentType = mimeMap[ext] || 'audio/webm';

    // Step 0: Remote media.weblifetech.com Microservice (Priority 1 - exactly as Aikrofy)
    try {
      console.log(`[TranscriptionService] Trying MediaSuite Micro STT: ${this.mediaMicroUrl}`);
      const form = new FormData();
      form.append('file', audioBuffer, { filename, contentType });

      const headers: Record<string, string> = {
        ...form.getHeaders()
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-API-Key'] = token;
      }

      const response = await axios.post(this.mediaMicroUrl, form, {
        headers,
        timeout: 25000
      });

      const text = response.data?.text || response.data?.transcription || '';
      if (text && text.trim()) {
        console.log(`[TranscriptionService] MediaSuite Micro STT successful. Length: ${text.length}`);
        return text.trim();
      }
    } catch (error: any) {
      console.warn('[TranscriptionService] MediaSuite Micro STT failed:', error?.message || error);
    }

    // Step 0.5: Remote media.weblifetech.com External STT API (Priority 2 - exactly as Aikrofy)
    try {
      console.log(`[TranscriptionService] Trying MediaSuite External STT: ${this.mediaSuiteApiUrl}`);
      const form = new FormData();
      form.append('file', audioBuffer, { filename, contentType });

      const headers: Record<string, string> = {
        ...form.getHeaders()
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-API-Key'] = token;
      }

      const response = await axios.post(this.mediaSuiteApiUrl, form, { 
        headers,
        timeout: 25000 
      });

      const text = response.data?.text || response.data?.transcription || '';
      if (text && text.trim()) {
        console.log(`[TranscriptionService] MediaSuite External STT successful. Length: ${text.length}`);
        return text.trim();
      }
    } catch (error: any) {
      console.warn('[TranscriptionService] MediaSuite External STT API failed:', error?.message || error);
    }

    // 2. Fallback to Groq Whisper if available (ultra-fast transcription)
    const rawGroqKey = process.env.GROQ_API_KEY;
    if (rawGroqKey) {
      const groqKey = rawGroqKey.trim().replace(/^['"]|['"]$/g, '');
      try {
        console.log('[TranscriptionService] Attempting fallback via Groq Whisper API...');
        const form = new FormData();
        const safeFilename = filename.includes('.') ? filename : `${filename}.webm`;
        form.append('file', audioBuffer, { filename: safeFilename, contentType });
        form.append('model', 'whisper-large-v3');

        const headers = {
          ...form.getHeaders(),
          'Authorization': `Bearer ${groqKey}`
        };

        const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, { 
          headers,
          timeout: 25000 
        });
        if (response.data?.text) {
          console.log(`[TranscriptionService] Groq STT fallback successful. Length: ${response.data.text.length}`);
          return response.data.text.trim();
        }
      } catch (err: any) {
        console.warn('[TranscriptionService] Groq Whisper fallback failed:', err?.message || err);
      }
    }

    // 3. Fallback to OpenAI Whisper if available
    const rawOpenAiKey = process.env.OPENAI_API_KEY;
    if (rawOpenAiKey) {
      const openAiKey = rawOpenAiKey.trim().replace(/^['"]|['"]$/g, '');
      try {
        console.log('[TranscriptionService] Attempting fallback via OpenAI Whisper API...');
        const form = new FormData();
        const safeFilename = filename.includes('.') ? filename : `${filename}.webm`;
        form.append('file', audioBuffer, { filename: safeFilename, contentType });
        form.append('model', 'whisper-1');

        const headers = {
          ...form.getHeaders(),
          'Authorization': `Bearer ${openAiKey}`
        };

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, { 
          headers,
          timeout: 30000 
        });
        if (response.data?.text) {
          console.log(`[TranscriptionService] OpenAI Whisper fallback successful. Length: ${response.data.text.length}`);
          return response.data.text.trim();
        }
      } catch (err: any) {
        console.error('[TranscriptionService] OpenAI Whisper fallback failed:', err?.message || err);
      }
    }

    throw new Error('Transcription failed: All STT services (MediaSuite, Groq, OpenAI) were unavailable.');
  }

  async transcribeAudioUrl(audioUrl: string): Promise<string> {
    try {
      const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      return await this.transcribeAudioBuffer(buffer, 'audio.mp3');
    } catch (error) {
      console.error('[TranscriptionService] Error downloading or transcribing audio URL:', error);
      throw error;
    }
  }
}

export const transcriptionService = new TranscriptionService();
