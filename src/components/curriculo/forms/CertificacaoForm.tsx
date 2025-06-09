"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";

import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCandidato } from '@/context/CandidatoContext';
import { certificacaoSchema, tCertificacao } from "@/schemas/curriculoSchema";
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';

interface CertificacaoFormProps {
  setModalOpen: (isOpen: boolean) => void;
  // A prop agora espera receber os dados no mesmo formato do schema do formulário
  dadosIniciais?: Partial<tCertificacao> | null;
}

const defaultFormValues: tCertificacao = {
  nome: "",
  organizacaoEmissora: "",
  dataEmissao: "",
  credencialUrl: "",
};

export function CertificacaoForm({ setModalOpen, dadosIniciais }: CertificacaoFormProps) {
  const { saveCertificacao } = useCandidato();
  const form = useForm<tCertificacao>({
    resolver: zodResolver(certificacaoSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, formState, control, handleSubmit } = form;

  // O useEffect agora é simples: apenas popula o formulário com os dados já formatados.
  useEffect(() => {
    if (dadosIniciais) {
      reset(dadosIniciais);
    } else {
      reset(defaultFormValues);
    }
  }, [dadosIniciais, reset]);

  const onSubmit: SubmitHandler<tCertificacao> = async (data) => {
    try {
      // Transforma a string vazia de volta para undefined antes de enviar para a API
      const payload = {
        ...data,
        credencialUrl: data.credencialUrl || undefined,
      };
      await saveCertificacao(payload);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de certificação:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4">
        <FormField control={control} name="nome" render={({ field }) => ( <FormItem> <FormControl> <FloatingLabelInput label="Nome do Certificado ou Curso" id="nomeCertificado" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={control} name="organizacaoEmissora" render={({ field }) => ( <FormItem> <FormControl> <FloatingLabelInput label="Organização Emissora (Ex: Alura, Udemy)" id="orgCertificado" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={control} name="dataEmissao" render={({ field }) => ( <FormItem> <FormControl> <FloatingLabelInput label="Data de Emissão" id="dataCertificado" type="month" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={control} name="credencialUrl" render={({ field }) => ( <FormItem> <FormControl> <FloatingLabelInput label="URL da Credencial (Opcional)" id="urlCertificado" type="url" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <DialogFooter className="pt-4">
          <DialogClose asChild> <Button type="button" variant="outline">Cancelar</Button> </DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : (dadosIniciais?.id ? "Atualizar" : "Adicionar")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}