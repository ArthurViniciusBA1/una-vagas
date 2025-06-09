"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Edit3, 
  UserCircle2, 
  Briefcase, 
  FileText, 
  Star, 
  Award, 
  Languages, 
  Lightbulb,
  EyeIcon,
  Loader2 
} from 'lucide-react';
import React, { useState } from 'react';
import { useCandidato } from '@/context/CandidatoContext';
import { DashboardModalsManager } from '@/components/curriculo/DashboardModalsManager';

type ActiveModalType = 'infoPessoal' | 'experiencia' | 'formacao' | 'habilidades' | 'idiomas' | 'projetos' | 'certificacoes' | null;

export default function CandidatoDashboardPage() {
  const { candidato, curriculo, isLoading, error } = useCandidato();
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-muted-foreground">Carregando painel...</span>
      </div>
    );
  }

  if (error || !candidato) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-destructive p-6">
        <p className="text-lg font-semibold">{error || "Não foi possível carregar os dados do dashboard."}</p>
        <p className="mt-4 text-center">Por favor, tente <Link href="/entrar" className="underline font-semibold">fazer login</Link> novamente.</p>
      </div>
    );
  }

  const linkBaseCurriculoEdicaoCompleta = "/candidato/curriculo/editar-completo";

  const secoesCurriculo = [
    { nome: "Informações Pessoais", icon: UserCircle2, action: () => setActiveModal('infoPessoal'), filled: !!curriculo?.titulo },
    { nome: "Experiências Profissionais", icon: Briefcase, action: () => setActiveModal('experiencia'), filled: (curriculo?.experienciasProfissionais?.length ?? 0) > 0 },
    { nome: "Formação Acadêmica", icon: FileText, action: () => setActiveModal('formacao'), filled: (curriculo?.formacoesAcademicas?.length ?? 0) > 0 },
    { nome: "Habilidades", icon: Star, action: () => setActiveModal('habilidades'), filled: (curriculo?.habilidades?.length ?? 0) > 0 },
    { nome: "Idiomas", icon: Languages, action: () => setActiveModal('idiomas'), filled: (curriculo?.idiomas?.length ?? 0) > 0 },
    { nome: "Projetos", icon: Lightbulb, action: () => setActiveModal('projetos'), filled: (curriculo?.projetos?.length ?? 0) > 0 },
    { nome: "Certificações", icon: Award, action: () => setActiveModal('certificacoes'), filled: (curriculo?.certificacoes?.length ?? 0) > 0 },
  ];

  return (
    <div className="w-full p-4 md:p-8">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Bem-vindo(a), {candidato.nome || "Candidato"}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Gerencie seu currículo e prepare-se para as melhores oportunidades.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Meu Currículo</h2>
        {!curriculo?.id && ( 
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
            <p className="font-medium">Parece que você ainda não iniciou seu currículo.</p>
            <p className="text-sm">Clique em "Informações Pessoais" para começar a preencher!</p>
          </div>
        )}
        {curriculo?.id && curriculo.titulo && (
          <p className="mb-6 text-muted-foreground">
            Seu currículo atual: <span className="font-semibold text-foreground">{curriculo.titulo}</span>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {secoesCurriculo.map((secao) => (
            <Button 
              key={secao.nome}
              variant="outline" 
              className="justify-start h-auto py-3 text-left group"
              onClick={secao.action}
            >
              <secao.icon 
                size={20} 
                className="mr-3 text-primary group-hover:text-accent-foreground shrink-0"
              />
              <div className="flex-grow">
                <span className="font-medium">{secao.nome}</span>
              </div>
            </Button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
                <Link href={linkBaseCurriculoEdicaoCompleta}> 
                    <Edit3 size={18} className="mr-2"/>
                    Editar Currículo Completo
                </Link>
            </Button>
            {curriculo?.id && (
                <Button asChild variant="outline">
                    <Link href={`/candidato/curriculo/${curriculo.id}`}>
                        <EyeIcon size={18} className="mr-2" />
                        Visualizar Meu Currículo
                    </Link>
                </Button>
            )}
        </div>
      </section>

      <DashboardModalsManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
    </div>
  );
}