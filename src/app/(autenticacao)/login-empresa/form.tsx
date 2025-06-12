'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { loginEmpresaSchema, tLoginEmpresa } from '@/schemas/usuarioSchema';
export default function FormLoginEmpresa() {
  const router = useRouter();

  const form = useForm<tLoginEmpresa>({
    resolver: zodResolver(loginEmpresaSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: tLoginEmpresa) => {
    try {
      const payload = {
        ...data,
        tipoAcesso: 'empresa',
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

      toast.success('Login realizado com sucesso!');
      router.push('/empresa/dashboard');
    } catch (error) {
      console.error('Erro no login da empresa:', error);
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
                <FloatingLabelInput label='E-mail corporativo' id='emailEmpresa' type='email' autoComplete='email' {...field} />
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
                <FloatingLabelInput
                  label='Senha'
                  id='senhaEmpresa'
                  type='password'
                  autoComplete='current-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={form.formState.isSubmitting} variant='default' className='w-full cursor-pointer mt-4'>
          {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Form>
  );
}
