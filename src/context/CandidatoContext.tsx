"use client";

import { Prisma, RoleUsuario } from '@prisma/client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { tCertificacao, tCurriculoInformacoesPessoais, tExperienciaProfissional, tFormacaoAcademica, tHabilidade, tIdioma, tProjeto } from '@/schemas/curriculoSchema';

// 1. DEFINIÇÃO COMPLETA E ÚNICA DO TIPO
// Adicionamos a relação 'usuario' aqui.
const curriculoCompletoArgs = Prisma.validator<Prisma.CurriculoDefaultArgs>()({
    include: {
        usuario: { select: { id: true, nome: true, email: true } },
        experienciasProfissionais: true,
        formacoesAcademicas: true,
        habilidades: true,
        idiomas: true,
        projetos: true,
        certificacoes: true,
    }
});

// Este é o nosso tipo oficial e único para um currículo com todas as relações
export type CurriculoCompleto = Prisma.CurriculoGetPayload<typeof curriculoCompletoArgs>;


// --- O resto do contexto ---

interface CandidatoProfileData {
  id: string;
  nome: string;
  email?: string | null;
  numeroRA?: string | null;
  role: RoleUsuario;
}

interface CandidatoContextType {
  candidato: CandidatoProfileData | null;
  curriculo: CurriculoCompleto | null; // Usamos o tipo correto
  isLoading: boolean;
  error: string | null;
  fetchCandidatoData: () => Promise<void>;
  updateInformacoesPessoais: (data: tCurriculoInformacoesPessoais) => Promise<void>;
  saveExperiencia: (data: tExperienciaProfissional) => Promise<void>;
  deleteExperiencia: (id: string) => Promise<void>;
  saveFormacao: (data: tFormacaoAcademica) => Promise<void>;
  deleteFormacao: (id: string) => Promise<void>;
  saveHabilidade: (data: tHabilidade) => Promise<void>;
  deleteHabilidade: (id: string) => Promise<void>;
  saveIdioma: (data: tIdioma) => Promise<void>;
  deleteIdioma: (id: string) => Promise<void>;
  saveProjeto: (data: tProjeto) => Promise<void>;
  deleteProjeto: (id: string) => Promise<void>;
  saveCertificacao: (data: tCertificacao) => Promise<void>;
  deleteCertificacao: (id: string) => Promise<void>;
}

const CandidatoContext = createContext<CandidatoContextType | undefined>(undefined);

export const CandidatoProvider = ({ children }: { children: React.ReactNode }) => {
  const [candidato, setCandidato] = useState<CandidatoProfileData | null>(null);
  const [curriculo, setCurriculo] = useState<CurriculoCompleto | null>(null); // Usamos o tipo correto
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidatoData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/candidato/meus-dados');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({error: "Falha ao buscar dados do candidato."}));
        throw new Error(errData.error);
      }
      const data = await response.json();
      setCandidato(data.usuario);
      setCurriculo(data.curriculo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidatoData();
  }, [fetchCandidatoData]);

  // As funções de save/delete não precisam de alteração
  const updateInformacoesPessoais = async (data: tCurriculoInformacoesPessoais) => {
    try {
      const response = await fetch('/api/curriculo/informacoes-pessoais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      toast.success("Informações pessoais salvas com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      throw err;
    }
  };

  const saveExperiencia = async (data: tExperienciaProfissional) => {
    try {
      const response = await fetch('/api/curriculo/experiencias', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      toast.success("Experiência salva com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar experiência.");
      throw err;
    }
  };

  const deleteExperiencia = async (id: string) => {
    try {
      const response = await fetch(`/api/curriculo/experiencias`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      toast.success("Experiência removida com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover experiência.");
      throw err;
    }
  };

  const saveFormacao = async (data: tFormacaoAcademica) => {
    try {
      const response = await fetch('/api/curriculo/formacao', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar formação.");
      toast.success("Formação salva com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar formação.");
      throw err;
    }
  };

  const deleteFormacao = async (id: string) => {
    try {
      const response = await fetch(`/api/curriculo/formacao`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao remover formação.");
      toast.success("Formação removida com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover formação.");
      throw err;
    }
  };
  
  const saveHabilidade = async (data: tHabilidade) => {
    try {
      const response = await fetch('/api/curriculo/habilidades', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar habilidade.");
      toast.success("Habilidade salva com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar habilidade.");
      throw err;
    }
  };

  const deleteHabilidade = async (id: string) => {
    try {
      const response = await fetch(`/api/curriculo/habilidades`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao remover habilidade.");
      toast.success("Habilidade removida com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover habilidade.");
      throw err;
    }
  };

  const saveIdioma = async (data: tIdioma) => {
    try {
      const response = await fetch('/api/curriculo/idiomas', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar idioma.");
      toast.success("Idioma salvo com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar idioma.");
      throw err;
    }
  };

  const deleteIdioma = async (id: string) => {
    try {
      const response = await fetch(`/api/curriculo/idiomas`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao remover idioma.");
      toast.success("Idioma removido com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover idioma.");
      throw err;
    }
  };

  const saveProjeto = async (data: tProjeto) => {
    try {
      const response = await fetch('/api/curriculo/projetos', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar projeto.");
      toast.success("Projeto salvo com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar projeto.");
      throw err;
    }
  };

  const deleteProjeto = async (id: string) => {
    try {
      const response = await fetch(`/api/curriculo/projetos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao remover projeto.");
      toast.success("Projeto removido com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover projeto.");
      throw err;
    }
  };

  const saveCertificacao = async (data: tCertificacao) => {
    try {
      const response = await fetch('/api/curriculo/certificacoes', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar certificação.");
      toast.success("Certificação salva com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar certificação.");
      throw err;
    }
  };

  const deleteCertificacao = async (id: string) => {
    try {
      const response = await fetch(`/api/curriculo/certificacoes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao remover certificação.");
      toast.success("Certificação removida com sucesso!");
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover certificação.");
      throw err;
    }
  };


  return (
    <CandidatoContext.Provider value={{ 
        candidato, 
        curriculo, 
        isLoading, 
        error, 
        fetchCandidatoData,
        updateInformacoesPessoais,
        saveExperiencia,
        deleteExperiencia,
        saveFormacao,
        deleteFormacao,
        saveHabilidade,
        deleteHabilidade,
        saveIdioma,
        deleteIdioma,
        saveProjeto,
        deleteProjeto,
        saveCertificacao,
        deleteCertificacao
    }}>
      {children}
    </CandidatoContext.Provider>
  );
};

export const useCandidato = () => {
  const context = useContext(CandidatoContext);
  if (context === undefined) {
    throw new Error('useCandidato deve ser usado dentro de um CandidatoProvider');
  }
  return context;
};