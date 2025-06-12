'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExperienciaProfissional } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveExperienciaAction } from '@/actions/curriculoParcialActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCandidato } from '@/context/CandidatoContext';
import { experienciaProfissionalSchema, tExperienciaProfissional } from '@/schemas/curriculoSchema';

interface ExperienciaProfissionalFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: ExperienciaProfissional | null;
}

const defaultFormValues: tExperienciaProfissional = {
  id: undefined,
  cargo: '',
  nomeEmpresa: '',
  local: '',
  dataInicio: '',
  dataFim: '',
  trabalhoAtual: false,
  descricao: '',
  curriculoId: undefined,
};

export function ExperienciaProfissionalForm({ setModalOpen, dadosIniciais }: ExperienciaProfissionalFormProps) {
  const { fetchCandidatoData } = useCandidato();

  const form = useForm<tExperienciaProfissional>({
    resolver: zodResolver(experienciaProfissionalSchema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, formState, control, watch, reset } = form;

  useEffect(() => {
    if (dadosIniciais) {
      const valoresParaFormulario = {
        id: dadosIniciais.id,
        cargo: dadosIniciais.cargo,
        nomeEmpresa: dadosIniciais.nomeEmpresa,
        local: dadosIniciais.local ?? '',
        dataInicio: new Date(dadosIniciais.dataInicio).toISOString().substring(0, 7),
        dataFim: dadosIniciais.dataFim ? new Date(dadosIniciais.dataFim).toISOString().substring(0, 7) : '',
        trabalhoAtual: dadosIniciais.trabalhoAtual,
        descricao: dadosIniciais.descricao ?? '',
      };
      reset(valoresParaFormulario);
    } else {
      reset(defaultFormValues);
    }
  }, [dadosIniciais, reset]);

  const trabalhoAtual = watch('trabalhoAtual');

  const onSubmit = async (data: tExperienciaProfissional) => {
    toast.promise(saveExperienciaAction(data), {
      loading: 'Salvando experiência...',
      success: (res) => {
        if (res.success) {
          fetchCandidatoData();
          setModalOpen(false);
          return 'Experiência salva com sucesso!';
        }
        throw new Error(res.error);
      },
      error: (err) => err.message || 'Ocorreu um erro ao salvar.',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2 pb-4'>
        <FormField
          control={control}
          name='cargo'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Cargo' id='cargoExp' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='nomeEmpresa'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Empresa' id='empresaExp' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='local'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Localidade (Ex: Cidade - UF)' id='localExp' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='descricao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea label='Descrição' id='descricaoExp' rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={control}
            name='dataInicio'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput label='Data de Início' id='dataInicioExp' type='month' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='dataFim'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput label='Data de Fim' id='dataFimExp' type='month' {...field} disabled={trabalhoAtual} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name='trabalhoAtual'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-3 h-10'>
              {' '}
              <FormControl>
                <Checkbox id='trabalhoAtualExp' checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>{' '}
              <FormLabel htmlFor='trabalhoAtualExp' className='cursor-pointer'>
                Trabalho Atual
              </FormLabel>{' '}
            </FormItem>
          )}
        />
        <DialogFooter className='pt-4'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancelar
            </Button>
          </DialogClose>
          <Button type='submit' disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Salvando...
              </>
            ) : dadosIniciais?.id ? (
              'Atualizar'
            ) : (
              'Adicionar'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
