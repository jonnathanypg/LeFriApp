import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, HeartCrack, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { ProcessModal } from '@/components/process-modal';
import { api } from '@/lib/api';
import { useLocation } from 'wouter';

export default function Proceso() {
  const [, setLocation] = useLocation();
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: activeProcesses } = useQuery({
    queryKey: ['/api/processes'],
    queryFn: async () => {
      const response = await api.getProcesses();
      return await response.json();
    },
  });

  const processTypes = [
    {
      id: 'divorcio',
      title: 'Proceso de Divorcio',
      description: 'Guía completa para el proceso de divorcio, documentos necesarios y pasos a seguir.',
      icon: HeartCrack,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      steps: 8,
    },
    {
      id: 'contrato',
      title: 'Redacción de Contratos',
      description: 'Crea contratos legalmente válidos con asistencia paso a paso.',
      icon: FileText,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      steps: 6,
    },
    {
      id: 'laboral',
      title: 'Demanda Laboral',
      description: 'Proceso para presentar demandas por conflictos laborales.',
      icon: Briefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      steps: 10,
    },
  ];

  const handleStartProcess = (processType: string) => {
    setSelectedProcess(processType);
    setIsModalOpen(true);
  };

  const getProcessTitle = (type: string) => {
    switch (type) {
      case 'divorcio': return 'Proceso de Divorcio';
      case 'contrato': return 'Redacción de Contrato';
      case 'laboral': return 'Demanda Laboral';
      default: return 'Proceso Legal';
    }
  };

  const getProcessIcon = (type: string) => {
    switch (type) {
      case 'divorcio': return HeartCrack;
      case 'contrato': return FileText;
      case 'laboral': return Briefcase;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="p-2 hover:bg-neutral-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">Procesos Legales</h1>
          </div>

          {/* Process Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processTypes.map((process) => (
              <Card 
                key={process.id}
                className="card-hover cursor-pointer border border-neutral-200"
                onClick={() => handleStartProcess(process.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${process.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <process.icon className={`${process.iconColor} w-6 h-6`} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {process.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 leading-relaxed">
                    {process.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      {process.steps} pasos
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Processes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Procesos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProcesses?.length > 0 ? (
                  activeProcesses.map((process: any) => {
                    const ProcessIcon = getProcessIcon(process.processType);
                    const progress = ((process.currentStep + 1) / 8) * 100; // Assuming 8 steps max
                    
                    return (
                      <div key={process.id} className="border border-neutral-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <ProcessIcon className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-neutral-900">
                                {getProcessTitle(process.processType)}
                              </h4>
                              <p className="text-xs text-neutral-500">
                                Iniciado el {new Date(process.startDate).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="text-blue-500 hover:text-blue-600"
                            variant="link"
                            onClick={() => handleStartProcess(process.processType)}
                          >
                            Continuar
                          </Button>
                        </div>
                        
                        <Progress value={progress} className="h-2 mb-2" />
                        
                        <p className="text-xs text-neutral-600">
                          Paso {process.currentStep + 1} de 8: 
                          {process.status === 'in_progress' && ' En progreso'}
                          {process.status === 'completed' && ' Completado'}
                          {process.status === 'pending_review' && ' Pendiente de revisión'}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tienes procesos activos</p>
                    <p className="text-xs">Selecciona un tipo de proceso arriba para comenzar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Process Modal */}
      <ProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        processType={selectedProcess}
      />
    </div>
  );
}
