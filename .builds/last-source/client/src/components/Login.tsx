import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from '@/components/translation-provider';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('=== Iniciando proceso de autenticación ===');
      console.log('Credencial recibida:', credentialResponse);
      console.log('URL de la API:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      console.log('=== Respuesta del servidor ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      // Verificar el tipo de contenido
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no-JSON recibida:', text);
        throw new Error('Respuesta inválida del servidor');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        console.error('Error en la respuesta:', data);
        throw new Error(data.message || 'Error en la autenticación');
      }

      // Guardar el token y los datos del usuario
      if (data.token) {
        console.log('Token recibido, guardando en localStorage...');
        localStorage.setItem('token', data.token);
        if (data.user) {
          console.log('Datos de usuario recibidos:', data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        console.log('Redirigiendo al dashboard...');
        navigate('/dashboard', { replace: true });
      } else {
        console.error('No se recibió token en la respuesta');
        throw new Error('No se recibió el token de autenticación');
      }
    } catch (error) {
      console.error('=== Error en el proceso de autenticación ===');
      console.error('Error detallado:', error);
      alert(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleGoogleError = () => {
    console.error('=== Error de Google ===');
    alert(t('login.error'));
  };

  if (!clientId) {
    console.error('Google Client ID no está configurado');
    return <div>Error de configuración: Google Client ID no encontrado</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('login.title')}
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 