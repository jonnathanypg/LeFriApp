import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface ProcessSummary {
  id: string;
  _id?: string;
  title: string;
  type: string;
  description: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  metadata: {
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
  };
}

interface CreateProcessForm {
  title: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

export function ProcessList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<CreateProcessForm>({
    title: '',
    type: '',
    description: '',
    priority: 'medium'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const translations = useTranslations(language);

  const { data: processes = [], isLoading } = useQuery<ProcessSummary[]>({
    queryKey: ['/api/processes'],
  });

  const createProcessMutation = useMutation({
    mutationFn: async (data: CreateProcessForm) => {
      const response = await fetch('/api/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error creating process');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/processes'] });
      setShowCreateDialog(false);
      setFormData({ title: '', type: '', description: '', priority: 'medium' });
      toast({ title: 'Proceso creado exitosamente' });
    },
    onError: () => {
      toast({ title: 'Error al crear proceso', variant: 'destructive' });
    }
  });

  const processTypes = [
    { value: 'civil', label: translations.processTypes.civil },
    { value: 'penal', label: translations.processTypes.penal },
    { value: 'laboral', label: translations.processTypes.laboral },
    { value: 'administrativo', label: translations.processTypes.administrativo },
    { value: 'familia', label: translations.processTypes.familia },
    { value: 'comercial', label: translations.processTypes.comercial },
    { value: 'constitucional', label: translations.processTypes.constitucional },
    { value: 'otros', label: translations.processTypes.otros }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: translations.processStatus.completed,
      in_progress: translations.processStatus.inProgress,
      pending: translations.processStatus.pending
    };
    return statusMap[status as keyof typeof statusMap] || translations.processStatus.pending;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityText = (priority: string) => {
    const priorityMap = {
      high: translations.processPriorities.high,
      medium: translations.processPriorities.medium,
      low: translations.processPriorities.low
    };
    return priorityMap[priority as keyof typeof priorityMap] || translations.processPriorities.medium;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProcessMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>{translations.processLoading}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-neutral-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{translations.myProcesses}</h1>
            <p className="text-sm text-neutral-500">
              {translations.processDescription}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {translations.createProcess}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{translations.createProcess}</DialogTitle>
                <DialogDescription>
                  {translations.processDescription}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">{translations.processTitle}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={translations.processTitle}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">{translations.processType}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={translations.processType} />
                    </SelectTrigger>
                    <SelectContent>
                      {processTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">{translations.processDescription}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={translations.processDescription}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">{translations.priority}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{translations.processPriorities.low}</SelectItem>
                      <SelectItem value="medium">{translations.processPriorities.medium}</SelectItem>
                      <SelectItem value="high">{translations.processPriorities.high}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">{translations.processDeadline}</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createProcessMutation.isPending}
                    className="flex-1"
                  >
                    {createProcessMutation.isPending ? translations.processLoading : translations.createProcess}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    {translations.cancel}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {processes.length > 0 ? (
            processes.map((process) => (
              <Card key={process.id || process._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{process.title}</h3>
                        <Badge variant={getStatusColor(process.status)}>
                          {getStatusText(process.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-500">{process.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={getPriorityColor(process.metadata?.priority)}>
                          {getPriorityText(process.metadata?.priority)}
                        </Badge>
                        <span className="text-sm text-neutral-500">
                          {translations.processCreatedOn} {new Date(process.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                        </span>
                      </div>
                    </div>
                    <Link href={`/processes/${process.id || process._id}`}>
                      <Button variant="outline" size="sm">
                        {translations.processDetails.viewDetails}
                      </Button>
                    </Link>
                  </div>
                  <Progress 
                    value={process.progress} 
                    className="mt-4 h-2" 
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-1">{translations.noProcesses}</h3>
              <p className="text-neutral-500 mb-4">{translations.processDescription}</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                {translations.createProcess}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}