import axios from 'axios';
import FormData from 'form-data';

export class TranscriptionService {
  private mediaSuiteApiUrl: string;
  private mediaSuiteToken: string;

  constructor() {
    this.mediaSuiteApiUrl = process.env.MEDIASUITE_STT_URL || process.env.WHISPER_API_URL || 'https://media.weblifetech.com/api/external/transcribe';
    this.mediaSuiteToken = process.env.MEDIASUITE_API_TOKEN || process.env.WHISPER_API_KEY || 'wlt_sec_default_token';
  }

  async transcribeAudioBuffer(audioBuffer: Buffer, filename: string = 'audio.mp3'): Promise<string> {
    // 1. Try MediaSuite Primary API (media.weblifetech.com)
    try {
      console.log(`[TranscriptionService] Sending STT request to MediaSuite API: ${this.mediaSuiteApiUrl}`);
      const form = new FormData();
      form.append('file', audioBuffer, filename);

      const headers: Record<string, string> = {
        ...form.getHeaders()
      };

      if (this.mediaSuiteToken) {
        if (this.mediaSuiteToken.startsWith('wlt_sec_')) {
          headers['Authorization'] = `Bearer ${this.mediaSuiteToken}`;
        } else {
          headers['x-api-key'] = this.mediaSuiteToken;
          headers['Authorization'] = `Bearer ${this.mediaSuiteToken}`;
        }
      }

      const response = await axios.post(this.mediaSuiteApiUrl, form, { 
        headers,
        timeout: 30000 
      });

      const text = response.data.text || response.data.transcription || '';
      if (text) {
        console.log(`[TranscriptionService] MediaSuite STT successful. Length: ${text.length}`);
        return text.trim();
      }
    } catch (error: any) {
      console.warn('[TranscriptionService] Primary MediaSuite STT API failed:', error?.message || error);
    }

    // 2. Fallback to Groq Whisper if available
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        console.log('[TranscriptionService] Attempting fallback via Groq Whisper API...');
        const form = new FormData();
        form.append('file', audioBuffer, filename);
        form.append('model', 'whisper-large-v3');

        const headers = {
          ...form.getHeaders(),
          'Authorization': `Bearer ${groqKey}`
        };

        const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, { headers });
        if (response.data?.text) {
          console.log(`[TranscriptionService] Groq STT fallback successful. Length: ${response.data.text.length}`);
          return response.data.text.trim();
        }
      } catch (err: any) {
        console.warn('[TranscriptionService] Groq Whisper fallback failed:', err?.message || err);
      }
    }

    // 3. Fallback to OpenAI Whisper if available
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        console.log('[TranscriptionService] Attempting fallback via OpenAI Whisper API...');
        const form = new FormData();
        form.append('file', audioBuffer, filename);
        form.append('model', 'whisper-1');

        const headers = {
          ...form.getHeaders(),
          'Authorization': `Bearer ${openAiKey}`
        };

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, { headers });
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
