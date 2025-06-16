'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { InputMask } from '@react-input/mask';

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
import { adminEditarEmpresaAction } from '@/actions/adminActions';
import { empresaFormSchema, tEmpresaForm } from '@/schemas/adminSchema';

interface EditarEmpresaFormProps {
  empresa: any;
  setDialogOpen: (open: boolean) => void;
  onEmpresaUpdate: () => void;
}

export function EditarEmpresaForm({
  empresa,
  setDialogOpen,
  onEmpresaUpdate,
}: EditarEmpresaFormProps) {
  const form = useForm<tEmpresaForm>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      id: empresa.id,
      nome: empresa.nome || '',
      cnpj: empresa.cnpj || '',
      descricao: empresa.descricao || '',
      websiteUrl: empresa.websiteUrl || '',
      logoUrl: empresa.logoUrl || '',
    },
  });

  const onSubmit = async (data: tEmpresaForm) => {
    const toastId = toast.loading('Salvando alterações...');
    const result = await adminEditarEmpresaAction(data);

    if (result.success) {
      toast.success('Empresa atualizada com sucesso!', { id: toastId });
      onEmpresaUpdate();
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
