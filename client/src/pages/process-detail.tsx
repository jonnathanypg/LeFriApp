import { useParams } from 'wouter';
import { ProcessDetail } from '@/components/process-detail';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Navbar } from '@/components/navbar';

export function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: user } = useQuery<{ country?: string }>({
    queryKey: ['/api/user'],
  });

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-500" />
              <p>ID de proceso no válido</p>
              <Link href="/processes">
                <Button variant="outline" className="mt-4 border-slate-700 text-slate-200 hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Procesos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
            <Link href="/processes">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-orange-300 bg-clip-text text-transparent">Detalle del Proceso</h1>
          </div>
          
          <ProcessDetail 
            processId={id} 
            country={(user as any)?.country || 'Colombia'} 
          />
        </div>
      </main>
    </div>
  );
}