"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { SubmitHandler,useForm } from "react-hook-form";

import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { Button } from "@/components/ui/button";
import { DialogClose,DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCandidato } from '@/context/CandidatoContext';
import { habilidadeSchema, tHabilidade } from "@/schemas/curriculoSchema";

interface HabilidadeFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Partial<tHabilidade> | null;
}

const defaultFormValues: tHabilidade = {
  id: undefined,
  nome: "",
};

export function HabilidadeForm({ setModalOpen, dadosIniciais }: HabilidadeFormProps) {
  const { saveHabilidade } = useCandidato();
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

  const onSubmit: SubmitHandler<tHabilidade> = async (data) => {
    try {
      await saveHabilidade(data);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de habilidade:", error);
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
                <FloatingLabelInput label="Nome da Habilidade (Ex: React, Photoshop)" id="nomeHabilidade" {...field} />
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
            ) : (dadosIniciais?.id ? "Atualizar Habilidade" : "Adicionar Habilidade")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}