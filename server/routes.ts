import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from 'express-session';
// @ts-ignore
import MySQLStoreFactory from 'express-mysql-session';
import { URL } from 'url';

import { authRouter } from "./routes/auth";
import { citizenRouter } from "./routes/citizen";
import { lawfirmRouter } from "./routes/lawfirm";
import { billingRouter } from "./routes/billing";
import { adminRouter } from "./routes/admin";
import { webhooksRouter } from "./routes/webhooks";

const MySQLStore = MySQLStoreFactory(session as any);

export async function registerRoutes(app: Express): Promise<Server> {
  const isProd = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET;
  if (isProd && !sessionSecret) throw new Error("SESSION_SECRET environment variable is required in production");

  const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root:@localhost:3306/lefri_ai');
  const sessionStore = new MySQLStore({
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    createDatabaseTable: true,
  });

  app.use(session({
    secret: sessionSecret || 'lefri-ai-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: isProd,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }));

  app.use("/api/auth", authRouter);
  app.use("/api/citizen", citizenRouter);
  app.use("/api/lawyer", lawfirmRouter);
  app.use("/api/lawfirm", lawfirmRouter); // Ensure lawfirm is also mapped if needed
  app.use("/api/billing", billingRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/webhooks", webhooksRouter);

  // Note: Webhooks, Processes and other endpoints have been omitted or refactored into controllers.
  // In a full implementation, they would be similarly separated into their respective routers.

  const httpServer = createServer(app);
  return httpServer;
}
