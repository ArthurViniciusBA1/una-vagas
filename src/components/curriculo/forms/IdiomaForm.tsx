"use client";

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCandidato } from '@/context/CandidatoContext';
import { idiomaSchema, tIdioma } from "@/schemas/curriculoSchema";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { NivelProficiencia } from '@prisma/client';

interface IdiomaFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Partial<tIdioma> | null;
}

const defaultFormValues: tIdioma = {
  id: undefined,
  nome: "",
  nivel: NivelProficiencia.INICIANTE,
};

export function IdiomaForm({ setModalOpen, dadosIniciais }: IdiomaFormProps) {
  const { saveIdioma } = useCandidato();
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

  const onSubmit: SubmitHandler<tIdioma> = async (data) => {
    try {
      await saveIdioma(data);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de idioma:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 pb-4">
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Idioma (Ex: Inglês, Espanhol)" id="nomeIdioma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={control}
            name="nivel"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o seu nível de proficiência" />
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
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (dadosIniciais?.id ? "Atualizar Idioma" : "Adicionar Idioma")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}