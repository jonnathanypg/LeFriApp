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
  private userTokensMap = new Map<string, any>();

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

  createClientForTokens(tokens: any) {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    client.setCredentials(tokens);
    return client;
  }

  getAuthUrl(options?: { state?: string; includeDrive?: boolean }): string {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    if (options?.includeDrive !== false) {
      scopes.push('https://www.googleapis.com/auth/drive.file');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
      state: options?.state
    });
  }

  getDriveAuthUrl(options?: { returnTo?: string; state?: any }): string {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    const statePayload = JSON.stringify({
      action: 'drive_export',
      returnTo: options?.returnTo || '/documentos?google_connected=true',
      ...(options?.state || {})
    });
    const encodedState = Buffer.from(statePayload).toString('base64');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/drive.file'
      ],
      prompt: 'consent',
      include_granted_scopes: true,
      state: encodedState
    });
  }

  async getUserInfoAndTokens(code: string): Promise<{ userInfo: GoogleUserInfo; tokens: any }> {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      const userAuthClient = this.createClientForTokens(tokens);

      const oauth2 = google.oauth2({
        auth: userAuthClient,
        version: 'v2'
      });

      const { data } = await oauth2.userinfo.get();

      return {
        userInfo: {
          id: data.id!,
          email: data.email!,
          name: data.name!,
          picture: data.picture || undefined,
          locale: data.locale || undefined
        },
        tokens
      };
    } catch (error) {
      console.error('Error getting user info and tokens from Google:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  async getUserInfo(code: string): Promise<GoogleUserInfo> {
    const result = await this.getUserInfoAndTokens(code);
    return result.userInfo;
  }

  saveUserTokens(userId: string, tokens: any): void {
    if (userId && tokens) {
      this.userTokensMap.set(userId, tokens);
    }
  }

  getUserTokens(userId: string): any {
    return this.userTokensMap.get(userId);
  }

  deleteUserTokens(userId: string): void {
    this.userTokensMap.delete(userId);
  }

  hasUserTokens(userId: string): boolean {
    return this.userTokensMap.has(userId);
  }

  /**
   * Creates a native Google Document inside the user's Google Drive with full rich legal formatting (Headings, Bold, Lists, Indents)
   */
  async createGoogleDoc(tokens: any, title: string, content: string): Promise<{ documentId: string; url: string }> {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth no está configurado en el servidor.');
    }

    const authClient = this.createClientForTokens(tokens);
    authClient.on('tokens', (newTokens: any) => {
      Object.assign(tokens, newTokens);
    });

    const docTitle = title || 'Documento Legal - LeFriApp';

    // 1. Primary Strategy: Import through Google Drive as HTML
    // This allows Google Drive to convert the document into a 100% native Google Doc with:
    // - Real Heading 1, 2, 3
    // - Real bold/italics
    // - Real bulleted and numbered lists
    // - No raw markdown characters (#, **, ---)
    try {
      const drive = google.drive({ version: 'v3', auth: authClient });
      const { Readable } = await import('stream');
      const { markdownToLegalHtml } = await import('./document-formatter');
      const htmlContent = markdownToLegalHtml(docTitle, content);

      const fileRes = await drive.files.create({
        requestBody: {
          name: docTitle,
          mimeType: 'application/vnd.google-apps.document'
        },
        media: {
          mimeType: 'text/html',
          body: Readable.from([htmlContent])
        },
        fields: 'id'
      });

      if (fileRes.data.id) {
        return {
          documentId: fileRes.data.id,
          url: `https://docs.google.com/document/d/${fileRes.data.id}/edit`
        };
      }
    } catch (driveErr) {
      console.warn('[GoogleAuthService] Drive HTML import failed, attempting Docs API fallback:', driveErr);
    }

    // 2. Secondary Fallback: Docs API with clean stripped text (no raw markdown hashes/asterisks)
    const docs = google.docs({ version: 'v1', auth: authClient });
    const createRes = await docs.documents.create({
      requestBody: {
        title: docTitle
      }
    });

    const documentId = createRes.data.documentId;
    if (!documentId) {
      throw new Error('Google Docs no devolvió un identificador de documento.');
    }

    const { stripMarkdownToPlainText } = await import('./document-formatter');
    const cleanContent = stripMarkdownToPlainText(content);
    if (cleanContent.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: cleanContent
              }
            }
          ]
        }
      });
    }

    return {
      documentId,
      url: `https://docs.google.com/document/d/${documentId}/edit`
    };
  }

  isConfigured(): boolean {
    return !!this.oauth2Client;
  }
}

export const googleAuthService = new GoogleAuthService();