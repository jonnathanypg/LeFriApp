import axios from 'axios';
import FormData from 'form-data';

export class TranscriptionService {
  private whisperApiUrl: string;

  constructor() {
    this.whisperApiUrl = process.env.WHISPER_API_URL || 'http://localhost:5000/transcribe';
  }

  async transcribeAudioBuffer(audioBuffer: Buffer, filename: string = 'audio.ogg'): Promise<string> {
    try {
      const form = new FormData();
      form.append('file', audioBuffer, filename);

      const headers: Record<string, string> = {
        ...form.getHeaders()
      };
      
      const apiKey = process.env.WHISPER_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios.post(this.whisperApiUrl, form, { headers });
      return response.data.text || response.data.transcription || '';
    } catch (error) {
      console.error('[TranscriptionService] Error transcribing audio buffer:', error);
      throw error;
    }
  }

  async transcribeAudioUrl(audioUrl: string): Promise<string> {
    try {
      const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      return await this.transcribeAudioBuffer(buffer, 'audio.ogg');
    } catch (error) {
      console.error('[TranscriptionService] Error downloading or transcribing audio URL:', error);
      throw error;
    }
  }
}

export const transcriptionService = new TranscriptionService();
