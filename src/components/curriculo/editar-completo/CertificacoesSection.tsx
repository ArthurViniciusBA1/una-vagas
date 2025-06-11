"use client";

import { Control, UseFormRegister, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";
import { PlusCircle, Trash2 } from "lucide-react";

interface CertificacoesSectionProps {
    control: Control<tCurriculoCompleto>;
    register: UseFormRegister<tCurriculoCompleto>;
}

export function CertificacoesSection({ control, register }: CertificacoesSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "certificacoes",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Certificações e Cursos</h2>
                <Button type="button" variant="outline" onClick={() => append({ nome: '', organizacaoEmissora: '', dataEmissao: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Certificação
                </Button>
            </div>

            <div className="space-y-8">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-6 border rounded-lg relative space-y-4">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={control} name={`certificacoes.${index}.nome`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`cert-nome-${index}`} label="Nome do Certificado" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`certificacoes.${index}.organizacaoEmissora`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`cert-org-${index}`} label="Organização Emissora" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={control} name={`certificacoes.${index}.dataEmissao`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`cert-data-${index}`} label="Data de Emissão" type="month" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`certificacoes.${index}.credencialUrl`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`cert-url-${index}`} label="URL da Credencial (Opcional)" type="url" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}