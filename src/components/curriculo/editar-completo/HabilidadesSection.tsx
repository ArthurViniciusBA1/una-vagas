"use client";

import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";
import { PlusCircle, Trash2 } from "lucide-react";

interface HabilidadesSectionProps {
    control: Control<tCurriculoCompleto>;
}

export function HabilidadesSection({ control }: HabilidadesSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "habilidades",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Habilidades</h2>
                <Button type="button" variant="outline" onClick={() => append({ nome: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Habilidade
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-4">
                        <FormField
                            control={control}
                            name={`habilidades.${index}.nome`}
                            render={({ field: formField }) => (
                                <FormItem className="flex-grow">
                                    <FormControl>
                                        <FloatingLabelInput id={`habilidade-nome-${index}`} label={`Habilidade #${index + 1}`} {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive mt-2" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}