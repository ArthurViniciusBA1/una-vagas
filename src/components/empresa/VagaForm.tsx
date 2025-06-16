'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TipoVaga } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect } from 'react';

import { saveVagaAction } from '@/actions/vagaActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tVagaForm, vagaFormSchema } from '@/schemas/vagaSchema';

interface VagaFormProps {
  dadosIniciais?: Partial<tVagaForm>;
}

export function VagaForm({ dadosIniciais }: VagaFormProps) {
  const router = useRouter();

  const defaultValues: tVagaForm = {
    id: dadosIniciais?.id || undefined,
    titulo: dadosIniciais?.titulo || '',
    descricao: dadosIniciais?.descricao || '',
    requisitos: dadosIniciais?.requisitos || '',
    tipo: dadosIniciais?.tipo || TipoVaga.EFETIVO,
    localizacao: dadosIniciais?.localizacao || '',
    faixaSalarial: dadosIniciais?.faixaSalarial || '',
    ativa: dadosIniciais?.ativa === undefined ? true : dadosIniciais.ativa,
    dataExpiracao: dadosIniciais?.dataExpiracao || '',
  };

  const form = useForm<tVagaForm>({
    resolver: zodResolver(vagaFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [dadosIniciais, form.reset]);

  const onSubmit = async (data: tVagaForm) => {
    const action = dadosIniciais?.id ? 'Salvando alterações...' : 'Publicando vaga...';
    const toastId = toast.loading(action);

    try {
      const result = await saveVagaAction(data);

      if (result.success) {
        toast.success(
          dadosIniciais?.id ? 'Vaga atualizada com sucesso!' : 'Vaga publicada com sucesso!',
          { id: toastId }
        );
        router.push('/empresa/vagas');
        router.refresh(); // Garante que a lista de vagas será atualizada
      } else {
        toast.error(result.error || 'Falha ao salvar a vaga.', { id: toastId });
      }
    } catch (error) {
      console.error('Erro ao submeter formulário de vaga:', error);
      toast.error('Ocorreu um erro inesperado ao salvar a vaga.', { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='titulo'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Título da Vaga' id='tituloVaga' {...field} />
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
                  label='Descrição Detalhada da Vaga'
                  id='descricaoVaga'
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='requisitos'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Requisitos (Separe por vírgula ou nova linha)'
                  id='requisitosVaga'
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='tipo'
            render={({ field }) => (
              <FormItem className='flex flex-col justify-end'>
                <FormLabel>Tipo de Vaga</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecione o tipo de vaga' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TipoVaga).map((tipo) => (
                      <SelectItem key={tipo} value={tipo} className='capitalize'>
                        {tipo.replace(/_/g, ' ').toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='localizacao'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Localização (Ex: Remoto, Cidade - UF)'
                    id='localizacaoVaga'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='faixaSalarial'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Faixa Salarial (Opcional)'
                    id='faixaSalarialVaga'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dataExpiracao'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Data de Expiração (Opcional)'
                    id='dataExpiracaoVaga'
                    type='date'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='ativa'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm'>
              <FormControl>
                <input
                  type='checkbox'
                  id='ativaVaga'
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel htmlFor='ativaVaga' className='cursor-pointer font-medium'>
                  Vaga Ativa
                </FormLabel>
                <p className='text-sm text-muted-foreground'>
                  Marque para permitir que a vaga receba candidaturas.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-4 mt-8'>
          <Button type='button' variant='outline' asChild>
            <Link href='/empresa/vagas'>Cancelar</Link>
          </Button>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Salvando...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                {dadosIniciais?.id ? 'Salvar Alterações' : 'Publicar Vaga'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
