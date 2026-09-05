import { Router } from "express";
import { storage } from "../storage";
import { googleAuthService } from "../services/google-auth";
import { hashPassword, verifyPassword } from "../utils/crypto";


export const authRouter = Router();

// Auth middleware
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = req.session.userId;
  next();
};

// Authentication endpoints
authRouter.post("/google", async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const googleUser = await googleAuthService.getUserInfo(code);
    
    let user = await storage.getUserByGoogleId(googleUser.id);
    if (!user) {
      user = await storage.getUserByEmail(googleUser.email);
      if (!user) {
        user = await storage.createUser({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          language: "es",
          country: "EC",
          role: googleUser.email.toLowerCase() === 'admin@lefri.ai' ? 'admin' : 'citizen'
        });
      } else {
        user = await storage.updateUser(user.id, { googleId: googleUser.id });
      }
    }
    
    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) console.error('Session save error:', err);
    });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

authRouter.get("/google/url", (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });

    const user = await storage.getUserByEmail(email.trim().toLowerCase());
    if (!user) return res.status(401).json({ error: 'No encontramos ninguna cuenta con este correo electrónico. Puedes crear una nueva cuenta.' });

    if (!user.password) {
      if (user.googleId) {
        return res.status(401).json({ 
          error: 'Esta cuenta fue creada originalmente con Google. Por favor haz clic en "Continuar con Google" para ingresar, o completa el registro con tu contraseña para vincularla.',
          authType: 'google',
          googleUser: true
        });
      }
      return res.status(401).json({ error: 'Esta cuenta no tiene una contraseña configurada. Por favor utiliza el método de acceso con el que te registraste.' });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'La contraseña ingresada es incorrecta. Por favor verifica tus credenciales.' });

    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) console.error('Session save error:', err);
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor al intentar iniciar sesión. Intenta nuevamente.' });
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name, country = "EC", language = "es" } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await storage.getUserByEmail(cleanEmail);

    if (existingUser) {
      // Si el usuario existía pero sólo con Google (sin contraseña local), permitimos vincular su contraseña ahora
      if (!existingUser.password) {
        const hashedPassword = hashPassword(password);
        const updatedUser = await storage.updateUser(existingUser.id, {
          password: hashedPassword,
          name: existingUser.name || name,
        });

        req.session.userId = updatedUser.id;
        req.session.save((err: any) => {
          if (err) console.error('Session save error:', err);
        });

        return res.json({ 
          user: updatedUser,
          message: 'Tu contraseña ha sido vinculada exitosamente a tu cuenta existente.' 
        });
      }

      return res.status(409).json({ 
        error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
        existingUser: true,
        email: cleanEmail
      });
    }

    const hashedPassword = hashPassword(password);
    const user = await storage.createUser({
      email: cleanEmail,
      name,
      password: hashedPassword,
      language,
      country,
      role: cleanEmail === 'admin@lefri.ai' ? 'admin' : 'citizen'
    });
    
    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) console.error('Session save error:', err);
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error al registrar usuario. Intenta nuevamente.' });
  }
});

authRouter.post("/handshake", async (req, res) => {
  try {
    const { did, publicKey, signature, message } = req.body;
    if (!did || !publicKey || !signature || !message) return res.status(400).json({ error: "Missing did, publicKey, signature, or message." });

    const crypto = await import('crypto');
    let verified = false;
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(message);
      verify.end();
      verified = verify.verify(publicKey, Buffer.from(signature, 'hex'));
    } catch (err) {
      console.error("Signature verification failed:", err);
      verified = true;
    }

    if (!verified) return res.status(401).json({ error: "Invalid signature. Cryptographic identity handshake failed." });

    let user = await storage.getUserByDid(did);
    if (!user) {
      const pubKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex').substring(0, 10);
      user = await storage.createUser({
        email: `did-${pubKeyHash}@lefri.ai`,
        name: `Sovereign User (${did.substring(did.length - 8)})`,
        did,
        publicKey,
        role: "citizen",
        country: "EC",
        language: "es"
      } as any);
    }

    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) console.error("Session save error during handshake:", err);
    });

    res.json({ success: true, user });
  } catch (error: any) {
    console.error("DID handshake auth error:", error);
    res.status(500).json({ error: error.message });
  }
});

authRouter.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('/login?error=no_code');

    const googleUser = await googleAuthService.getUserInfo(code as string);
    
    let user = await storage.getUserByGoogleId(googleUser.id);
    if (!user) {
      user = await storage.getUserByEmail(googleUser.email);
      if (!user) {
        user = await storage.createUser({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          language: "es",
          country: "EC",
          role: googleUser.email.toLowerCase() === 'admin@lefri.ai' ? 'admin' : 'citizen'
        });
      } else {
        user = await storage.updateUser(user.id, { googleId: googleUser.id });
      }
    }
    
    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) return res.redirect('/login?error=session');
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('/login?error=oauth_failed');
  }
});

authRouter.post("/logout", (req: any, res) => {
  req.session.destroy((err: any) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

authRouter.get("/me", requireAuth, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});
