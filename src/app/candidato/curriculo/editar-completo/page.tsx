"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CertificacoesSection } from "@/components/curriculo/editar-completo/CertificacoesSection";
import { ExperienciasSection } from "@/components/curriculo/editar-completo/ExperienciasSection";
import { FormacoesSection } from "@/components/curriculo/editar-completo/FormacoesSection";
import { HabilidadesSection } from "@/components/curriculo/editar-completo/HabilidadesSection";
import { IdiomasSection } from "@/components/curriculo/editar-completo/IdiomasSection";
import { InformacoesPessoaisSection } from "@/components/curriculo/editar-completo/InformacoesPessoaisSection";
import { ProjetosSection } from "@/components/curriculo/editar-completo/ProjetosSection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useCandidato } from "@/context/CandidatoContext";
import { curriculoCompletoSchema, tCurriculoCompleto } from "@/schemas/curriculoSchema";

export default function PaginaEditarCurriculoCompleto() {
    const { curriculo, isLoading, updateInformacoesPessoais } = useCandidato();

    const form = useForm<tCurriculoCompleto>({
        resolver: zodResolver(curriculoCompletoSchema),
        defaultValues: {},
    });

    // Extraímos o 'watch' aqui
    const { control, register, watch, handleSubmit, formState, reset } = form;

    useEffect(() => {
        if (curriculo) {
            const defaultValues = {
                ...curriculo,
                titulo: curriculo.titulo ?? "",
                resumoProfissional: curriculo.resumoProfissional ?? "",
                telefone: curriculo.telefone ?? "",
                endereco: curriculo.endereco ?? "",
                linkedinUrl: curriculo.linkedinUrl ?? "",
                githubUrl: curriculo.githubUrl ?? "",
                portfolioUrl: curriculo.portfolioUrl ?? "",
                experienciasProfissionais: curriculo.experienciasProfissionais.map(exp => ({
                    ...exp,
                    localidade: exp.local ?? '',
                    dataInicio: new Date(exp.dataInicio).toISOString().substring(0, 7),
                    dataFim: exp.dataFim ? new Date(exp.dataFim).toISOString().substring(0, 7) : '',
                    descricao: exp.descricao ?? ''
                })),
                formacoesAcademicas: curriculo.formacoesAcademicas.map(form => ({
                    ...form,
                    areaEstudo: form.areaEstudo ?? '',
                    dataInicio: new Date(form.dataInicio).toISOString().substring(0, 7),
                    dataFim: form.dataFim ? new Date(form.dataFim).toISOString().substring(0, 7) : '',
                    descricao: form.descricao ?? ''
                })),
                projetos: curriculo.projetos.map(p => ({...p, descricao: p.descricao ?? '', projectUrl: p.projectUrl ?? '', repositorioUrl: p.repositorioUrl ?? ''})),
                certificacoes: curriculo.certificacoes.map(c => ({...c, dataEmissao: new Date(c.dataEmissao).toISOString().substring(0, 7), credencialUrl: c.credencialUrl ?? ''}))
            };
            reset(defaultValues);
        }
    }, [curriculo, reset]);
    
    const onSubmit = async (data: tCurriculoCompleto) => {
        console.log(data);
        try {
            // A lógica de salvar tudo virá aqui
            await updateInformacoesPessoais(data);
            toast.success("Currículo salvo com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar o currículo.");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Editar Currículo</h1>
                <p className="text-muted-foreground">Preencha todas as seções do seu perfil profissional.</p>
            </header>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                    <InformacoesPessoaisSection control={control} />
                    <Separator />
                    <ExperienciasSection control={control} register={register} watch={watch} />
                    <Separator />
                    <FormacoesSection control={control} register={register} watch={watch} />
                    <Separator />
                    <HabilidadesSection control={control} />
                    <Separator />
                    <IdiomasSection control={control} />
                    <Separator />
                    <ProjetosSection control={control} register={register} />
                    <Separator />
                    <CertificacoesSection control={control} register={register} />

                    <div className="flex justify-end pt-8">
                        <Button type="submit" size="lg" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Currículo Completo"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}