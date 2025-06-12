'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { loginCandidatoSchema, tLoginCandidato } from '@/schemas/usuarioSchema';

export default function FormLoginCandidato() {
  const router = useRouter();

  const form = useForm<tLoginCandidato>({
    resolver: zodResolver(loginCandidatoSchema),
    defaultValues: {
      numeroRA: '',
      senha: '',
    },
  });

  const onSubmit = async (data: tLoginCandidato) => {
    try {
      const payload = {
        ...data,
        tipoAcesso: 'candidato',
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.form || result.error || 'RA ou senha inválidos.');
        return;
      }

      toast.success('Login realizado com sucesso!');
      router.push('/candidato/dashboard');
    } catch (error) {
      console.error('Erro no login do candidato:', error);
      toast.error('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-6'>
        <FormField
          control={form.control}
          name='numeroRA'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='Número de RA'
                  id='numeroRA'
                  inputMode='numeric'
                  autoComplete='username'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
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
                <FloatingLabelInput
                  label='Senha'
                  id='senhaCandidato'
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
