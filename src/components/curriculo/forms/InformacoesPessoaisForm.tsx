'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputMask } from '@react-input/mask';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCandidato } from '@/context/CandidatoContext';
import {
  curriculoInformacoesPessoaisSchema,
  tCurriculoInformacoesPessoais,
} from '@/schemas/curriculoSchema';

interface InformacoesPessoaisFormProps {
  setModalOpen: (isOpen: boolean) => void;
}

export function InformacoesPessoaisForm({ setModalOpen }: InformacoesPessoaisFormProps) {
  const { curriculo, updateInformacoesPessoais } = useCandidato();

  const form = useForm<tCurriculoInformacoesPessoais>({
    resolver: zodResolver(curriculoInformacoesPessoaisSchema),
    defaultValues: {
      titulo: '',
      resumoProfissional: '',
      telefone: '',
      endereco: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
    },
  });

  useEffect(() => {
    if (curriculo) {
      form.reset({
        titulo: curriculo.titulo ?? '',
        resumoProfissional: curriculo.resumoProfissional ?? '',
        telefone: curriculo.telefone ?? '',
        endereco: curriculo.endereco ?? '',
        linkedinUrl: curriculo.linkedinUrl ?? '',
        githubUrl: curriculo.githubUrl ?? '',
        portfolioUrl: curriculo.portfolioUrl ?? '',
      });
    }
  }, [curriculo, form, form.reset]);

  const onSubmit = async (data: tCurriculoInformacoesPessoais) => {
    try {
      await updateInformacoesPessoais(data);
      setModalOpen(false);
    } catch (error) {
      console.error('Falha ao submeter o formulário de informações pessoais:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
        <FormField
          control={form.control}
          name='titulo'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Título do Currículo' id='tituloModal' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='resumoProfissional'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Resumo Profissional / Sobre Mim'
                  id='resumoProfissionalModal'
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
          name='telefone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (com DDD)</FormLabel>
              <FormControl>
                <InputMask
                  {...field}
                  mask='(__) _ ____-____'
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
          name='endereco'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='Endereço (Ex: Cidade - UF)'
                  id='enderecoModal'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='linkedinUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL do LinkedIn (opcional)'
                  id='linkedinUrlModal'
                  type='url'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='githubUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL do GitHub (opcional)'
                  id='githubUrlModal'
                  type='url'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='portfolioUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL do Portfólio (opcional)'
                  id='portfolioUrlModal'
                  type='url'
                  {...field}
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
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Salvando...
              </>
            ) : (
              'Salvar Informações'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
