import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { storage } from '../storage';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_OAUTH_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error('Las variables de entorno de Google OAuth son requeridas');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente por Google ID
        let user = await storage.getUserByGoogleId(profile.id);

        if (!user) {
          // Si no existe, buscar por email
          user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');

          if (user) {
            // Actualizar usuario existente con Google ID
            user = await storage.updateUser(user.id, {
              googleId: profile.id
            });
          } else {
            // Crear nuevo usuario
            user = await storage.createUser({
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName,
              googleId: profile.id,
              language: 'es',
              country: 'EC'
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport; 