// src/context/CandidatoContext.tsx
'use client';

import { Prisma, RoleUsuario } from '@prisma/client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  saveExperienciaAction, // Importação da Server Action
  deleteExperienciaAction, // Importação da Server Action
  saveFormacaoAction, // Importação da Server Action
  deleteFormacaoAction, // Importação da Server Action
  saveHabilidadeAction, // Importação da Server Action
  deleteHabilidadeAction, // Importação da Server Action
  saveIdiomaAction, // Importação da Server Action
  deleteIdiomaAction, // Importação da Server Action
  saveProjetoAction, // Importação da Server Action
  deleteProjetoAction, // Importação da Server Action
  saveCertificacaoAction, // Importação da Server Action
  deleteCertificacaoAction, // Importação da Server Action
} from '@/actions/curriculoParcialActions';
import {
  tCertificacao,
  tCurriculoInformacoesPessoais,
  tExperienciaProfissional,
  tFormacaoAcademica,
  tHabilidade,
  tIdioma,
  tProjeto,
} from '@/schemas/curriculoSchema';

const curriculoCompletoArgs = Prisma.validator<Prisma.CurriculoDefaultArgs>()({
  include: {
    usuario: { select: { id: true, nome: true, email: true } },
    experienciasProfissionais: true,
    formacoesAcademicas: true,
    habilidades: true,
    idiomas: true,
    projetos: true,
    certificacoes: true,
  },
});

export type CurriculoCompleto = Prisma.CurriculoGetPayload<typeof curriculoCompletoArgs>;


interface CandidatoProfileData {
  id: string;
  nome: string;
  email?: string | null;
  numeroRA?: string | null;
  role: RoleUsuario;
}

interface CandidatoContextType {
  candidato: CandidatoProfileData | null;
  curriculo: CurriculoCompleto | null;
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
  const [curriculo, setCurriculo] = useState<CurriculoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidatoData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/candidato/meus-dados');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Falha ao buscar dados do candidato.' }));
        throw new Error(errData.error);
      }
      const data = await response.json();
      setCandidato(data.usuario);
      setCurriculo(data.curriculo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidatoData();
  }, [fetchCandidatoData]);

  // Adaptação da função para usar Server Action
  const updateInformacoesPessoais = async (data: tCurriculoInformacoesPessoais) => {
    try {
      // Como não temos uma Server Action específica para Informacoes Pessoais ainda no curriculoParcialActions,
      // manteremos a chamada à API por enquanto. A Server Action `save*Action` é para as outras entidades.
      // Se você criar uma Server Action para 'InformacoesPessoais', ela seria chamada aqui.
      const response = await fetch('/api/curriculo/informacoes-pessoais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      toast.success('Informações pessoais salvas com sucesso!');
      await fetchCandidatoData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.');
      throw err;
    }
  };

  // Adaptação das funções para usar Server Actions
  const saveExperiencia = async (data: tExperienciaProfissional) => {
    const res = await saveExperienciaAction(data);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao salvar experiência.');
    }
    await fetchCandidatoData();
  };

  const deleteExperiencia = async (id: string) => {
    const res = await deleteExperienciaAction(id);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao remover experiência.');
    }
    await fetchCandidatoData();
  };

  const saveFormacao = async (data: tFormacaoAcademica) => {
    const res = await saveFormacaoAction(data);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao salvar formação.');
    }
    await fetchCandidatoData();
  };

  const deleteFormacao = async (id: string) => {
    const res = await deleteFormacaoAction(id);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao remover formação.');
    }
    await fetchCandidatoData();
  };

  const saveHabilidade = async (data: tHabilidade) => {
    const res = await saveHabilidadeAction(data);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao salvar habilidade.');
    }
    await fetchCandidatoData();
  };

  const deleteHabilidade = async (id: string) => {
    const res = await deleteHabilidadeAction(id);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao remover habilidade.');
    }
    await fetchCandidatoData();
  };

  const saveIdioma = async (data: tIdioma) => {
    const res = await saveIdiomaAction(data);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao salvar idioma.');
    }
    await fetchCandidatoData();
  };

  const deleteIdioma = async (id: string) => {
    const res = await deleteIdiomaAction(id);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao remover idioma.');
    }
    await fetchCandidatoData();
  };

  const saveProjeto = async (data: tProjeto) => {
    const res = await saveProjetoAction(data);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao salvar projeto.');
    }
    await fetchCandidatoData();
  };

  const deleteProjeto = async (id: string) => {
    const res = await deleteProjetoAction(id);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao remover projeto.');
    }
    await fetchCandidatoData();
  };

  const saveCertificacao = async (data: tCertificacao) => {
    const res = await saveCertificacaoAction(data);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao salvar certificação.');
    }
    await fetchCandidatoData();
  };

  const deleteCertificacao = async (id: string) => {
    const res = await deleteCertificacaoAction(id);
    if (!res.success) {
      throw new Error(res.error || 'Erro ao remover certificação.');
    }
    await fetchCandidatoData();
  };

  return (
    <CandidatoContext.Provider
      value={{
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
        deleteCertificacao,
      }}
    >
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