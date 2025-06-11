"use client";

import { Control, UseFormRegister, useFieldArray, UseFormWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";
import { PlusCircle, Trash2 } from "lucide-react";
import { FloatingLabelTextarea } from "@/components/custom/FloatingLabelTextarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ExperienciasSectionProps {
    control: Control<tCurriculoCompleto>;
    register: UseFormRegister<tCurriculoCompleto>;
    watch: UseFormWatch<tCurriculoCompleto>;
}

export function ExperienciasSection({ control, register, watch }: ExperienciasSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "experienciasProfissionais",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Experiência Profissional</h2>
                <Button type="button" variant="outline" onClick={() => append({ cargo: '', nomeEmpresa: '', dataInicio: '', trabalhoAtual: false, localidade: '', dataFim: '', descricao: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Experiência
                </Button>
            </div>

            <div className="space-y-8">
                {fields.map((field, index) => {
                    // Correção: usamos watch para observar o valor do checkbox
                    const trabalhoAtual = watch(`experienciasProfissionais.${index}.trabalhoAtual`);
                    return (
                    <div key={field.id} className="p-6 border rounded-lg relative space-y-4">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={control} name={`experienciasProfissionais.${index}.cargo`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`exp-cargo-${index}`} label="Cargo" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`experienciasProfissionais.${index}.nomeEmpresa`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`exp-empresa-${index}`} label="Empresa" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`experienciasProfissionais.${index}.localidade`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`exp-local-${index}`} label="Localidade" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`experienciasProfissionais.${index}.dataInicio`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`exp-data-inicio-${index}`} label="Data de Início" type="month" {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`experienciasProfissionais.${index}.dataFim`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelInput id={`exp-data-fim-${index}`} label="Data de Fim" type="month" disabled={trabalhoAtual} {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                            <FormField control={control} name={`experienciasProfissionais.${index}.trabalhoAtual`} render={({ field: formField }) => (
                                <FormItem className="flex items-center h-10 mt-auto">
                                    <FormControl>
                                        <Checkbox id={`exp-atual-${index}`} checked={formField.value} onCheckedChange={formField.onChange}/>
                                    </FormControl>
                                    <Label htmlFor={`exp-atual-${index}`} className="ml-2">Trabalho aqui atualmente</Label>
                                </FormItem>
                             )}/>
                        </div>
                        <FormField control={control} name={`experienciasProfissionais.${index}.descricao`} render={({ field: formField }) => ( <FormItem> <FormControl> <FloatingLabelTextarea id={`exp-desc-${index}`} label="Descrição" rows={4} {...formField}/> </FormControl> <FormMessage/> </FormItem> )}/>
                    </div>
                )})}
            </div>
        </div>
    );
}