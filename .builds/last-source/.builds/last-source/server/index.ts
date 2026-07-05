/**
 * server/index.ts — Main application entry point
 *
 * This server runs both the LeFriApp REST API and the integrated
 * WhatsApp session manager (Baileys) in a single Node.js process.
 * This is the architecture required by Hostinger Business Hosting,
 * which supports only one Node.js application per project.
 *
 * Architecture overview:
 * - Express HTTP server on process.env.PORT (default 8080)
 * - WhatsApp sessions managed in-memory via WhatsAppManager (server/whatsapp/)
 * - MongoDB connection for WhatsApp session persistence
 * - MySQL (Prisma) for all application data
 */

import express, { type Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WhatsAppManager } from "./whatsapp/whatsapp-manager";

// ──────────────────────────────────────────────────────────────────────────────
// Environment variable validation
// ──────────────────────────────────────────────────────────────────────────────
const requiredEnvVars = ["DATABASE_URL", "OPENAI_API_KEY"];
const optionalEnvVars = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REDIRECT_URI",
  "MONGODB_URI",
];

const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Faltan las siguientes variables de entorno requeridas: ${missingEnvVars.join(", ")}`
  );
}

const missingOptional = optionalEnvVars.filter((v) => !process.env[v]);
if (missingOptional.length > 0) {
  console.warn(
    `[WARN] Variables de entorno opcionales no configuradas: ${missingOptional.join(", ")}.`
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Express app setup
// ──────────────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ──────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ──────────────────────────────────────────────────────────────────────────────
(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handling middleware (must be registered after routes)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`);
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 8080;
    server.listen({ port, host: "0.0.0.0" }, async () => {
      log(`Servidor iniciado en el puerto ${port}`);

      // ──────────────────────────────────────────────────────────────────────
      // Initialize MongoDB for WhatsApp session persistence (optional)
      // ──────────────────────────────────────────────────────────────────────
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri) {
        mongoose
          .connect(mongoUri)
          .then(async () => {
            log("MongoDB connected — iniciando sesiones de WhatsApp guardadas...");
            await WhatsAppManager.autoStartAll();
          })
          .catch((err) => {
            log(`[WARN] No se pudo conectar a MongoDB: ${err.message}. Las sesiones de WhatsApp no se restaurarán automáticamente.`);
          });
      } else {
        log("[WARN] MONGODB_URI no configurado. Las sesiones de WhatsApp no se persistirán entre reinicios.");
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      log("Recibida señal SIGTERM, cerrando servidor...");
      server.close(() => {
        log("Servidor cerrado");
        mongoose.disconnect().catch(() => {});
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      log("Recibida señal SIGINT, cerrando servidor...");
      server.close(() => {
        mongoose.disconnect().catch(() => {});
        process.exit(0);
      });
    });
  } catch (error) {
    log(`Error al iniciar el servidor: ${error}`);
    process.exit(1);
  }
})();
