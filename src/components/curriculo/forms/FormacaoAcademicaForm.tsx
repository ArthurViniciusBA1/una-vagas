'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormacaoAcademica } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveFormacaoAction } from '@/actions/curriculoParcialActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCandidato } from '@/context/CandidatoContext';
import { formacaoAcademicaSchema, tFormacaoAcademica } from '@/schemas/curriculoSchema';

interface FormacaoAcademicaFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: FormacaoAcademica | null;
}

const defaultFormValues: tFormacaoAcademica = {
  id: undefined,
  instituicao: '',
  curso: '',
  areaEstudo: '',
  dataInicio: '',
  dataFim: '',
  emCurso: false,
  descricao: '',
};

export function FormacaoAcademicaForm({ setModalOpen, dadosIniciais }: FormacaoAcademicaFormProps) {
  const { fetchCandidatoData } = useCandidato();
  const form = useForm<tFormacaoAcademica>({
    resolver: zodResolver(formacaoAcademicaSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, watch, formState, control, handleSubmit } = form;

  useEffect(() => {
    if (dadosIniciais) {
      const valoresParaFormulario = {
        id: dadosIniciais.id,
        instituicao: dadosIniciais.instituicao,
        curso: dadosIniciais.curso,
        areaEstudo: dadosIniciais.areaEstudo ?? '',
        dataInicio: new Date(dadosIniciais.dataInicio).toISOString().substring(0, 7),
        dataFim: dadosIniciais.dataFim ? new Date(dadosIniciais.dataFim).toISOString().substring(0, 7) : '',
        emCurso: dadosIniciais.emCurso,
        descricao: dadosIniciais.descricao ?? '',
      };
      reset(valoresParaFormulario);
    } else {
      reset(defaultFormValues);
    }
  }, [dadosIniciais, reset]);

  const emCurso = watch('emCurso');

  const onSubmit = async (data: tFormacaoAcademica) => {
    const payload = data.emCurso ? { ...data, dataFim: '' } : data;

    toast.promise(saveFormacaoAction(payload), {
      loading: 'Salvando formação...',
      success: (res) => {
        if (res.success) {
          fetchCandidatoData();
          setModalOpen(false);
          return 'Formação salva com sucesso!';
        }
        throw new Error(res.error);
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2 pb-4'>
        <FormField
          control={control}
          name='instituicao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Instituição de Ensino' id='instituicao' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='curso'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Curso (Ex: Ciência da Computação)' id='curso' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='areaEstudo'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Área de Estudo (Opcional)' id='areaEstudo' {...field} value={field.value ?? ''} />
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
                  <FloatingLabelInput
                    label='Data de Início'
                    id='dataInicioFormacao'
                    type='month'
                    {...field}
                    value={field.value ?? ''}
                  />
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
                  <FloatingLabelInput
                    label='Data de Conclusão'
                    id='dataFimFormacao'
                    type='month'
                    {...field}
                    value={field.value ?? ''}
                    disabled={emCurso}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name='emCurso'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-3 h-10'>
              <FormControl>
                <Checkbox id='emCurso' checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel htmlFor='emCurso' className='cursor-pointer'>
                  Ainda estou cursando
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {/* CORREÇÃO: Removido o parêntese extra no final da linha abaixo */}
        <FormField
          control={control}
          name='descricao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Descrição (opcional)'
                  id='descricaoFormacao'
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
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
