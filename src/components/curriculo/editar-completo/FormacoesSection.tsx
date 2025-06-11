"use client";

import { Control, UseFormRegister, useFieldArray, UseFormWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";
import { PlusCircle, Trash2 } from "lucide-react";
import { FloatingLabelTextarea } from "@/components/custom/FloatingLabelTextarea";
import { Checkbox } from "@/components/ui/checkbox";

interface FormacoesSectionProps {
    control: Control<tCurriculoCompleto>;
    register: UseFormRegister<tCurriculoCompleto>;
    watch: UseFormWatch<tCurriculoCompleto>;
}

export function FormacoesSection({ control, register, watch }: FormacoesSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "formacoesAcademicas",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Formação Acadêmica</h2>
                <Button type="button" variant="outline" onClick={() => append({ instituicao: '', curso: '', dataInicio: '', emCurso: false, areaEstudo: '', dataFim: '', descricao: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Formação
                </Button>
            </div>

            <div className="space-y-8">
                {fields.map((field, index) => {
                    const emCurso = watch(`formacoesAcademicas.${index}.emCurso`);
                    return (
                    <div key={field.id} className="p-6 border rounded-lg relative space-y-4">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* --- Campo Instituição --- */}
                            <FormField control={control} name={`formacoesAcademicas.${index}.instituicao`} render={({ field: formField }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput id={`formacao-instituicao-${index}`} label="Instituição" {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            {/* --- Campo Curso --- */}
                            <FormField control={control} name={`formacoesAcademicas.${index}.curso`} render={({ field: formField }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput id={`formacao-curso-${index}`} label="Curso" {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            {/* --- Campo Área de Estudo --- */}
                            <FormField control={control} name={`formacoesAcademicas.${index}.areaEstudo`} render={({ field: formField }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput id={`formacao-area-${index}`} label="Área de Estudo (Opcional)" {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            {/* --- Campo Data de Início --- */}
                            <FormField control={control} name={`formacoesAcademicas.${index}.dataInicio`} render={({ field: formField }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput id={`formacao-data-inicio-${index}`} label="Data de Início" type="month" {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            {/* --- Campo Data de Fim --- */}
                            <FormField control={control} name={`formacoesAcademicas.${index}.dataFim`} render={({ field: formField }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput id={`formacao-data-fim-${index}`} label="Data de Fim" type="month" disabled={emCurso} {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                             {/* --- Campo Checkbox "Em Curso" --- */}
                            <FormField control={control} name={`formacoesAcademicas.${index}.emCurso`} render={({ field: formField }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm h-10 mt-auto">
                                    <FormControl>
                                        <Checkbox id={`formacao-em-curso-${index}`} checked={formField.value} onCheckedChange={formField.onChange}/>
                                    </FormControl>
                                    <FormLabel htmlFor={`formacao-em-curso-${index}`} className="font-normal cursor-pointer">Ainda estou cursando</FormLabel>
                                </FormItem>
                             )}/>
                        </div>
                         {/* --- Campo Descrição --- */}
                        <FormField control={control} name={`formacoesAcademicas.${index}.descricao`} render={({ field: formField }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelTextarea id={`formacao-descricao-${index}`} rows={4} {...formField} label="Descrição (Opcional)"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    </div>
                )})}
            </div>
        </div>
    );
}