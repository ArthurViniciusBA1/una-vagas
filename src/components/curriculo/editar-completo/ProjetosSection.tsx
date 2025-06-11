"use client";

import { Control, UseFormRegister, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";
import { PlusCircle, Trash2 } from "lucide-react";
import { FloatingLabelTextarea } from "@/components/custom/FloatingLabelTextarea";

interface ProjetosSectionProps {
    control: Control<tCurriculoCompleto>;
    register: UseFormRegister<tCurriculoCompleto>;
}

export function ProjetosSection({ control, register }: ProjetosSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "projetos",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Projetos</h2>
                {/* CORREÇÃO: Passando o objeto completo para o append */}
                <Button type="button" variant="outline" onClick={() => append({ nome: '', descricao: '', projectUrl: '', repositorioUrl: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Projeto
                </Button>
            </div>

            <div className="space-y-8">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-6 border rounded-lg relative space-y-4">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                        <FormField control={control} name={`projetos.${index}.nome`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`projeto-nome-${index}`} label="Nome do Projeto" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                        <FormField control={control} name={`projetos.${index}.descricao`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelTextarea id={`projeto-desc-${index}`} label="Descrição (Opcional)" rows={3} {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={control} name={`projetos.${index}.projectUrl`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`projeto-url-${index}`} label="URL do Projeto (Opcional)" type="url" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`projetos.${index}.repositorioUrl`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`projeto-repo-${index}`} label="URL do Repositório (Opcional)" type="url" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}