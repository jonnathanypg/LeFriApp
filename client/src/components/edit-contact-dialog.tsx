import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const editContactSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  relationship: z.string().min(1, 'La relación es requerida'),
  whatsappEnabled: z.boolean().default(false),
});

type EditContactForm = z.infer<typeof editContactSchema>;

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  whatsappEnabled: boolean;
}

interface EditContactDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

const relationships = [
  { value: 'family', label: 'Familiar' },
  { value: 'friend', label: 'Amigo/a' },
  { value: 'colleague', label: 'Colega' },
  { value: 'neighbor', label: 'Vecino/a' },
  { value: 'partner', label: 'Pareja' },
  { value: 'other', label: 'Otro' },
];

export function EditContactDialog({ contact, isOpen, onClose }: EditContactDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EditContactForm>({
    resolver: zodResolver(editContactSchema),
    defaultValues: contact ? {
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      whatsappEnabled: contact.whatsappEnabled,
    } : {
      name: '',
      phone: '',
      relationship: '',
      whatsappEnabled: false,
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: EditContactForm) => {
      const response = await fetch(`/api/emergency-contacts/${contact?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '66a1b2c3d4e5f6789abc1234'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error updating contact');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
      toast({ title: 'Contacto actualizado exitosamente' });
      onClose();
      reset();
    },
    onError: () => {
      toast({ title: 'Error al actualizar contacto', variant: 'destructive' });
    }
  });

  const onSubmit = (data: EditContactForm) => {
    updateContactMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Contacto de Emergencia</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              placeholder="Ej: María Pérez"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone">Número de Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+593 99 123 4567"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="relationship">Relación</Label>
            <Select 
              value={watch('relationship')} 
              onValueChange={(value) => setValue('relationship', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar relación" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((rel) => (
                  <SelectItem key={rel.value} value={rel.value}>
                    {rel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-red-500 text-sm mt-1">{errors.relationship.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp"
              checked={watch('whatsappEnabled')}
              onCheckedChange={(checked) => setValue('whatsappEnabled', checked)}
            />
            <Label htmlFor="whatsapp" className="text-sm">
              Notificar por WhatsApp
            </Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={updateContactMutation.isPending}
              className="flex-1"
            >
              {updateContactMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}