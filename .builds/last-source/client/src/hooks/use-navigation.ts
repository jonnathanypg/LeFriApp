import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

export function useNavigation() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const navigate = async (path: string) => {
    try {
      // Invalidar queries relacionadas con la página actual
      queryClient.invalidateQueries({ queryKey: ['page-data'] });
      
      // Navegar a la nueva ruta
      setLocation(path);
      
      // Scroll al inicio de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error en la navegación:', error);
    }
  };

  return { navigate };
} 