'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { InputMask } from '@react-input/mask';

import { novaEmpresaSchema, tNovaEmpresa } from '@/schemas/adminSchema';
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
import { criarEmpresaComRecrutadorAction } from '@/actions/adminActions';
import { Separator } from '@/components/ui/separator';

export function NovaEmpresaForm({ setDialogOpen }: { setDialogOpen: () => void }) {
  const form = useForm<tNovaEmpresa>({
    resolver: zodResolver(novaEmpresaSchema),
    defaultValues: {
      nomeEmpresa: '',
      cnpj: '',
      nomeRecrutador: '',
      emailRecrutador: '',
      senhaRecrutador: '',
    },
  });

  const onSubmit = async (data: tNovaEmpresa) => {
    const toastId = toast.loading('Criando empresa e recrutador...');
    const result = await criarEmpresaComRecrutadorAction(data);

    if (result.success) {
      toast.success('Empresa e recrutador criados com sucesso!', { id: toastId });
      setDialogOpen();
      form.reset();
    } else {
      toast.error(result.error || 'Falha ao criar empresa.', { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <h4 className='font-semibold text-lg'>Dados da Empresa</h4>
        <FormField
          control={form.control}
          name='nomeEmpresa'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='cnpj'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ (Opcional)</FormLabel>
              <FormControl>
                <InputMask
                  {...field}
                  mask='__.___.___/____-__'
                  replacement={{ _: /\d/ }}
                  className='w-full border-input flex h-10 rounded-md border bg-transparent px-3 py-2 text-sm'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator className='my-6' />
        <h4 className='font-semibold text-lg'>Dados do Recrutador Inicial</h4>
        <FormField
          control={form.control}
          name='nomeRecrutador'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Recrutador</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='emailRecrutador'
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail do Recrutador</FormLabel>
              <FormControl>
                <Input type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='senhaRecrutador'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha Provisória</FormLabel>
              <FormControl>
                <Input type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Criar Empresa
          </Button>
        </div>
      </form>
    </Form>
  );
}
