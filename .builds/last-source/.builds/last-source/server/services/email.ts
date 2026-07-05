/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Notifications are sent using centralized SMTP (e.g. Gmail SMTP server).
 * In a P2P decentralized state:
 * 1. Notifications will be replaced by decentralized, encrypted mail systems (e.g. DMail, EtherMail)
 *    or direct message pushes over P2P decentralized messaging protocols.
 */

import nodemailer from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendEmergencyEmail(params: {
    to: string;
    userName: string;
    message: string;
    location?: { latitude: number; longitude: number; address?: string };
    voiceNoteAttachment?: { filename: string; content: Buffer };
  }): Promise<EmailResponse> {
    const { to, userName, message, location, voiceNoteAttachment } = params;
    
    let htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
          <div style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h1 style="color: #dc2626; margin: 0 0 10px 0;">🚨 ALERTA DE EMERGENCIA</h1>
            <p style="color: #991b1b; font-size: 16px; margin: 0;">
              <strong>${userName}</strong> ha activado una alerta de emergencia.
            </p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin: 0 0 15px 0;">Mensaje:</h2>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              ${message}
            </p>
          </div>
    `;

    if (location) {
      const mapsUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
      htmlContent += `
          <div style="background-color: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin: 0 0 15px 0;">📍 Ubicación:</h2>
            <p style="color: #047857; margin: 0 0 10px 0;">
              ${location.address || `Coordenadas: ${location.latitude}, ${location.longitude}`}
            </p>
            <a href="${mapsUrl}" 
               style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver en Google Maps
            </a>
          </div>
      `;
    }

    htmlContent += `
          <div style="color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p>Esta es una alerta automática enviada por LeFriAI.</p>
            <p>Fecha y hora: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Guayaquil' })}</p>
          </div>
        </body>
      </html>
    `;

    const emailData: EmailMessage = {
      to,
      subject: `🚨 EMERGENCIA: ${userName} necesita ayuda inmediata`,
      html: htmlContent,
      text: `ALERTA DE EMERGENCIA\n\n${userName} ha activado una alerta de emergencia.\n\nMensaje: ${message}\n\n${location ? `Ubicación: ${location.address || `${location.latitude}, ${location.longitude}`}\nGoogle Maps: https://maps.google.com/maps?q=${location.latitude},${location.longitude}` : ''}\n\nFecha y hora: ${new Date().toLocaleString('es-ES')}`,
    };

    if (voiceNoteAttachment) {
      emailData.attachments = [
        {
          filename: voiceNoteAttachment.filename,
          content: voiceNoteAttachment.content,
          contentType: 'audio/mpeg',
        },
      ];
    }

    return this.sendEmail(emailData);
  }

  async sendProcessNotification(params: {
    to: string;
    userName: string;
    processType: string;
    currentStep: number;
    totalSteps: number;
    nextStepTitle: string;
  }): Promise<EmailResponse> {
    const { to, userName, processType, currentStep, totalSteps, nextStepTitle } = params;
    
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h1 style="color: #1d4ed8; margin: 0 0 10px 0;">📋 Actualización de Proceso Legal</h1>
            <p style="color: #1e40af; font-size: 16px; margin: 0;">
              Hola <strong>${userName}</strong>, tu proceso legal ha sido actualizado.
            </p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #374151; margin: 0 0 15px 0;">Detalles del Proceso:</h2>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li><strong>Tipo:</strong> ${processType}</li>
              <li><strong>Paso actual:</strong> ${currentStep + 1} de ${totalSteps}</li>
              <li><strong>Siguiente paso:</strong> ${nextStepTitle}</li>
            </ul>
            
            <div style="margin-top: 20px;">
              <a href="${process.env.APP_URL || 'http://localhost:5000'}/proceso" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Continuar Proceso
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Actualización: ${processType} - Paso ${currentStep + 1}`,
      html: htmlContent,
      text: `Actualización de Proceso Legal\n\nHola ${userName},\n\nTu proceso "${processType}" ha sido actualizado.\nPaso actual: ${currentStep + 1} de ${totalSteps}\nSiguiente paso: ${nextStepTitle}\n\nAccede a LeFriAI para continuar.`,
    });
  }

  isConfigured(): boolean {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  }
}

export const emailService = new EmailService();