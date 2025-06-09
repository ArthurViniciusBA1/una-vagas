"use client";

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCandidato } from '@/context/CandidatoContext';
import { certificacaoSchema, tCertificacao } from "@/schemas/curriculoSchema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { Loader2 } from 'lucide-react';

interface CertificacaoFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Partial<tCertificacao> | null;
}

const defaultFormValues: tCertificacao = {
  id: undefined,
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

  useEffect(() => {
    const valuesToSet = dadosIniciais 
      ? { ...dadosIniciais, dataEmissao: new Date(dadosIniciais.dataEmissao!).toISOString().substring(0, 7) } 
      : defaultFormValues;
    reset(valuesToSet);
  }, [dadosIniciais, reset]);

  const onSubmit: SubmitHandler<tCertificacao> = async (data) => {
    try {
      await saveCertificacao(data);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de certificação:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4">
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Nome do Certificado ou Curso" id="nomeCertificado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="organizacaoEmissora"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Organização Emissora (Ex: Alura, Udemy)" id="orgCertificado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="dataEmissao"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Data de Emissão" id="dataCertificado" type="month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="credencialUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="URL da Credencial (Opcional)" id="urlCertificado" type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (dadosIniciais?.id ? "Atualizar" : "Adicionar")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}