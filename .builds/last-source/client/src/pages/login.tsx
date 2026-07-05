import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Scale, Mail, Lock, User, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, setLoading, isLoading } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      // Get Google OAuth URL
      const urlResponse = await api.getGoogleAuthUrl();
      const { authUrl } = await urlResponse.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google authentication failed:', error);
      toast({
        title: "Error",
        description: "Error al iniciar sesión con Google. Intenta nuevamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.login(loginForm);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      login(data.user);
      setLocation('/dashboard');
      
      toast({
        title: t.welcomeUser,
        description: t.loginSuccess,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: t.error,
        description: error.message || t.invalidCredentials,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: t.error,
        description: t.passwordsDontMatch,
        variant: "destructive",
      });
      return;
    }
    
    if (registerForm.password.length < 6) {
      toast({
        title: t.error,
        description: t.passwordTooShort,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        country: "EC",
        language: "es"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      login(data.user);
      setLocation('/dashboard');
      
      toast({
        title: t.accountCreated,
        description: t.accountCreatedSuccess,
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: t.error,
        description: error.message || t.registrationFailed,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-32 bg-white border-gray-300">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="en" className="hover:bg-gray-50">English</SelectItem>
            <SelectItem value="es" className="hover:bg-gray-50">Español</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="w-full max-w-md shadow-lg bg-white border-gray-200">
        <CardHeader className="text-center bg-white">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">LeFriAI</CardTitle>
          <p className="text-gray-600">{t.welcomeSubtitle}</p>
        </CardHeader>
        
        <CardContent className="p-6 bg-white">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="login" className="bg-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">{t.signIn}</TabsTrigger>
              <TabsTrigger value="register" className="bg-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">{t.signUp}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 bg-white">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@email.com"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700">{t.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
                  {isLoading ? t.signingIn : t.signIn}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 bg-white">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-700">{t.fullName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Your name"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-700">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@email.com"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-700">{t.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-gray-700">{t.confirmPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
                  {isLoading ? t.creatingAccount : t.createAccount}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">{t.orContinueWith}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full mt-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3"
              variant="outline"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="mr-3">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.continueWithGoogle}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              {t.byCreating}{' '}
              <a href="#" className="text-blue-500 hover:underline">{t.termsOfService}</a>{' '}
              {t.and}{' '}
              <a href="#" className="text-blue-500 hover:underline">{t.privacyPolicy}</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
