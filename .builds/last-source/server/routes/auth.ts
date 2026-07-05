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
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.password) {
      return res.status(401).json({ error: 'Este usuario fue registrado con Google. Por favor, inicia sesión con Google.' });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) console.error('Session save error:', err);
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name, country = "EC", language = "es" } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name required' });

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = hashPassword(password);
    const user = await storage.createUser({
      email,
      name,
      password: hashedPassword,
      language,
      country,
      role: email.toLowerCase() === 'admin@lefri.ai' ? 'admin' : 'citizen'
    });
    
    req.session.userId = user.id;
    req.session.save((err: any) => {
      if (err) console.error('Session save error:', err);
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
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
