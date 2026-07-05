/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Lead matching is currently orchestrated centrally using database lookups and queries.
 * In a P2P decentralized state:
 * 1. Matchmaking will be handled via peer-to-peer advertising networks.
 * 2. Citizens will sign request-for-representation credentials and broadcast them to lawyer nodes listening on pubsub topics.
 * 3. Negotiations, assignments, and ProBono tracking will occur via smart contracts on a blockchain.
 */

import { prisma, executeWithRetry } from "../prisma-client";

export interface MatchmakerResult {
  success: boolean;
  lawFirm?: any; // For backwards compatibility or primary firm
  lawyer?: any; // Primary lawyer
  lawyers?: any[]; // The 3 selected lawyers
  lawFirms?: any[]; // The 3 selected firms
  leadId?: string; // Primary lead
  leadIds?: string[]; // All created leads
  message?: string;
}

export class MatchmakerService {
  /**
   * Matches a citizen with a lawyer/law firm nearby based on requirements.
   * Creates a lead for the selected lawyer using Prisma (MySQL).
   */
  async matchAndAssignLead(params: {
    citizenId?: string;
    citizenName: string;
    citizenPhone?: string;
    citizenEmail?: string;
    country: string;
    querySummary: string;
    isProBono: boolean;
    specialty?: string;
  }): Promise<MatchmakerResult> {
    try {
      const { citizenId, citizenName, citizenPhone, citizenEmail, country, querySummary, isProBono, specialty = 'general' } = params;

      // 1. Find lawyers in the same country with their associated law firms
      const lawyers = await executeWithRetry(() =>
        prisma.user.findMany({
          where: {
            role: "lawyer",
            country: country
          },
          include: {
            lawFirm: true
          }
        })
      );

      if (lawyers.length === 0) {
        return {
          success: false,
          message: `No se encontraron abogados disponibles en tu país (${country}).`
        };
      }

      let selectedLawyers: any[] = [];
      let selectedFirms: any[] = [];

      if (isProBono) {
        // Look for lawyers whose firms have remaining ProBono quota
        const probonoLawyers = lawyers.filter((lawyer: any) => {
          const firm = lawyer.lawFirm;
          return firm && firm.proBonoUsed < firm.proBonoLimit;
        });

        if (probonoLawyers.length > 0) {
          probonoLawyers.sort((a: any, b: any) => {
            const firmA = a.lawFirm;
            const firmB = b.lawFirm;
            if (firmB.notorietyScore !== firmA.notorietyScore) {
              return firmB.notorietyScore - firmA.notorietyScore;
            }
            const remainingA = firmA.proBonoLimit - firmA.proBonoUsed;
            const remainingB = firmB.proBonoLimit - firmB.proBonoUsed;
            return remainingB - remainingA;
          });

          selectedLawyers = probonoLawyers.slice(0, 3);
          selectedFirms = selectedLawyers.map((l: any) => l.lawFirm);
        }
      }

      // If ProBono not requested, or no ProBono slots left, fallback to general match
      if (selectedLawyers.length === 0) {
        lawyers.sort((a: any, b: any) => {
          const scoreA = (a.lawFirm as any)?.notorietyScore || 0;
          const scoreB = (b.lawFirm as any)?.notorietyScore || 0;
          return scoreB - scoreA;
        });
        selectedLawyers = lawyers.slice(0, 3);
        selectedFirms = selectedLawyers.map((l: any) => l.lawFirm);
      }

      if (selectedFirms.length === 0) {
        return {
          success: false,
          message: "No hay bufetes activos configurados para los abogados de esta región."
        };
      }

      // 2. Create lead in CRM for the selected firms using Prisma
      const leadIds: string[] = [];
      for (let i = 0; i < selectedFirms.length; i++) {
        const selectedFirm = selectedFirms[i];
        const newLead = await executeWithRetry(() =>
          prisma.lead.create({
            data: {
              lawFirmId: selectedFirm.id,
              citizenId: citizenId || null,
              name: citizenName,
              phone: citizenPhone || null,
              email: citizenEmail || null,
              summary: querySummary,
              status: "new",
              isProBono: isProBono,
              source: citizenPhone ? "whatsapp" : "platform"
            }
          })
        );

        leadIds.push(newLead.id.toString());

        // 3. If ProBono, increment the count and reward notoriety score
        if (isProBono) {
          await executeWithRetry(() =>
            prisma.lawFirm.update({
              where: { id: selectedFirm.id },
              data: {
                proBonoUsed: { increment: 1 },
                notorietyScore: { increment: 10 }
              }
            })
          );
        }
      }

      return {
        success: true,
        lawFirm: selectedFirms[0],
        lawyer: selectedLawyers[0],
        lawyers: selectedLawyers,
        lawFirms: selectedFirms,
        leadId: leadIds[0],
        leadIds: leadIds
      };
    } catch (error: any) {
      console.error("Matchmaker assignment error:", error);
      return {
        success: false,
        message: `Error al conectar con abogados: ${error.message}`
      };
    }
  }
}

export const matchmakerService = new MatchmakerService();
