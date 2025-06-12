'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Idioma, NivelProficiencia } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveIdiomaAction } from '@/actions/curriculoParcialActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCandidato } from '@/context/CandidatoContext';
import { idiomaSchema, tIdioma } from '@/schemas/curriculoSchema';

interface IdiomaFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Idioma | null;
}

const defaultFormValues: tIdioma = {
  id: undefined,
  nome: '',
  nivel: NivelProficiencia.INICIANTE,
  curriculoId: undefined,
};

export function IdiomaForm({ setModalOpen, dadosIniciais }: IdiomaFormProps) {
  const { fetchCandidatoData } = useCandidato();
  const form = useForm<tIdioma>({
    resolver: zodResolver(idiomaSchema),
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

  const onSubmit = async (data: tIdioma) => {
    toast.promise(saveIdiomaAction(data), {
      loading: 'Salvando...',
      success: (res) => {
        if (res.success) {
          fetchCandidatoData();
          setModalOpen(false);
          return 'Idioma salvo com sucesso!';
        }
        throw new Error(res.error);
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-2 pb-4'>
        <FormField
          control={control}
          name='nome'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Idioma (Ex: Inglês, Espanhol)' id='nomeIdioma' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='nivel'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o seu nível de proficiência' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(NivelProficiencia).map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              'Atualizar Idioma'
            ) : (
              'Adicionar Idioma'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
