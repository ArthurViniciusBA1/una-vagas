"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { RoleUsuario, ExperienciaProfissional, FormacaoAcademica } from '@prisma/client';
import { tCurriculoInformacoesPessoais, tExperienciaProfissional, tFormacaoAcademica } from '@/schemas/curriculoSchema';

interface CandidatoProfileData {
  id: string;
  nome: string;
  email?: string | null;
  numeroRA?: string | null;
  role: RoleUsuario;
}

interface CurriculoData {
  id?: string | null;
  usuarioId?: string;
  tituloCurriculo?: string | null;
  resumoProfissional?: string | null;
  telefone?: string | null;
  enderecoCompleto?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  visibilidade?: boolean;
  experienciasProfissionais?: ExperienciaProfissional[];
  formacoesAcademicas?: FormacaoAcademica[];
}

interface CandidatoContextType {
  candidato: CandidatoProfileData | null;
  curriculo: CurriculoData | null;
  isLoading: boolean;
  error: string | null;
  fetchCandidatoData: () => Promise<void>;
  updateInformacoesPessoais: (data: tCurriculoInformacoesPessoais) => Promise<void>;
  saveExperiencia: (data: tExperienciaProfissional) => Promise<void>;
  deleteExperiencia: (id: string) => Promise<void>;
  saveFormacao: (data: tFormacaoAcademica) => Promise<void>;
  deleteFormacao: (id: string) => Promise<void>;
}

const CandidatoContext = createContext<CandidatoContextType | undefined>(undefined);

export const CandidatoProvider = ({ children }: { children: ReactNode }) => {
  const [candidato, setCandidato] = useState<CandidatoProfileData | null>(null);
  const [curriculo, setCurriculo] = useState<CurriculoData | null>(null);
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
        deleteFormacao
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