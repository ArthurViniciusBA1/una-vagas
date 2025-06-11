"use client";

import { Control } from "react-hook-form";

import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/custom/FloatingLabelTextarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { tCurriculoCompleto } from "@/schemas/curriculoSchema";

interface InformacoesPessoaisSectionProps {
    control: Control<tCurriculoCompleto>;
}

export function InformacoesPessoaisSection({ control }: InformacoesPessoaisSectionProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={control} name="titulo" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput label="Título do Currículo" id="titulo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={control} name="telefone" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput label="Telefone" id="telefone" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={control} name="endereco" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput label="Endereço (Cidade - UF)" id="endereco" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            <FormField control={control} name="resumoProfissional" render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <FloatingLabelTextarea label="Resumo Profissional" id="resumo" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={control} name="linkedinUrl" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput label="URL do LinkedIn" id="linkedin" type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={control} name="githubUrl" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput label="URL do GitHub" id="github" type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={control} name="portfolioUrl" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput label="URL do Portfólio" id="portfolio" type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>
    );
}