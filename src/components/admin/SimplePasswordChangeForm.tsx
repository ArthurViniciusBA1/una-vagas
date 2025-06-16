'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { mudarSenhaAdminSchema, tMudarSenhaAdmin } from '@/schemas/adminSchema';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { adminMudarSenhaUsuarioAction } from '@/actions/adminActions';
import { FloatingLabelInput } from '../custom/FloatingLabelInput';

interface SimplePasswordChangeFormProps {
  usuarioId: string;
  setDialogOpen: (open: boolean) => void;
}

export function SimplePasswordChangeForm({
  usuarioId,
  setDialogOpen,
}: SimplePasswordChangeFormProps) {
  const form = useForm<tMudarSenhaAdmin>({
    resolver: zodResolver(mudarSenhaAdminSchema),
    defaultValues: { novaSenha: '', confirmarNovaSenha: '' },
  });

  const onSubmit = async (data: tMudarSenhaAdmin) => {
    const toastId = toast.loading('Alterando senha...');
    const result = await adminMudarSenhaUsuarioAction(usuarioId, data.novaSenha);

    if (result.success) {
      toast.success('Senha alterada com sucesso!', { id: toastId });
      setDialogOpen(false);
    } else {
      toast.error(result.error || 'Falha ao alterar senha.', { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='novaSenha'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Nova Senha' id='novaSenha' type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmarNovaSenha'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='Confirmar Nova Senha'
                  id='confirmarNovaSenha'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Confirmar Alteração
          </Button>
        </div>
      </form>
    </Form>
  );
}
