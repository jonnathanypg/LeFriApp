/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Voice recording files are currently stored locally in the server's filesystem.
 * In a P2P decentralized state:
 * 1. Audios will be compressed and encrypted client-side using user-held keys.
 * 2. Encrypted files will be uploaded to IPFS / Filecoin, storing only the Content Identifiers (CIDs) locally.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface VoiceRecording {
  id: string;
  userId: number;
  filename: string;
  filePath: string;
  duration: number;
  createdAt: Date;
  type: 'emergency' | 'consultation' | 'process';
}

export class VoiceService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'voice');
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  async saveVoiceRecording(params: {
    userId: number;
    audioBuffer: Buffer;
    type: 'emergency' | 'consultation' | 'process';
    originalName?: string;
  }): Promise<VoiceRecording> {
    const { userId, audioBuffer, type, originalName } = params;
    
    const timestamp = Date.now();
    const id = `voice_${userId}_${timestamp}`;
    const filename = originalName || `${id}.mp3`;
    const filePath = path.join(this.uploadsDir, filename);

    try {
      await fs.writeFile(filePath, audioBuffer);

      const recording: VoiceRecording = {
        id,
        userId,
        filename,
        filePath,
        duration: 0, // Would need audio analysis library to get actual duration
        createdAt: new Date(),
        type,
      };

      return recording;
    } catch (error) {
      console.error('Error saving voice recording:', error);
      throw new Error('Failed to save voice recording');
    }
  }

  async getVoiceRecording(id: string): Promise<Buffer | null> {
    try {
      const recording = await this.findRecordingById(id);
      if (!recording) {
        return null;
      }

      const buffer = await fs.readFile(recording.filePath);
      return buffer;
    } catch (error) {
      console.error('Error reading voice recording:', error);
      return null;
    }
  }

  async deleteVoiceRecording(id: string): Promise<boolean> {
    try {
      const recording = await this.findRecordingById(id);
      if (!recording) {
        return false;
      }

      await fs.unlink(recording.filePath);
      return true;
    } catch (error) {
      console.error('Error deleting voice recording:', error);
      return false;
    }
  }

  getVoiceRecordingUrl(id: string): string {
    return `/api/voice/${id}`;
  }

  private async findRecordingById(id: string): Promise<VoiceRecording | null> {
    // In a real implementation, this would query a database
    // For now, we'll reconstruct the file path based on the ID
    try {
      const files = await fs.readdir(this.uploadsDir);
      const matchingFile = files.find(file => file.startsWith(id));
      
      if (!matchingFile) {
        return null;
      }

      const filePath = path.join(this.uploadsDir, matchingFile);
      const stats = await fs.stat(filePath);

      // Extract userId from filename pattern
      const userIdMatch = id.match(/voice_(\d+)_/);
      const userId = userIdMatch ? parseInt(userIdMatch[1]) : 0;

      return {
        id,
        userId,
        filename: matchingFile,
        filePath,
        duration: 0,
        createdAt: stats.birthtime,
        type: 'emergency', // Default type, would be stored in DB in real implementation
      };
    } catch (error) {
      console.error('Error finding recording:', error);
      return null;
    }
  }

  async cleanupOldRecordings(maxAgeHours = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.birthtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old voice recording: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old recordings:', error);
    }
  }
}

export const voiceService = new VoiceService();