'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Habilidade } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveHabilidadeAction } from '@/actions/curriculoParcialActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useCandidato } from '@/context/CandidatoContext';
import { habilidadeSchema, tHabilidade } from '@/schemas/curriculoSchema';

interface HabilidadeFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Habilidade | null;
}

const defaultFormValues: tHabilidade = {
  id: undefined,
  nome: '',
  curriculoId: undefined,
};

export function HabilidadeForm({ setModalOpen, dadosIniciais }: HabilidadeFormProps) {
  const { fetchCandidatoData } = useCandidato();
  const form = useForm<tHabilidade>({
    resolver: zodResolver(habilidadeSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, formState, control, handleSubmit } = form;

  useEffect(() => {
    if (dadosIniciais) {
      reset(dadosIniciais);
    } else {
      reset(defaultFormValues);
    }
  }, [dadosIniciais, reset]);

  const onSubmit = async (data: tHabilidade) => {
    toast.promise(saveHabilidadeAction(data), {
      loading: 'Salvando...',
      success: (res) => {
        if (res.success) {
          fetchCandidatoData();
          setModalOpen(false);
          return 'Habilidade salva com sucesso!';
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
          name='nome'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Nome da Habilidade (Ex: React, Photoshop)' id='nomeHabilidade' {...field} />
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
              'Atualizar Habilidade'
            ) : (
              'Adicionar Habilidade'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
