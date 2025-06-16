'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';

import { tEmpresaForm, empresaFormSchema } from '@/schemas/empresaSchema';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { updateEmpresaAction } from '@/actions/empresaActions';
import { InputMask } from '@react-input/mask';

export function EmpresaProfileForm({ initialData }: { initialData: any }) {
  const form = useForm<tEmpresaForm>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      id: initialData?.id || '',
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      cnpj: initialData?.cnpj || '',
      websiteUrl: initialData?.websiteUrl || '',
      logoUrl: initialData?.logoUrl || '',
    },
  });

  const onSubmit = async (data: tEmpresaForm) => {
    const toastId = toast.loading('Salvando alterações...');
    const result = await updateEmpresaAction(data);

    if (result.success) {
      toast.success('Perfil da empresa atualizado com sucesso!', { id: toastId });
    } else {
      toast.error(result.error || 'Falha ao salvar.', { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='nome'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Nome da Empresa' id='nome' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='descricao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Descrição / Sobre a Empresa'
                  id='descricao'
                  rows={5}
                  {...field}
                />
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
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <InputMask
                  {...field}
                  mask='__.___.___/____-__'
                  replacement={{ _: /\d/ }}
                  className='flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='websiteUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Website URL' id='websiteUrl' type='url' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='logoUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='URL do Logo' id='logoUrl' type='url' {...field} />
              </FormControl>
              <FormDescription>
                Insira o link para uma imagem do logo da sua empresa.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end gap-4 pt-4'>
          <Button type='button' variant='outline' asChild>
            <Link href='/empresa/dashboard'>Cancelar</Link>
          </Button>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}
