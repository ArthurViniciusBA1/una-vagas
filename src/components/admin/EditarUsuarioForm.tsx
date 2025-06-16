'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Empresa, RoleUsuario } from '@prisma/client';

import { editarUsuarioSchema, tEditarUsuario } from '@/schemas/adminSchema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminEditarUsuarioAction } from '@/actions/adminActions';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface EditarUsuarioFormProps {
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: RoleUsuario;
    empresaId?: string | null;
  };
  empresas: Pick<Empresa, 'id' | 'nome'>[];
  setDialogOpen: (open: boolean) => void;
  onUserUpdate: () => void;
}

export function EditarUsuarioForm({
  usuario,
  empresas,
  setDialogOpen,
  onUserUpdate,
}: EditarUsuarioFormProps) {
  const form = useForm<tEditarUsuario>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId || '',
    },
  });

  const roleSelecionada = useWatch({
    control: form.control,
    name: 'role',
  });

  const onSubmit = async (data: tEditarUsuario) => {
    const toastId = toast.loading('Salvando alterações...');
    const result = await adminEditarUsuarioAction(data);

    if (result.success) {
      toast.success('Usuário atualizado com sucesso!', { id: toastId });
      onUserUpdate();
      setDialogOpen(false);
    } else {
      toast.error(result.error || 'Falha ao salvar.', { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='nome'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Conta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RoleUsuario).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {roleSelecionada === 'RECRUTADOR' && (
          <FormField
            control={form.control}
            name='empresaId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecione uma empresa...' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}
