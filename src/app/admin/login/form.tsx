'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { loginAdminSchema, tLoginAdmin } from '@/schemas/usuarioSchema';

export default function FormLoginAdmin() {
  const router = useRouter();

  const form = useForm<tLoginAdmin>({
    resolver: zodResolver(loginAdminSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: tLoginAdmin) => {
    try {
      const payload = {
        ...data,
        tipoAcesso: 'admin',
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.form || result.error || 'E-mail ou senha inválidos, ou acesso não permitido.');
        return;
      }

      toast.success('Login administrativo realizado com sucesso!');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Erro no login administrativo:', error);
      toast.error('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='E-mail de Administrador'
                  id='emailAdmin'
                  type='email'
                  autoComplete='username'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='senha'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Senha' id='senhaAdmin' type='password' autoComplete='current-password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={form.formState.isSubmitting} variant='default' className='w-full cursor-pointer mt-4'>
          {form.formState.isSubmitting ? 'Entrando...' : 'Acessar Painel Admin'}
        </Button>
      </form>
    </Form>
  );
}
