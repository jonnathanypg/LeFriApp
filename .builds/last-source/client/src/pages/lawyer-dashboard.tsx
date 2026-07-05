import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navbar } from '@/components/navbar';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, Briefcase, Award, Shield, Phone, Globe, MessageSquare, 
  Upload, FileText, CheckCircle, Clock, Trash, DollarSign, PlusCircle, RefreshCw 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LawyerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Form states
  const [proBonoLimitInput, setProBonoLimitInput] = useState<number>(3);
  const [invoiceAmount, setInvoiceAmount] = useState<string>('');
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docName, setDocName] = useState<string>('');

  const [whatsappProvider, setWhatsappProvider] = useState<'baileys' | 'twilio' | 'meta'>('baileys');
  const [twilioConfig, setTwilioConfig] = useState({ accountSid: '', authToken: '', phoneNumber: '' });
  const [metaConfig, setMetaConfig] = useState({ accessToken: '', phoneNumberId: '', verifyToken: '' });

  const setProviderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.setWhatsAppProvider({
        provider: whatsappProvider,
        twilioConfig: whatsappProvider === 'twilio' ? twilioConfig : undefined,
        metaConfig: whatsappProvider === 'meta' ? metaConfig : undefined,
      });
      if (!response.ok) throw new Error("Failed to set provider");
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Proveedor actualizado", description: "La configuración de WhatsApp se ha guardado." });
      refetchWsStatus();
    }
  });

  // Fetch Dashboard Metrics
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['/api/lawyer/dashboard'],
    queryFn: async () => {
      const response = await api.getLawyerDashboard();
      if (!response.ok) throw new Error("Failed to load metrics");
      return await response.json();
    }
  });

  // Fetch CRM Leads
  const { data: leads, isLoading: isLeadsLoading } = useQuery({
    queryKey: ['/api/lawyer/leads'],
    queryFn: async () => {
      const response = await api.getLawyerLeads();
      if (!response.ok) throw new Error("Failed to load leads");
      return await response.json();
    }
  });

  // Fetch ERP Cases
  const { data: cases, isLoading: isCasesLoading } = useQuery({
    queryKey: ['/api/lawyer/cases'],
    queryFn: async () => {
      const response = await api.getLawyerCases();
      if (!response.ok) throw new Error("Failed to load cases");
      return await response.json();
    }
  });

  // Fetch WhatsApp Status
  const { data: wsStatus, refetch: refetchWsStatus } = useQuery({
    queryKey: ['/api/lawyer/whatsapp/status'],
    queryFn: async () => {
      const response = await api.getWhatsAppStatus();
      if (!response.ok) throw new Error("Failed to load WhatsApp status");
      return await response.json();
    },
    refetchInterval: 10000 // Poll every 10s
  });

  // Mutaciones
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.updateLeadStatus(id, status);
      if (!response.ok) throw new Error("Failed to update status");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/leads'] });
      toast({ title: "Lead actualizado", description: "El estado del prospecto ha sido actualizado con éxito." });
    }
  });

  const convertLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.convertLeadToCase(id);
      if (!response.ok) throw new Error("Failed to convert lead");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/dashboard'] });
      toast({ title: "Lead Convertido", description: "El prospecto se ha convertido en un expediente judicial activo." });
    }
  });

  const updateProBonoMutation = useMutation({
    mutationFn: async (limit: number) => {
      const response = await api.updateProBonoSettings({ proBonoLimit: limit });
      if (!response.ok) throw new Error("Failed to update ProBono limit");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/dashboard'] });
      toast({ title: "Configuración guardada", description: "Límite mensual de asesorías ProBono actualizado." });
    }
  });

  const addInvoiceMutation = useMutation({
    mutationFn: async ({ caseId, amount, dueDate }: { caseId: string; amount: number; dueDate?: string }) => {
      const response = await api.addCaseInvoice(caseId, { amount, dueDate });
      if (!response.ok) throw new Error("Failed to add invoice");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/cases'] });
      toast({ title: "Cobro generado", description: "Se ha añadido la nueva factura al expediente judicial." });
      setInvoiceAmount('');
      setInvoiceDueDate('');
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ caseId, invoiceId, status }: { caseId: string; invoiceId: string; status: string }) => {
      const response = await api.updateInvoiceStatus(caseId, invoiceId, status);
      if (!response.ok) throw new Error("Failed to update invoice");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/cases'] });
      toast({ title: "Factura actualizada", description: "El estado de pago ha sido guardado." });
    }
  });

  const disconnectWsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.disconnectWhatsApp();
      if (!response.ok) throw new Error("Failed to disconnect");
      return await response.json();
    },
    onSuccess: () => {
      refetchWsStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/dashboard'] });
      toast({ title: "WhatsApp desconectado", description: "La sesión ha sido cerrada correctamente." });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ plan, provider }: { plan: 'pro' | 'enterprise'; provider: 'dlocal' | 'paypal' }) => {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider })
      });
      if (!response.ok) throw new Error("Failed to start checkout");
      const data = await response.json();
      return data.checkoutUrl;
    },
    onSuccess: (checkoutUrl) => {
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Document upload simulation
  const handleUploadDocument = async (caseId: string) => {
    if (!uploadFile) return;
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', docName || uploadFile.name);

      const response = await fetch(`/api/lawyer/cases/${caseId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Failed to upload document");
      
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer/cases'] });
      toast({ title: "Documento digitalizado", description: "El archivo ha sido procesado mediante OCR legal." });
      setUploadFile(null);
      setDocName('');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getNotorietyBadge = (score: number) => {
    if (score >= 100) return { label: 'Platino', color: 'bg-indigo-600 text-white' };
    if (score >= 50) return { label: 'Oro', color: 'bg-yellow-500 text-neutral-900' };
    if (score >= 20) return { label: 'Plata', color: 'bg-slate-300 text-slate-800' };
    return { label: 'Bronce', color: 'bg-amber-600 text-white' };
  };

  const selectedCase = cases?.find((c: any) => c._id === selectedCaseId);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Lawyer Welcome */}
        <div className="bg-gradient-to-r from-neutral-800 via-neutral-950 to-indigo-950 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Bienvenido, {user?.name || "Abogado"}
            </h1>
            <p className="text-neutral-300 text-sm mt-1">
              Firma: <span className="font-semibold text-indigo-300">{metrics?.firmName || "LeFri Legal"}</span> | Especialidad: <span className="font-semibold text-indigo-300">{metrics?.specialty || "General"}</span>
            </p>
          </div>
          {metrics && (
            <div className="flex items-center space-x-3 bg-neutral-800/60 backdrop-blur border border-neutral-700/50 rounded-xl p-4">
              <Award className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Notoriedad en la Red</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg font-bold">{metrics.notorietyScore} pts</span>
                  <Badge className={getNotorietyBadge(metrics.notorietyScore).color}>
                    {getNotorietyBadge(metrics.notorietyScore).label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow border-neutral-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Leads Nuevos</p>
                  <p className="text-3xl font-bold mt-2 text-indigo-600">{metrics.newLeads}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow border-neutral-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Casos Activos</p>
                  <p className="text-3xl font-bold mt-2 text-neutral-800">{metrics.activeCases}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow border-neutral-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm font-medium text-neutral-500">Cupo ProBono Mensual</p>
                  <span className="text-xs text-indigo-600 font-semibold">{metrics.proBonoUsed} / {metrics.proBonoLimit}</span>
                </div>
                <div className="mt-4">
                  <Progress value={(metrics.proBonoUsed / metrics.proBonoLimit) * 100} className="h-2" />
                  <p className="text-xs text-neutral-400 mt-2">
                    Ayuda a ciudadanos sin recursos para subir tu notoriedad.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow border-neutral-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">WhatsApp Conectado</p>
                  <p className="text-lg font-bold mt-2 flex items-center">
                    {wsStatus?.status === 'connected' ? (
                      <span className="text-emerald-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1 inline" /> Activo</span>
                    ) : (
                      <span className="text-neutral-400 flex items-center"><Clock className="w-4 h-4 mr-1 inline" /> Sin vincular</span>
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 ${wsStatus?.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'} rounded-xl flex items-center justify-center`}>
                  <Phone className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workspace Tabs */}
        <Tabs defaultValue="crm" className="w-full">
          <TabsList className="bg-neutral-200/60 p-1 rounded-xl w-full md:w-auto grid grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="crm" className="rounded-lg py-2">CRM (Leads)</TabsTrigger>
            <TabsTrigger value="erp" className="rounded-lg py-2">ERP (Casos)</TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-lg py-2">WhatsApp & Widget</TabsTrigger>
            <TabsTrigger value="config" className="rounded-lg py-2">Configuración</TabsTrigger>
          </TabsList>

          {/* CRM Leads Panel */}
          <TabsContent value="crm" className="space-y-6">
            <Card className="shadow border-neutral-200">
              <CardHeader className="border-b border-neutral-100">
                <CardTitle>Embudo de Leads (Captación de Clientes)</CardTitle>
                <CardDescription>
                  Prospectos legales filtrados y pre-analizados por la red agéntica de LeFriApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLeadsLoading ? (
                  <div className="p-8 text-center text-neutral-500">Cargando leads...</div>
                ) : leads && leads.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Resumen del Problema (IA)</TableHead>
                        <TableHead>Modalidad</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead: any) => (
                        <TableRow key={lead._id}>
                          <TableCell className="font-semibold">{lead.name}</TableCell>
                          <TableCell>
                            <p className="text-xs text-neutral-600">{lead.phone || lead.email}</p>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-neutral-500">
                            {lead.summary || "Consulta legal general por WhatsApp"}
                          </TableCell>
                          <TableCell>
                            {lead.isProBono ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-none">ProBono (+Notoriedad)</Badge>
                            ) : (
                              <Badge className="bg-indigo-100 text-indigo-800 border-none">Suscripción / Pago</Badge>
                            )}
                          </TableCell>
                          <TableCell className="capitalize text-xs text-neutral-500">{lead.source}</TableCell>
                          <TableCell>
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatusMutation.mutate({ id: lead._id, status: e.target.value })}
                              className="text-xs border rounded p-1 bg-white"
                            >
                              <option value="new">Nuevo</option>
                              <option value="contacted">Contactado</option>
                              <option value="negotiation">Negociando</option>
                              <option value="converted">Convertido</option>
                              <option value="archived">Archivado</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {lead.status !== 'converted' && (
                              <Button 
                                size="sm" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
                                onClick={() => convertLeadMutation.mutate(lead._id)}
                                disabled={convertLeadMutation.isPending}
                              >
                                Convertir a Caso
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center text-neutral-500">
                    <Users className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-lg font-medium">No hay prospectos en tu CRM</p>
                    <p className="text-sm mt-1">Los leads que contacten tu WhatsApp o tu Widget web aparecerán aquí.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ERP Cases Panel */}
          <TabsContent value="erp" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cases Table */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow border-neutral-200">
                <CardHeader>
                  <CardTitle>Expedientes Judiciales y Casos del Despacho</CardTitle>
                  <CardDescription>ERP de gestión operativa. Registra tareas, carga documentos oficiales y controla facturas.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isCasesLoading ? (
                    <div className="p-8 text-center text-neutral-500">Cargando expedientes...</div>
                  ) : cases && cases.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-neutral-50">
                        <TableRow>
                          <TableHead>Título del Caso</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Tribunal / Exp.</TableHead>
                          <TableHead>Progreso</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cases.map((caseFile: any) => (
                          <TableRow 
                            key={caseFile._id}
                            className={`cursor-pointer transition-colors ${selectedCaseId === caseFile._id ? 'bg-indigo-50/50 hover:bg-indigo-50/50' : 'hover:bg-neutral-100/50'}`}
                            onClick={() => setSelectedCaseId(caseFile._id)}
                          >
                            <TableCell className="font-semibold text-neutral-900">{caseFile.title}</TableCell>
                            <TableCell className="text-xs">{caseFile.clientId?.name || 'Cliente Externo'}</TableCell>
                            <TableCell className="text-xs text-neutral-500">
                              <p className="font-semibold">{caseFile.caseNumber || 'N/A'}</p>
                              <p>{caseFile.court || 'No asignado'}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={caseFile.progress} className="w-16 h-1.5" />
                                <span className="text-xs font-medium text-neutral-500">{caseFile.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={caseFile.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-none' : 'bg-neutral-200 text-neutral-700'}>
                                {caseFile.status === 'active' ? 'Activo' : caseFile.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-12 text-center text-neutral-500">
                      <Briefcase className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                      <p className="text-lg font-medium">Sin expedientes activos</p>
                      <p className="text-sm mt-1">Convierte prospectos desde la pestaña CRM o crea expedientes manuales.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Case Detail panel (ERP actions) */}
            <div className="lg:col-span-1">
              {selectedCase ? (
                <Card className="shadow border-neutral-200 sticky top-4">
                  <CardHeader className="border-b border-neutral-100">
                    <Badge className="bg-indigo-100 text-indigo-800 border-none w-fit mb-2">Expediente Seleccionado</Badge>
                    <CardTitle className="text-xl font-bold">{selectedCase.title}</CardTitle>
                    <CardDescription>{selectedCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Legal Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <div>
                        <p className="text-neutral-400">Juzgado/Tribunal</p>
                        <p className="font-semibold text-neutral-700 mt-0.5">{selectedCase.court || 'No asignado'}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Juez</p>
                        <p className="font-semibold text-neutral-700 mt-0.5">{selectedCase.judge || 'No asignado'}</p>
                      </div>
                      <div className="col-span-2 border-t pt-2 mt-2">
                        <p className="text-neutral-400">Número de Expediente</p>
                        <p className="font-semibold text-indigo-600 mt-0.5">{selectedCase.caseNumber || 'N/A'}</p>
                      </div>
                    </div>

                    {/* ERP Document digital vault */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center text-neutral-700">
                        <FileText className="w-4 h-4 mr-1.5 text-indigo-500" /> Bóveda Digital (Digitalización OCR)
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedCase.documents?.map((doc: any, i: number) => (
                          <div key={i} className="p-2 bg-neutral-100/70 border rounded-lg text-xs flex justify-between items-center">
                            <span className="font-semibold text-neutral-700 truncate max-w-[180px]">{doc.name}</span>
                            <Badge className="bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600/10 border-none text-[10px]">IA Analizado</Badge>
                          </div>
                        ))}
                        {(!selectedCase.documents || selectedCase.documents.length === 0) && (
                          <p className="text-xs text-neutral-400 italic">No hay documentos en este expediente.</p>
                        )}
                      </div>
                      {/* Upload new file */}
                      <div className="flex flex-col space-y-2 mt-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <Input 
                          placeholder="Nombre del documento..." 
                          value={docName} 
                          onChange={(e) => setDocName(e.target.value)} 
                          className="text-xs h-8 bg-white"
                        />
                        <Input 
                          type="file" 
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="text-xs h-8 bg-white cursor-pointer"
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs font-semibold"
                          onClick={() => handleUploadDocument(selectedCase._id)}
                          disabled={!uploadFile}
                        >
                          <Upload className="w-3 h-3 mr-1" /> Cargar y Digitalizar (OCR)
                        </Button>
                      </div>
                    </div>

                    {/* ERP Billing */}
                    <div className="space-y-3 pt-2 border-t">
                      <h4 className="text-sm font-semibold flex items-center text-neutral-700">
                        <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" /> Facturación y Cobros
                      </h4>
                      <div className="space-y-2">
                        {selectedCase.invoices?.map((inv: any, i: number) => (
                          <div key={inv._id || i} className="p-2 bg-neutral-50 border rounded-lg text-xs flex justify-between items-center">
                            <div>
                              <p className="font-bold text-neutral-800">${inv.amount}</p>
                              <p className="text-[10px] text-neutral-400">Vencimiento: {new Date(inv.dueDate).toLocaleDateString()}</p>
                            </div>
                            <select
                              value={inv.status}
                              onChange={(e) => updateInvoiceMutation.mutate({ caseId: selectedCase._id, invoiceId: inv._id, status: e.target.value })}
                              className="text-[10px] border rounded bg-white p-0.5"
                            >
                              <option value="pending">Pendiente</option>
                              <option value="paid">Pagado</option>
                            </select>
                          </div>
                        ))}
                        {(!selectedCase.invoices || selectedCase.invoices.length === 0) && (
                          <p className="text-xs text-neutral-400 italic">Sin facturas emitidas.</p>
                        )}
                      </div>
                      {/* Create fee */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="w-full text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 font-semibold">
                            <PlusCircle className="w-3.5 h-3.5 mr-1" /> Generar Factura
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Generar Cobro / Factura</DialogTitle>
                            <DialogDescription>Genera un cobro asociado al expediente judicial del cliente.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label className="text-right text-xs">Monto ($)</label>
                              <Input 
                                type="number" 
                                className="col-span-3 text-xs" 
                                value={invoiceAmount} 
                                onChange={(e) => setInvoiceAmount(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label className="text-right text-xs">Vencimiento</label>
                              <Input 
                                type="date" 
                                className="col-span-3 text-xs" 
                                value={invoiceDueDate} 
                                onChange={(e) => setInvoiceDueDate(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => addInvoiceMutation.mutate({ 
                                caseId: selectedCase._id, 
                                amount: parseFloat(invoiceAmount), 
                                dueDate: invoiceDueDate 
                              })}
                              className="bg-indigo-600 text-white text-xs font-semibold"
                            >
                              Emitir Factura
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow border-neutral-200 border-dashed flex flex-col justify-center items-center p-8 text-neutral-400 h-64">
                  <Briefcase className="w-10 h-10 mb-2 text-neutral-300 animate-pulse" />
                  <p className="text-sm font-semibold text-center">Selecciona un expediente judicial para ver detalles, OCR y Facturación.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* WhatsApp & Channels connection Panel */}
          <TabsContent value="whatsapp" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WhatsApp Connector */}
              <Card className="shadow border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <span>Conector de WhatsApp del Bufete</span>
                  </CardTitle>
                  <CardDescription>
                    Vincula tu número telefónico corporativo para recibir mensajes de ciudadanos, chatear y automatizar leads con IA.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-2 mb-4">
                    <Button 
                      variant={whatsappProvider === 'baileys' ? 'default' : 'outline'} 
                      onClick={() => { setWhatsappProvider('baileys'); setProviderMutation.mutate(); }}
                      className="text-xs"
                    >
                      WhatsApp Web
                    </Button>
                    <Button 
                      variant={whatsappProvider === 'twilio' ? 'default' : 'outline'} 
                      onClick={() => setWhatsappProvider('twilio')}
                      className="text-xs"
                    >
                      Twilio
                    </Button>
                    <Button 
                      variant={whatsappProvider === 'meta' ? 'default' : 'outline'} 
                      onClick={() => setWhatsappProvider('meta')}
                      className="text-xs"
                    >
                      Meta Cloud API
                    </Button>
                  </div>

                  {whatsappProvider === 'twilio' && (
                    <div className="space-y-2 text-xs p-4 border rounded-xl bg-neutral-50 mb-4">
                      <Input placeholder="Account SID" value={twilioConfig.accountSid} onChange={e => setTwilioConfig({...twilioConfig, accountSid: e.target.value})} />
                      <Input placeholder="Auth Token" type="password" value={twilioConfig.authToken} onChange={e => setTwilioConfig({...twilioConfig, authToken: e.target.value})} />
                      <Input placeholder="Phone Number (e.g. +1234567890)" value={twilioConfig.phoneNumber} onChange={e => setTwilioConfig({...twilioConfig, phoneNumber: e.target.value})} />
                      <Button onClick={() => setProviderMutation.mutate()} className="w-full text-xs bg-indigo-600 text-white hover:bg-indigo-700" disabled={setProviderMutation.isPending}>Guardar Configuración Twilio</Button>
                    </div>
                  )}

                  {whatsappProvider === 'meta' && (
                    <div className="space-y-2 text-xs p-4 border rounded-xl bg-neutral-50 mb-4">
                      <Input placeholder="Access Token" type="password" value={metaConfig.accessToken} onChange={e => setMetaConfig({...metaConfig, accessToken: e.target.value})} />
                      <Input placeholder="Phone Number ID" value={metaConfig.phoneNumberId} onChange={e => setMetaConfig({...metaConfig, phoneNumberId: e.target.value})} />
                      <Button onClick={() => setProviderMutation.mutate()} className="w-full text-xs bg-indigo-600 text-white hover:bg-indigo-700" disabled={setProviderMutation.isPending}>Guardar Configuración Meta</Button>
                    </div>
                  )}

                  {wsStatus?.status === 'connected' ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <div>
                          <p className="font-bold text-sm">Sesión vinculada activamente</p>
                          <p className="text-xs mt-0.5">La inteligencia artificial responderá automáticamente las consultas y cargará leads en tu CRM.</p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full text-xs font-semibold text-white"
                        onClick={() => disconnectWsMutation.mutate()}
                        disabled={disconnectWsMutation.isPending}
                      >
                        Desconectar Cuenta de WhatsApp
                      </Button>
                    </div>
                  ) : wsStatus?.status === 'qr_ready' ? (
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 border rounded-xl bg-neutral-50">
                      <p className="text-sm font-semibold text-neutral-700">Escanea el código QR desde tu celular en WhatsApp</p>
                      
                      <div className="p-4 bg-white rounded-xl shadow border">
                        {/* QR Image source -> Llama al endpoint de whatsapp-api */}
                        <img 
                          src={`/api/lawyer/whatsapp/qr?t=${Date.now()}`} 
                          alt="WhatsApp Scan QR" 
                          className="w-52 h-52 object-contain"
                        />
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs font-semibold"
                        onClick={() => refetchWsStatus()}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refrescar Código QR
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-neutral-50 space-y-4">
                      <Phone className="w-12 h-12 text-neutral-300 animate-bounce" />
                      <p className="text-sm font-semibold text-neutral-700 text-center">Conector listo para iniciar vinculación</p>
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white w-full"
                        onClick={() => refetchWsStatus()}
                      >
                        Iniciar Vinculación por Código QR
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Web Widget Generator */}
              <Card className="shadow border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    <span>Widget de Asistente de IA Legal</span>
                  </CardTitle>
                  <CardDescription>
                    Integra un botón de chat flotante en el sitio web de tu bufete. Las conversaciones captarán leads automáticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Copia y pega el siguiente fragmento HTML dentro de la etiqueta `&lt;head&gt;` o al final del `&lt;body&gt;` en el código de tu sitio web para desplegar el widget interactivo.
                  </p>
                  
                  <div className="bg-neutral-800 text-neutral-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-neutral-700 shadow-inner">
                    <code>
                      {`<!-- LeFriApp AI Legal Assistant Widget -->
<script 
  src="${window.location.origin}/widget.js" 
  data-firm-id="${metrics?.firmName ? metrics.firmName.replace(/\s+/g, '-').toLowerCase() : 'demo'}"
  defer>
</script>`}
                    </code>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-neutral-100 p-3 rounded-xl border">
                    <MessageSquare className="w-5 h-5 text-neutral-400" />
                    <p className="text-xs text-neutral-500">
                      Cuando un usuario escriba en tu widget web, la IA evaluará su caso en tiempo real y te enviará la alerta a tu embudo CRM.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Panel */}
          <TabsContent value="config" className="space-y-6">
            <Card className="shadow border-neutral-200 max-w-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span>Configuración del Plan y Cupo ProBono</span>
                </CardTitle>
                <CardDescription>
                  Administra las políticas de tu bufete dentro de la red LeFriApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 border rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-neutral-800">Plan de Suscripción</p>
                      <p className="text-xs text-neutral-500">Suscripción SaaS mensual activa.</p>
                    </div>
                    <Badge className="bg-indigo-600 text-white capitalize">{metrics?.subscriptionPlan || 'free'}</Badge>
                  </div>

                  {/* SaaS Subscription Upgrade Section */}
                  {metrics?.subscriptionPlan === 'free' ? (
                    <div className="p-4 border border-indigo-100 bg-neutral-50 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-neutral-700 tracking-wide uppercase">Upgrade your Firm to Premium</h4>
                      <p className="text-xs text-neutral-500">
                        Habilita la integración de WhatsApp Corporativo y aumenta tu visibilidad y leads en el CRM de LeFriApp.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border bg-white rounded-lg flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-xs">Plan Pro</p>
                            <p className="text-lg font-bold text-indigo-600 mt-1">$49<span className="text-[10px] text-neutral-400">/mes</span></p>
                            <p className="text-[10px] text-neutral-400 mt-1">Límite ProBono de 10 casos.</p>
                          </div>
                          <div className="flex flex-col gap-1 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => checkoutMutation.mutate({ plan: 'pro', provider: 'dlocal' })}
                              className="text-[10px] h-7 bg-indigo-600 text-white font-semibold"
                              disabled={checkoutMutation.isPending}
                            >
                              dLocal Go
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => checkoutMutation.mutate({ plan: 'pro', provider: 'paypal' })}
                              className="text-[10px] h-7 bg-neutral-900 text-white font-semibold"
                              disabled={checkoutMutation.isPending}
                            >
                              PayPal
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 border bg-white rounded-lg flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-xs">Enterprise</p>
                            <p className="text-lg font-bold text-indigo-600 mt-1">$149<span className="text-[10px] text-neutral-400">/mes</span></p>
                            <p className="text-[10px] text-neutral-400 mt-1">Límites ProBono ilimitados.</p>
                          </div>
                          <div className="flex flex-col gap-1 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => checkoutMutation.mutate({ plan: 'enterprise', provider: 'dlocal' })}
                              className="text-[10px] h-7 bg-indigo-600 text-white font-semibold"
                              disabled={checkoutMutation.isPending}
                            >
                              dLocal Go
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => checkoutMutation.mutate({ plan: 'enterprise', provider: 'paypal' })}
                              className="text-[10px] h-7 bg-neutral-900 text-white font-semibold"
                              disabled={checkoutMutation.isPending}
                            >
                              PayPal
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>¡Tu bufete cuenta con el Plan Premium activo! Disfrutas de todas las automatizaciones de la red.</span>
                    </div>
                  )}

                  <div className="space-y-2 border-t pt-4">
                    <label className="text-sm font-semibold text-neutral-700 block">Asesorías ProBono Mensuales</label>
                    <p className="text-xs text-neutral-500 mb-2">
                      Define la cantidad máxima de casos gratuitos al mes que tu firma asume de la red agéntica para personas sin recursos.
                    </p>
                    
                    <div className="flex space-x-4">
                      <Input 
                        type="number" 
                        value={proBonoLimitInput} 
                        onChange={(e) => setProBonoLimitInput(parseInt(e.target.value) || 0)}
                        className="w-32 text-sm"
                        min="0"
                      />
                      <Button 
                        onClick={() => updateProBonoMutation.mutate(proBonoLimitInput)}
                        className="bg-indigo-600 text-white text-xs font-semibold"
                        disabled={updateProBonoMutation.isPending}
                      >
                        Actualizar Cupo
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
