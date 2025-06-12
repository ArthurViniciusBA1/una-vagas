// src/actions/empresaActions.ts
'use server';

import { RoleUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';

interface DashboardDataResult {
  success: boolean;
  error?: string;
  data?: {
    empresaNome: string;
    empresaDescricao: string | null;
    recrutadorNome: string;
    recrutadorEmail: string;
    totalVagasAtivas: number;
    totalCandidaturasRecebidas: number;
    totalCandidaturasEmProcesso: number;
    totalCandidaturasAprovadas: number;
  };
}

/**
 * Busca os dados para o dashboard da empresa/admin.
 * @returns Um objeto com sucesso e os dados do dashboard, ou erro.
 */
export async function fetchDashboardData(): Promise<DashboardDataResult> {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.RECRUTADOR, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso Negado. Faça login para ver o dashboard.' };
  }

  let empresaNome: string = 'Sua Empresa';
  let empresaDescricao: string | null = null;
  let recrutadorNome: string = '';
  let recrutadorEmail: string = '';
  let totalVagasAtivas = 0;
  let totalCandidaturasRecebidas = 0;
  let totalCandidaturasEmProcesso = 0;
  let totalCandidaturasAprovadas = 0;

  try {
    const usuarioLogado = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        nome: true,
        email: true,
        role: true,
        empresaId: true,
        empresa: {
          select: {
            nome: true,
            descricao: true,
          },
        },
      },
    });

    if (!usuarioLogado) {
      return { success: false, error: 'Dados do usuário não encontrados.' };
    }

    recrutadorNome = usuarioLogado.nome;
    recrutadorEmail = usuarioLogado.email;

    if (usuarioLogado.role === RoleUsuario.RECRUTADOR) {
      if (!usuarioLogado.empresaId || !usuarioLogado.empresa) {
        return { success: false, error: 'Seu usuário de recrutador não está vinculado a uma empresa.' };
      }

      empresaNome = usuarioLogado.empresa.nome;
      empresaDescricao = usuarioLogado.empresa.descricao;

      totalVagasAtivas = await prisma.vaga.count({
        where: {
          empresaId: usuarioLogado.empresaId,
          ativa: true,
          dataExpiracao: {
            gte: new Date(),
          },
        },
      });

      totalCandidaturasRecebidas = await prisma.candidatura.count({
        where: {
          vaga: {
            empresaId: usuarioLogado.empresaId,
          },
        },
      });

      totalCandidaturasEmProcesso = await prisma.candidatura.count({
        where: {
          vaga: {
            empresaId: usuarioLogado.empresaId,
          },
          status: 'EM_PROCESSO',
        },
      });

      totalCandidaturasAprovadas = await prisma.candidatura.count({
        where: {
          vaga: {
            empresaId: usuarioLogado.empresaId,
          },
          status: 'APROVADO',
        },
      });
    } else if (usuarioLogado.role === RoleUsuario.ADMIN) {
      empresaNome = 'Painel Administrativo';
      empresaDescricao = 'Visão geral do sistema de vagas.';
      totalVagasAtivas = await prisma.vaga.count({
        where: {
          ativa: true,
          dataExpiracao: {
            gte: new Date(),
          },
        },
      });
      totalCandidaturasRecebidas = await prisma.candidatura.count();
      totalCandidaturasEmProcesso = await prisma.candidatura.count({ where: { status: 'EM_PROCESSO' } });
      totalCandidaturasAprovadas = await prisma.candidatura.count({ where: { status: 'APROVADO' } });
    }

    return {
      success: true,
      data: {
        empresaNome,
        empresaDescricao,
        recrutadorNome,
        recrutadorEmail,
        totalVagasAtivas,
        totalCandidaturasRecebidas,
        totalCandidaturasEmProcesso,
        totalCandidaturasAprovadas,
      },
    };
  } catch (e) {
    console.error('Erro ao buscar dados do dashboard da empresa na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao carregar o dashboard.' };
  }
}
