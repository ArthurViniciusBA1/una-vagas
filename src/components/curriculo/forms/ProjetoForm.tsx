"use client";

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCandidato } from '@/context/CandidatoContext';
import { projetoSchema, tProjeto } from "@/schemas/curriculoSchema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Loader2 } from 'lucide-react';

interface ProjetoFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Partial<tProjeto> | null;
}

const defaultFormValues: tProjeto = {
  id: undefined,
  nome: "",
  descricao: "",
  projectUrl: "",
  repositorioUrl: "",
};

export function ProjetoForm({ setModalOpen, dadosIniciais }: ProjetoFormProps) {
  const { saveProjeto } = useCandidato();
  const form = useForm<tProjeto>({
    resolver: zodResolver(projetoSchema),
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

  const onSubmit: SubmitHandler<tProjeto> = async (data) => {
    try {
      await saveProjeto(data);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de projeto:", error);
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
                <FloatingLabelInput label="Nome do Projeto" id="nomeProjeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea label="Descrição (Opcional)" id="descricaoProjeto" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="projectUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="URL do Projeto (Opcional)" id="urlProjeto" type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="repositorioUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="URL do Repositório (Ex: GitHub) (Opcional)" id="urlRepositorio" type="url" {...field} />
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
            ) : (dadosIniciais?.id ? "Atualizar Projeto" : "Adicionar Projeto")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}