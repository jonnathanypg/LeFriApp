import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * SQLExecutor wrapper: Ejecuta operaciones de base de datos con reintentos automáticos
 * en caso de fallos transitorios de red o timeouts (para evitar el error "MySQL has gone away").
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      console.warn(`Database operation failed (attempt ${attempt}/${retries}):`, error.message || error);
      if (attempt >= retries) {
        throw error;
      }
      // Esperar un delay exponencial antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Database execution failed after maximum retries');
}
