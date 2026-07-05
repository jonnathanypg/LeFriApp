/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Currently, data is encrypted on the server utilizing an environment key (DB_ENCRYPTION_KEY).
 * To migrate to a decentralized P2P state (e.g., OrbitDB, GunDB, Ceramic):
 * 1. Encryption and decryption keys must be generated and managed client-side (e.g., using WebAuthn, hardware wallets, or BIP-39 mnemonics).
 * 2. Sensitive fields will be encrypted in the client browser before publishing transactions or database states to the network.
 * 3. Decentralized nodes will index only public non-sensitive metadata, keeping the private payload unreadable to unauthorized peers.
 */

import crypto from 'crypto';

// 32-byte encryption key for AES-256-GCM
// Fallback key is 32 characters (32 bytes under ASCII)
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'a3f9e8c7b6d5e4f3a2b1c0d9e8f7a6b5';
const IV_LENGTH = 12; // GCM standard IV length
const AUTH_TAG_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Store as iv:ciphertext:tag
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText; // Not a valid cipher block format
    
    const [ivHex, encryptedHex, authTagHex] = parts;
    if (!ivHex || !encryptedHex || !authTagHex) return encryptedText;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, it might be plain text from before the migration
    // Return the original text and log the warning
    console.warn('Decryption failed, returning input (might be plain text):', error);
    return encryptedText;
  }
}

export function hashPassword(password: string): string {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = crypto.scryptSync(password, salt, 64) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  if (!password || !hashed || !hashed.includes('.')) return false;
  const [key, salt] = hashed.split('.');
  if (!key || !salt) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const matchBuffer = crypto.scryptSync(password, salt, 64) as Buffer;
  return crypto.timingSafeEqual(keyBuffer, matchBuffer);
}
