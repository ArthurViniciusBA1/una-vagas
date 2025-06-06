"use client";

import React, { useEffect } from 'react';
import { useCandidato } from '@/context/CandidatoContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  curriculoInformacoesPessoaisSchema, 
  tCurriculoInformacoesPessoais 
} from "@/schemas/curriculoSchema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Loader2 } from 'lucide-react';

interface InformacoesPessoaisFormProps {
  setModalOpen: (isOpen: boolean) => void;
}

export function InformacoesPessoaisForm({ setModalOpen }: InformacoesPessoaisFormProps) {
  const { curriculo, updateInformacoesPessoais } = useCandidato();

  const form = useForm<tCurriculoInformacoesPessoais>({
    resolver: zodResolver(curriculoInformacoesPessoaisSchema),
    defaultValues: {
      tituloCurriculo: curriculo?.tituloCurriculo || "",
      resumoProfissional: curriculo?.resumoProfissional || "",
      telefone: curriculo?.telefone || "",
      enderecoCompleto: curriculo?.enderecoCompleto || "",
      linkedinUrl: curriculo?.linkedinUrl || "",
      githubUrl: curriculo?.githubUrl || "",
      portfolioUrl: curriculo?.portfolioUrl || "",
    },
  });

  useEffect(() => {
    form.reset({
      tituloCurriculo: curriculo?.tituloCurriculo || "",
      resumoProfissional: curriculo?.resumoProfissional || "",
      telefone: curriculo?.telefone || "",
      enderecoCompleto: curriculo?.enderecoCompleto || "",
      linkedinUrl: curriculo?.linkedinUrl || "",
      githubUrl: curriculo?.githubUrl || "",
      portfolioUrl: curriculo?.portfolioUrl || "",
    });
  }, [curriculo, form.reset]);

  const onSubmit = async (data: tCurriculoInformacoesPessoais) => {
    try {
      await updateInformacoesPessoais(data);
      setModalOpen(false); 
    } catch (error) {
      console.error("Falha ao submeter o formulário de informações pessoais:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="tituloCurriculo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Título do Currículo" id="tituloCurriculoModal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="resumoProfissional"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea 
                  label="Resumo Profissional / Sobre Mim" 
                  id="resumoProfissionalModal" 
                  rows={5} 
                  placeholder=" "
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Telefone (com DDD)" id="telefoneModal" type="tel" {...field} inputMode='numeric' autoComplete='tel'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enderecoCompleto"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="Endereço (Ex: Cidade - UF)" id="enderecoCompletoModal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="URL do LinkedIn (opcional)" id="linkedinUrlModal" type="url" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="URL do GitHub (opcional)" id="githubUrlModal" type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label="URL do Portfólio (opcional)" id="portfolioUrlModal" type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : "Salvar Informações"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}