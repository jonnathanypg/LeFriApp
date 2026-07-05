import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => void;
  }
}

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id',
        callback: handleCredentialResponse,
      });
      setIsInitialized(true);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    try {
      // Decode JWT token to get user info
      const userInfo = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser: GoogleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
      };

      // Send to backend for authentication
      const authResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
        }),
      });

      if (authResponse.ok) {
        const { user, token } = await authResponse.json();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/dashboard';
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    if (window.google && isInitialized) {
      window.google.accounts.id.prompt();
    }
  };

  const renderSignInButton = (element: HTMLElement) => {
    if (window.google && isInitialized) {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: '100%',
      });
    }
  };

  return {
    signIn,
    renderSignInButton,
    isLoading,
    isInitialized,
  };
}