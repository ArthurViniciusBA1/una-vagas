"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { SubmitHandler,useForm } from "react-hook-form";
import { z } from "zod";

import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose,DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel,FormMessage } from "@/components/ui/form";
import { useCandidato } from '@/context/CandidatoContext';

const formacaoFormSchema = z.object({
    id: z.string().optional(),
    instituicao: z.string().min(1, "Instituição é obrigatória.").max(100),
    curso: z.string().min(1, "Nome do curso é obrigatório.").max(100),
    areaEstudo: z.string().max(100).optional().or(z.literal('')),
    dataInicio: z.string({ required_error: "Data de início é obrigatória." }).min(7, "Formato inválido."),
    dataFim: z.string().optional().or(z.literal('')),
    emCurso: z.boolean(),
    descricao: z.string().max(2500, "A descrição é muito longa.").optional().or(z.literal('')),
});
type TFormacaoForm = z.infer<typeof formacaoFormSchema>;

interface FormacaoAcademicaFormProps {
  setModalOpen: (isOpen: boolean) => void;
  dadosIniciais?: Partial<TFormacaoForm> | null;
}

const defaultFormValues: TFormacaoForm = {
  id: undefined, instituicao: "", curso: "", areaEstudo: "",
  dataInicio: "", dataFim: "", emCurso: false, descricao: "",
};

export function FormacaoAcademicaForm({ setModalOpen, dadosIniciais }: FormacaoAcademicaFormProps) {
  const { saveFormacao } = useCandidato();
  const form = useForm<TFormacaoForm>({
    resolver: zodResolver(formacaoFormSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, watch, formState, control, handleSubmit } = form;

  useEffect(() => {
    const valuesToSet = dadosIniciais ? { ...defaultFormValues, ...dadosIniciais } : defaultFormValues;
    reset(valuesToSet);
  }, [dadosIniciais, reset]);

  const emCurso = watch("emCurso");

  const onSubmit: SubmitHandler<TFormacaoForm> = async (data) => {
    try {
      const payload = data.emCurso ? { ...data, dataFim: '' } : data;
      await saveFormacao(payload);
      setModalOpen(false);
    } catch (error) {
      console.error("Falha ao submeter o formulário de formação:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4">
        <FormField control={control} name="instituicao" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput label="Instituição de Ensino" id="instituicao" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <FormField control={control} name="curso" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput label="Curso (Ex: Ciência da Computação)" id="curso" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <FormField control={control} name="areaEstudo" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput label="Área de Estudo (Opcional)" id="areaEstudo" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="dataInicio" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput label="Data de Início" id="dataInicioFormacao" type="month" {...field} /></FormControl><FormMessage /></FormItem> )}/>
          <FormField control={control} name="dataFim" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput label="Data de Conclusão" id="dataFimFormacao" type="month" {...field} disabled={emCurso} /></FormControl><FormMessage /></FormItem> )}/>
        </div>
        <FormField control={control} name="emCurso" render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 h-10">
              <FormControl><Checkbox id="emCurso" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none"><FormLabel htmlFor="emCurso" className="cursor-pointer">Ainda estou cursando</FormLabel></div>
            </FormItem>
        )}/>
        <DialogFooter className="pt-4">
          <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : (dadosIniciais?.id ? "Atualizar" : "Adicionar")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}