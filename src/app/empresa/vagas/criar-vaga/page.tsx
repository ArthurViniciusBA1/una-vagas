// src/app/empresa/vagas/criar-vaga/page.tsx
'use client';

import { BriefcaseBusiness, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { TipoVaga } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { saveVagaAction } from '@/actions/vagaActions'; // Importa a Server Action de salvar vaga
import { vagaFormSchema, tVagaForm } from '@/schemas/vagaSchema'; // Importa o schema e tipo do formulário

// Valores padrão para o formulário de criação
const defaultValues: tVagaForm = {
  titulo: '',
  descricao: '',
  requisitos: '', // Requisitos como string para o form
  tipo: TipoVaga.EFETIVO, // Default
  localizacao: '',
  faixaSalarial: '',
  ativa: true,
  dataExpiracao: '', // Data como string para o form
  // empresaId e criadoPorId são preenchidos na Server Action
  // id é undefined para criação
};

export default function CriarVagaPage() {
  const router = useRouter();

  const form = useForm<tVagaForm>({
    resolver: zodResolver(vagaFormSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: tVagaForm) => {
    const toastId = toast.loading('Publicando vaga...');
    try {
      const result = await saveVagaAction(data); // Chama a Server Action

      if (result.success) {
        toast.success('Vaga publicada com sucesso!', { id: toastId });
        form.reset(); // Limpa o formulário
        router.push('/empresa/vagas'); // Redireciona para a lista de vagas
      } else {
        // Se houver um erro de validação (Zod) da Server Action, ele estará em result.error
        toast.error(result.error || 'Falha ao publicar vaga.', { id: toastId });
      }
    } catch (error) {
      console.error('Erro ao submeter formulário de vaga:', error);
      toast.error('Ocorreu um erro inesperado ao publicar a vaga.', { id: toastId });
    }
  };

  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <BriefcaseBusiness size={32} /> Publicar Nova Vaga
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>Preencha os detalhes para divulgar uma nova oportunidade.</p>
      </header>

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
                  <FloatingLabelTextarea label='Descrição Detalhada da Vaga' id='descricaoVaga' rows={8} {...field} />
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
                <FormItem>
                  <FormLabel>Tipo de Vaga</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o tipo de vaga' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TipoVaga).map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
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
                    <FloatingLabelInput label='Localização (Ex: Remoto, Cidade - UF)' id='localizacaoVaga' {...field} />
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
                      label='Faixa Salarial (Opcional, Ex: R$ 3.000 - 5.000)'
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
                    <FloatingLabelInput label='Data de Expiração (Opcional)' id='dataExpiracaoVaga' type='date' {...field} />
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
              <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-3 h-10'>
                <FormControl>
                  <input
                    type='checkbox'
                    id='ativaVaga'
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className='h-4 w-4 rounded border-primary text-primary focus:ring-primary'
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel htmlFor='ativaVaga' className='cursor-pointer'>
                    Vaga Ativa (disponível para candidaturas)
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end gap-4 mt-8'>
            <Button type='button' variant='outline' asChild>
              <Link href='/empresa/dashboard'>Cancelar</Link>
            </Button>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Publicando...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' /> Publicar Vaga
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
