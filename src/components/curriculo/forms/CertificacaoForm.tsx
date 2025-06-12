'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Certificacao } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveCertificacaoAction } from '@/actions/curriculoParcialActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useCandidato } from '@/context/CandidatoContext';
import { certificacaoSchema, tCertificacao } from '@/schemas/curriculoSchema';

interface CertificacaoFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Certificacao | null;
}

const defaultFormValues: tCertificacao = {
  id: undefined,
  nome: '',
  organizacaoEmissora: '',
  dataEmissao: '',
  credencialUrl: '',
  credencialId: '',
};

export function CertificacaoForm({ setModalOpen, dadosIniciais }: CertificacaoFormProps) {
  const { fetchCandidatoData } = useCandidato();
  const form = useForm<tCertificacao>({
    resolver: zodResolver(certificacaoSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, formState, control, handleSubmit } = form;

  useEffect(() => {
    if (dadosIniciais) {
      const valoresParaFormulario = {
        id: dadosIniciais.id,
        nome: dadosIniciais.nome,
        organizacaoEmissora: dadosIniciais.organizacaoEmissora,
        dataEmissao: new Date(dadosIniciais.dataEmissao).toISOString().substring(0, 7),
        credencialId: dadosIniciais.credencialId ?? '',
        credencialUrl: dadosIniciais.credencialUrl ?? '',
      };
      reset(valoresParaFormulario);
    } else {
      reset(defaultFormValues);
    }
  }, [dadosIniciais, reset]);

  const onSubmit = async (data: tCertificacao) => {
    toast.promise(saveCertificacaoAction(data), {
      loading: 'Salvando certificação...',
      success: (res) => {
        if (res.success) {
          fetchCandidatoData();
          setModalOpen(false);
          return 'Certificação salva com sucesso!';
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
                <FloatingLabelInput label='Nome do Certificado' id='nomeCertificado' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='organizacaoEmissora'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Organização Emissora' id='orgCertificado' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='dataEmissao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='Data de Emissão'
                  id='dataCertificado'
                  type='month'
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* REMOVA O BLOCO ABAIXO (FormField para dataExpiracao) */}
        {/*
        <FormField
          control={control}
          name='dataExpiracao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='Data de Expiração (Opcional)'
                  id='dataExpiracaoCertificado'
                  type='month'
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
        <FormField
          control={control}
          name='credencialUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL da Credencial (Opcional)'
                  id='urlCertificado'
                  type='url'
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
