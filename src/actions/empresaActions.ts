'use server';

import { RoleUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';
import { revalidatePath } from 'next/cache';
import { empresaFormSchema, tEmpresaForm } from '@/schemas/empresaSchema';

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

interface FetchEmpresaResult {
  success: boolean;
  error?: string;
  empresa?: any;
}

interface UpdateEmpresaResult {
  success: boolean;
  error?: string;
  empresa?: any;
}

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
        return {
          success: false,
          error: 'Seu usuário de recrutador não está vinculado a uma empresa.',
        };
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
      totalCandidaturasEmProcesso = await prisma.candidatura.count({
        where: { status: 'EM_PROCESSO' },
      });
      totalCandidaturasAprovadas = await prisma.candidatura.count({
        where: { status: 'APROVADO' },
      });
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

export async function fetchEmpresaForEdit(): Promise<FetchEmpresaResult> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);
  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { empresaId: true },
    });

    if (role === RoleUsuario.RECRUTADOR && !usuario?.empresaId) {
      return { success: false, error: 'Você não está vinculado a nenhuma empresa.' };
    }

    // Admin poderá editar qualquer empresa no futuro, por enquanto edita a sua se tiver
    const empresaId = usuario?.empresaId;
    if (!empresaId) {
      return { success: false, error: 'Nenhuma empresa encontrada para editar.' };
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      return { success: false, error: 'Empresa não encontrada.' };
    }

    return { success: true, empresa };
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function updateEmpresaAction(data: tEmpresaForm): Promise<UpdateEmpresaResult> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);
  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  const validation = empresaFormSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados inválidos.' };
  }

  const { id, ...empresaData } = validation.data;

  try {
    if (role === RoleUsuario.RECRUTADOR) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { empresaId: true },
      });
      if (usuario?.empresaId !== id) {
        return { success: false, error: 'Você não tem permissão para editar esta empresa.' };
      }
    }

    const empresaAtualizada = await prisma.empresa.update({
      where: { id },
      data: empresaData,
    });

    revalidatePath('/empresa/perfil-empresa');
    revalidatePath('/empresa/dashboard');

    return { success: true, empresa: empresaAtualizada };
  } catch (error) {
    console.error('Erro ao atualizar dados da empresa:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}
