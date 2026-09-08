import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BarChart3, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  language: z.string(),
  country: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const { data: consultations } = useQuery({
    queryKey: ['/api/consultations'],
    queryFn: async () => {
      const response = await api.getConsultations();
      return await response.json();
    },
  });

  const { data: processes } = useQuery({
    queryKey: ['/api/processes'],
    queryFn: async () => {
      const response = await api.getProcesses();
      return await response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: async (response) => {
      const updatedUser = await response.json();
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      language: user?.language || 'en',
      country: user?.country || 'EC',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const countries = [
    { value: 'EC', label: '🇪🇨 Ecuador' },
    { value: 'CO', label: '🇨🇴 Colombia' },
    { value: 'PE', label: '🇵🇪 Perú' },
    { value: 'US', label: '🇺🇸 Estados Unidos' },
    { value: 'MX', label: '🇲🇽 México' },
  ];

  const languages = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Español' },
  ];

  // Calculate total usage time (mock)
  const totalHours = consultations?.length ? consultations.length * 2.5 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">Mi Perfil</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span>{t.personalInformation}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-300">{t.fullName}</Label>
                        <Input
                          id="name"
                          placeholder={t.fullName}
                          className="bg-slate-950 border-slate-700 text-white"
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-rose-400 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-slate-300">{t.email}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t.email}
                          className="bg-slate-950 border-slate-700 text-white"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-rose-400 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="text-slate-300">{t.phone}</Label>
                        <Input
                          id="phone"
                          placeholder={t.phone}
                          className="bg-slate-950 border-slate-700 text-white"
                          {...register('phone')}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="country" className="text-slate-300">{t.country}</Label>
                        <Select onValueChange={(value) => setValue('country', value)} defaultValue={user?.country || 'EC'}>
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder={t.country} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            {countries.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="language" className="text-slate-300">{t.language}</Label>
                        <Select onValueChange={(value) => setValue('language', value)} defaultValue={user?.language || 'es'}>
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder={t.language} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            {languages.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.language && (
                          <p className="text-rose-400 text-sm mt-1">{errors.language.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        disabled={!isDirty || updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? t.saving : t.saveChanges}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Usage Stats */}
              <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <span>{t.usageStatistics}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{t.consultationsCompleted}</span>
                    <span className="text-lg font-bold text-indigo-400">
                      {consultations?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{t.processesStarted}</span>
                    <span className="text-lg font-bold text-orange-400">
                      {processes?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{t.totalTime}</span>
                    <span className="text-lg font-bold text-white">
                      {totalHours.toFixed(1)}h
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Account Settings */}
              <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    <span>Configuración</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Notificaciones por Correo</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Notificaciones por WhatsApp</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Modo Oscuro (Dark Mode)</span>
                    <Switch defaultChecked disabled />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
