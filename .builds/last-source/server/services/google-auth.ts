/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Currently, users authenticate using standard central OAuth 2.0 flows (Google).
 * To migrate to a decentralized P2P identity:
 * 1. Centralized third-party authentication is completely eliminated.
 * 2. Authentication will run client-side by presenting cryptographically signed proofs
 *    using decentralized identifiers (DIDs) or blockchain wallets (e.g. MetaMask, WalletConnect).
 */

import { google } from 'googleapis';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  locale?: string;
}

export class GoogleAuthService {
  private oauth2Client: any = null;

  constructor() {
    this.initializeOAuth();
  }

  private initializeOAuth() {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.warn('[GoogleAuthService] Google OAuth credentials not configured. Google login will be disabled.');
      return;
    }

    try {
      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );
      console.log('Google OAuth configured successfully');
    } catch (err) {
      console.error('[GoogleAuthService] Error initializing OAuth client:', err);
    }
  }


  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    });
  }

  async getUserInfo(code: string): Promise<GoogleUserInfo> {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2'
      });

      const { data } = await oauth2.userinfo.get();

      return {
        id: data.id!,
        email: data.email!,
        name: data.name!,
        picture: data.picture || undefined,
        locale: data.locale || undefined
      };
    } catch (error) {
      console.error('Error getting user info from Google:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  isConfigured(): boolean {
    return !!this.oauth2Client;
  }
}

export const googleAuthService = new GoogleAuthService();