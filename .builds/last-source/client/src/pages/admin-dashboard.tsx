import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/navbar';
import { 
  Users, Briefcase, Phone, MessageSquare, 
  Send, Bot, CheckCircle, Clock, ShieldAlert,
  Settings, BarChart3, RefreshCw, Key
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [telegramToken, setTelegramToken] = useState('');
  const [newFirmName, setNewFirmName] = useState('');
  const [newFirmSpecialty, setNewFirmSpecialty] = useState('general');

  // Fetch users
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error("Failed to load users");
      return await response.json();
    }
  });

  // Fetch firms
  const { data: firms, isLoading: isFirmsLoading } = useQuery({
    queryKey: ['/api/admin/firms'],
    queryFn: async () => {
      const response = await fetch('/api/admin/firms');
      if (!response.ok) throw new Error("Failed to load law firms");
      return await response.json();
    }
  });

  // Mutación para actualizar rol de usuario
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role, lawFirmId }: { userId: string; role: string; lawFirmId?: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, lawFirmId })
      });
      if (!response.ok) throw new Error("Failed to update user role");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({ title: "Usuario actualizado", description: "El rol y la firma del usuario se han guardado con éxito." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Mutación para actualizar suscripción de bufete
  const updateFirmSubscriptionMutation = useMutation({
    mutationFn: async ({ firmId, subscriptionPlan, proBonoLimit }: { firmId: string; subscriptionPlan: string; proBonoLimit?: number }) => {
      const response = await fetch(`/api/admin/firms/${firmId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionPlan, proBonoLimit })
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/firms'] });
      toast({ title: "Suscripción actualizada", description: "El plan de la firma ha sido actualizado." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Mutación para crear bufete
  const createFirmMutation = useMutation({
    mutationFn: async ({ name, specialty }: { name: string; specialty: string }) => {
      const response = await fetch(`/api/admin/firms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, specialty })
      });
      if (!response.ok) throw new Error("Failed to create firm");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/firms'] });
      toast({ title: "Firma creada", description: "La nueva firma se ha registrado con éxito." });
      setNewFirmName('');
      setNewFirmSpecialty('general');
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  
  // Fetch admin configs and stats
  const { data: configData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/config');
      if (!response.ok) throw new Error("Failed to load admin config");
      const data = await response.json();
      if (data && data.telegramToken) {
        setTelegramToken(data.telegramToken);
      }
      return data;
    }
  });

  // Mutación para guardar Telegram Token
  const saveTelegramMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramToken: token })
      });
      if (!response.ok) throw new Error("Failed to save Telegram token");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({ title: "Configuración guardada", description: "El token de Telegram se ha guardado y configurado." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Mutación para desconectar WhatsApp
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/whatsapp/disconnect', {
        method: 'POST'
      });
      if (!response.ok) throw new Error("Failed to disconnect");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({ title: "WhatsApp desconectado", description: "La sesión del WhatsApp Central ha sido cerrada." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-neutral-900 via-violet-950 to-indigo-950 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Panel de Super Administrador
            </h1>
            <p className="text-neutral-300 text-sm mt-1">
              Monitorea el crecimiento de la red LeFriApp y configura los canales automatizados B2C para el público general.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 text-xs">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="font-semibold">Modo Super Admin Activo</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-neutral-500 flex items-center justify-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Cargando configuraciones y métricas del sistema...</span>
          </div>
        ) : configData && (
          <>
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow border-neutral-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Usuarios Totales</p>
                    <p className="text-3xl font-bold mt-2 text-indigo-600">{configData.stats.totalUsers}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {configData.stats.totalCitizens} ciudadanos | {configData.stats.totalLawyers} abogados
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow border-neutral-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Bufetes / Firmas</p>
                    <p className="text-3xl font-bold mt-2 text-neutral-800">{configData.stats.totalFirms}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Empresas legaltech B2B</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow border-neutral-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Casos y Expedientes</p>
                    <p className="text-3xl font-bold mt-2 text-neutral-800">{configData.stats.totalCases}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">{configData.stats.totalLeads} leads capturados en CRM</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow border-neutral-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Conversaciones Activas</p>
                    <p className="text-3xl font-bold mt-2 text-violet-600">{configData.stats.totalConversations}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Chats con el Mediador de IA</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Interface */}
            <Tabs defaultValue="channels" className="w-full">
              <TabsList className="bg-neutral-200/60 p-1 rounded-xl w-full md:w-auto grid grid-cols-3 gap-2 mb-6">
                <TabsTrigger value="channels" className="rounded-lg py-2">Canales B2C</TabsTrigger>
                <TabsTrigger value="users" className="rounded-lg py-2">Usuarios y Abogados</TabsTrigger>
                <TabsTrigger value="firms" className="rounded-lg py-2">Bufetes (SaaS)</TabsTrigger>
              </TabsList>

              {/* Channels B2C */}
              <TabsContent value="channels">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* WhatsApp B2C Channel */}
                  <Card className="shadow border-neutral-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-emerald-500" />
                        <span>WhatsApp Central B2C</span>
                      </CardTitle>
                      <CardDescription>
                        Vincula la cuenta oficial de la plataforma de cara al público. Los ciudadanos chatearán con este número para consultas y revisión de cuenta.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {configData.whatsappStatus === 'connected' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            <div>
                              <p className="font-bold text-sm">WhatsApp B2C Conectado</p>
                              <p className="text-xs mt-0.5">El canal oficial de atención al público está respondiendo consultas e interactuando activamente.</p>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            className="w-full text-xs font-semibold text-white"
                            onClick={() => disconnectMutation.mutate()}
                            disabled={disconnectMutation.isPending}
                          >
                            Desconectar WhatsApp Central
                          </Button>
                        </div>
                      ) : configData.whatsappStatus === 'qr_ready' ? (
                        <div className="flex flex-col items-center justify-center p-6 space-y-4 border rounded-xl bg-neutral-50">
                          <p className="text-sm font-semibold text-neutral-700">Escanea el código QR central desde tu celular en WhatsApp</p>
                          
                          <div className="p-4 bg-white rounded-xl shadow border">
                            <img 
                              src={`/api/admin/whatsapp/qr?t=${Date.now()}`} 
                              alt="WhatsApp System B2C QR" 
                              className="w-52 h-52 object-contain"
                            />
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs font-semibold"
                            onClick={() => refetch()}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refrescar Código QR
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-neutral-50 space-y-4">
                          <Phone className="w-12 h-12 text-neutral-300 animate-pulse" />
                          <p className="text-sm font-semibold text-neutral-700 text-center">Conexión B2C lista para iniciar vinculación</p>
                          <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white w-full"
                            onClick={() => refetch()}
                          >
                            Generar Código QR de Conexión
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Telegram Bot B2C Channel */}
                  <Card className="shadow border-neutral-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-indigo-500" />
                        <span>Telegram Bot Central B2C</span>
                      </CardTitle>
                      <CardDescription>
                        Configura el Bot de Telegram de cara al público general. Obtén el token creando un nuevo bot con @BotFather.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 block">Token del Bot de Telegram (HTTP API)</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Key className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                            <Input 
                              placeholder="Ej: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                              value={telegramToken}
                              onChange={(e) => setTelegramToken(e.target.value)}
                              className="pl-9 text-xs"
                              type="password"
                            />
                          </div>
                          <Button 
                            onClick={() => saveTelegramMutation.mutate(telegramToken)}
                            disabled={saveTelegramMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white font-semibold"
                          >
                            Guardar Token
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-50 border rounded-xl space-y-2">
                        <p className="text-xs font-bold text-neutral-700">Instrucciones de configuración del Bot:</p>
                        <ol className="text-[11px] text-neutral-500 space-y-1 list-decimal pl-4 leading-relaxed">
                          <li>Escribe a <a href="https://t.me/BotFather" target="_blank" className="text-indigo-600 font-semibold underline">@BotFather</a> en Telegram y ejecuta el comando `/newbot`.</li>
                          <li>Define el nombre y el username de tu bot (terminando en `bot`).</li>
                          <li>Copia el token HTTP API proporcionado y pégalo arriba.</li>
                          <li>Una vez guardado, el sistema configurará los webhooks y los ciudadanos podrán iniciar el chat usando el comando `/start`.</li>
                        </ol>
                      </div>

                      {configData.telegramToken ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-xs">
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                          <span>Bot de Telegram activo y respondiendo actualizaciones del sistema.</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center text-amber-800 text-xs">
                          <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />
                          <span>El Bot de Telegram no está activo. Configure un Token para habilitarlo.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>

              {/* Users & Lawyers approval */}
              <TabsContent value="users">
                <Card className="shadow border-neutral-200">
                  <CardHeader>
                    <CardTitle>Gestión de Usuarios y Aprobaciones</CardTitle>
                    <CardDescription>
                      Asigna el rol de Abogado o Administrador a los ciudadanos registrados para habilitar sus paneles especializados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isUsersLoading ? (
                      <div className="p-8 text-center text-neutral-500">Cargando usuarios...</div>
                    ) : users && users.length > 0 ? (
                      <Table>
                        <TableHeader className="bg-neutral-50">
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono / DID</TableHead>
                            <TableHead>Rol del Sistema</TableHead>
                            <TableHead>Firma Asignada</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((userObj: any) => (
                            <TableRow key={userObj._id}>
                              <TableCell className="font-semibold text-neutral-900">{userObj.name}</TableCell>
                              <TableCell className="text-xs">{userObj.email}</TableCell>
                              <TableCell className="text-xs text-neutral-500">
                                <p>{userObj.phone || 'Sin teléfono'}</p>
                                {userObj.did && <p className="text-[10px] text-indigo-600 truncate max-w-[150px]">{userObj.did}</p>}
                              </TableCell>
                              <TableCell>
                                <select
                                  value={userObj.role}
                                  onChange={(e) => updateUserRoleMutation.mutate({ 
                                    userId: userObj._id, 
                                    role: e.target.value,
                                    lawFirmId: userObj.lawFirmId?._id || userObj.lawFirmId
                                  })}
                                  className="text-xs border rounded p-1.5 bg-white font-medium"
                                  disabled={updateUserRoleMutation.isPending}
                                >
                                  <option value="citizen">Ciudadano (Citizen)</option>
                                  <option value="lawyer">Abogado (Lawyer)</option>
                                  <option value="admin">Administrador (Admin)</option>
                                </select>
                              </TableCell>
                              <TableCell>
                                <select
                                  value={userObj.lawFirmId?._id || userObj.lawFirmId || ''}
                                  onChange={(e) => updateUserRoleMutation.mutate({ 
                                    userId: userObj._id, 
                                    role: userObj.role,
                                    lawFirmId: e.target.value || undefined
                                  })}
                                  className="text-xs border rounded p-1.5 bg-white"
                                  disabled={updateUserRoleMutation.isPending || userObj.role !== 'lawyer'}
                                >
                                  <option value="">Ninguna firma</option>
                                  {firms?.map((firm: any) => (
                                    <option key={firm._id} value={firm._id}>{firm.name}</option>
                                  ))}
                                </select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-12 text-center text-neutral-500">No hay usuarios registrados.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Law Firms SaaS management */}
              <TabsContent value="firms" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-neutral-800">Directorio de Bufetes Legales</h3>
                  
                  {/* Dialog for creating firm */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white">
                        Registrar Nuevo Bufete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Crear Bufete / Firma Legal</DialogTitle>
                        <DialogDescription>Registra un nuevo bufete dentro del ecosistema SaaS multi-inquilino.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-right text-xs">Nombre</label>
                          <Input 
                            placeholder="Ej: Lefri Legal" 
                            className="col-span-3 text-xs" 
                            value={newFirmName} 
                            onChange={(e) => setNewFirmName(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-right text-xs">Especialidad</label>
                          <select
                            className="col-span-3 text-xs border rounded p-2 bg-white"
                            value={newFirmSpecialty}
                            onChange={(e) => setNewFirmSpecialty(e.target.value)}
                          >
                            <option value="general">Derecho General</option>
                            <option value="penal">Penal</option>
                            <option value="laboral">Laboral</option>
                            <option value="civil">Civil / Familia</option>
                            <option value="constitucional">Constitucional</option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => createFirmMutation.mutate({ name: newFirmName, specialty: newFirmSpecialty })}
                          className="bg-indigo-600 text-white text-xs font-semibold"
                          disabled={!newFirmName || createFirmMutation.isPending}
                        >
                          Guardar Bufete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="shadow border-neutral-200">
                  <CardHeader>
                    <CardTitle>Planes y Accesos de Prueba (SaaS)</CardTitle>
                    <CardDescription>
                      Activa accesos de prueba (trial) a las firmas asociadas o actualiza su plan de suscripción directamente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isFirmsLoading ? (
                      <div className="p-8 text-center text-neutral-500">Cargando firmas...</div>
                    ) : firms && firms.length > 0 ? (
                      <Table>
                        <TableHeader className="bg-neutral-50">
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Especialidad</TableHead>
                            <TableHead>Plan de Suscripción</TableHead>
                            <TableHead>Límite ProBono</TableHead>
                            <TableHead>Registrado En</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {firms.map((firm: any) => (
                            <TableRow key={firm._id}>
                              <TableCell className="font-semibold text-neutral-900">
                                <p>{firm.name}</p>
                                {firm.whatsAppSessionActive && (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-none text-[9px] mt-1">WhatsApp Activo</Badge>
                                )}
                              </TableCell>
                              <TableCell className="capitalize text-xs">{firm.specialty || 'General'}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={firm.subscriptionPlan}
                                    onChange={(e) => updateFirmSubscriptionMutation.mutate({ 
                                      firmId: firm._id, 
                                      subscriptionPlan: e.target.value,
                                      proBonoLimit: firm.proBonoLimit
                                    })}
                                    className="text-xs border rounded p-1.5 bg-white font-medium"
                                    disabled={updateFirmSubscriptionMutation.isPending}
                                  >
                                    <option value="free">Gratuito (Free)</option>
                                    <option value="pro">Pro (Prueba/Trial)</option>
                                    <option value="enterprise">Corporativo (Enterprise)</option>
                                  </select>
                                  {firm.subscriptionPlan !== 'free' && (
                                    <Badge className="bg-amber-100 text-amber-800 border-none text-[9px]">Acceso Pro</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  value={firm.proBonoLimit}
                                  onChange={(e) => updateFirmSubscriptionMutation.mutate({
                                    firmId: firm._id,
                                    subscriptionPlan: firm.subscriptionPlan,
                                    proBonoLimit: parseInt(e.target.value) || 0
                                  })}
                                  className="w-16 text-xs border rounded p-1.5 bg-white text-center"
                                  disabled={updateFirmSubscriptionMutation.isPending}
                                  min="0"
                                />
                              </TableCell>
                              <TableCell className="text-xs text-neutral-500">
                                {new Date(firm.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-12 text-center text-neutral-500">No hay bufetes registrados.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

      </main>
    </div>
  );
}
