"use client";

import { NivelProficiencia } from "@prisma/client";
import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";
import { PlusCircle, Trash2 } from "lucide-react";

interface IdiomasSectionProps {
    control: Control<tCurriculoCompleto>;
}

export function IdiomasSection({ control }: IdiomasSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "idiomas",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Idiomas</h2>
                <Button type="button" variant="outline" onClick={() => append({ nome: '', nivel: NivelProficiencia.INICIANTE })}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Idioma
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                        <FormField
                            control={control}
                            name={`idiomas.${index}.nome`}
                            render={({ field: formField }) => (
                                <FormItem className="md:col-span-2">
                                    <FormControl>
                                        <FloatingLabelInput id={`idioma-nome-${index}`} label="Idioma" {...formField}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`idiomas.${index}.nivel`}
                            render={({ field: formField }) => (
                                <FormItem>
                                    <FormLabel>Nível</FormLabel>
                                    <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione o nível" /></SelectTrigger>
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
                        <Button type="button" variant="ghost" size="icon" className="text-destructive justify-self-end md:justify-self-center -mt-4" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}