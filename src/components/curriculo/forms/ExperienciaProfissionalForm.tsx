"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { SubmitHandler,useForm } from "react-hook-form";

import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose,DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel,FormMessage } from "@/components/ui/form";
import { useCandidato } from '@/context/CandidatoContext';
import { experienciaProfissionalSchema, tExperienciaProfissional } from "@/schemas/curriculoSchema";

interface ExperienciaProfissionalFormProps {
  setModalOpen: (isOpen: boolean) => void;
  // A prop agora espera os dados no mesmo formato do schema do formulário
  dadosIniciais?: Partial<tExperienciaProfissional> | null;
}

const defaultFormValues: tExperienciaProfissional = {
  id: undefined,
  cargo: "",
  nomeEmpresa: "",
  localidade: "",
  dataInicio: "",
  dataFim: "",
  trabalhoAtual: false,
  descricao: "",
};

export function ExperienciaProfissionalForm({ setModalOpen, dadosIniciais }: ExperienciaProfissionalFormProps) {
  const { saveExperiencia } = useCandidato();
  const form = useForm<tExperienciaProfissional>({
    resolver: zodResolver(experienciaProfissionalSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, watch, formState, control, handleSubmit } = form;

  const trabalhoAtual = watch("trabalhoAtual");

  // O useEffect agora fica muito mais simples!
  // Ele só precisa popular o formulário, pois os dados já vêm formatados.
  useEffect(() => {
    if (dadosIniciais) {
      reset(dadosIniciais);
    } else {
      reset(defaultFormValues);
    }
  }, [dadosIniciais, reset]);

  const onSubmit: SubmitHandler<tExperienciaProfissional> = async (data) => {
    try {
      const payload = data.trabalhoAtual ? { ...data, dataFim: '' } : data;
      await saveExperiencia(payload);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de experiência:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4">
        <FormField control={control} name="cargo" render={({ field }) => (
            <FormItem><FormControl><FloatingLabelInput label="Cargo (Ex: Estagiário de TI)" id="cargoExp" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={control} name="nomeEmpresa" render={({ field }) => (
            <FormItem><FormControl><FloatingLabelInput label="Empresa" id="empresaExp" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={control} name="localidade" render={({ field }) => (
            <FormItem><FormControl><FloatingLabelInput label="Localidade (Ex: Cidade - UF ou Remoto)" id="localidadeExp" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="dataInicio" render={({ field }) => (
              <FormItem><FormControl><FloatingLabelInput label="Data de Início" id="dataInicioExp" type="month" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={control} name="dataFim" render={({ field }) => (
              <FormItem><FormControl><FloatingLabelInput label="Data de Fim" id="dataFimExp" type="month" {...field} disabled={trabalhoAtual} /></FormControl><FormMessage /></FormItem>
          )}/>
        </div>
        <FormField control={control} name="trabalhoAtual" render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm h-10">
              <FormControl><Checkbox id="trabalhoAtualExp" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel htmlFor="trabalhoAtualExp" className="cursor-pointer">Trabalho Atual</FormLabel>
            </FormItem>
        )}/>
        <FormField control={control} name="descricao" render={({ field }) => (
            <FormItem><FormControl><FloatingLabelTextarea label="Descrição (responsabilidades, etc.)" id="descricaoExp" rows={5} {...field} /></FormControl><FormMessage /></FormItem>
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