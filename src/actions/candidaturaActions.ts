'use server';

import { Prisma, RoleUsuario, StatusCandidatura, Candidatura } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';
import { revalidatePath } from 'next/cache';

interface FetchCandidaturasResult {
  success: boolean;
  error?: string;
  candidaturas?: any[];
}

interface CreateCandidaturaResult {
  success: boolean;
  error?: string;
  candidatura?: Candidatura;
}

interface UpdateStatusResult {
  success: boolean;
  error?: string;
}

interface FetchCandidaturaDetailsResult {
  success: boolean;
  error?: string;
  candidatura?: any;
}

export async function fetchUserCandidaturas(status?: string): Promise<FetchCandidaturasResult> {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.CANDIDATO, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso Negado' };
  }

  try {
    const whereClause: Prisma.CandidaturaWhereInput = {
      usuarioId: userId,
    };

    if (status && status !== 'TODOS') {
      whereClause.status = status as StatusCandidatura;
    }

    const candidaturas = await prisma.candidatura.findMany({
      where: whereClause,
      include: {
        vaga: {
          select: {
            id: true,
            titulo: true,
            localizacao: true,
            tipo: true,
            dataExpiracao: true,
            empresa: {
              select: {
                nome: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataCandidatura: 'desc',
      },
    });

    return { success: true, candidaturas };
  } catch (e) {
    console.error('Erro ao buscar candidaturas na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao buscar suas candidaturas.' };
  }
}

export async function createCandidaturaAction(vagaId: string): Promise<CreateCandidaturaResult> {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.CANDIDATO]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado. Faça login como candidato.' };
  }

  if (!vagaId) {
    return { success: false, error: 'ID da vaga não fornecido.' };
  }

  try {
    const novaCandidatura = await prisma.candidatura.create({
      data: {
        usuarioId: userId,
        vagaId: vagaId,
        status: StatusCandidatura.INSCRITO,
      },
    });

    revalidatePath('/candidato/candidaturas');

    return { success: true, candidatura: novaCandidatura };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { success: false, error: 'Você já se candidatou para esta vaga.' };
    }

    console.error('Erro ao criar candidatura:', e);
    return { success: false, error: 'Ocorreu um erro ao processar sua candidatura.' };
  }
}

export async function fetchCandidaturasForEmpresa(
  filters: { status?: string; vagaId?: string } = {}
): Promise<FetchCandidaturasResult> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const whereClause: Prisma.CandidaturaWhereInput = {};

    if (role === RoleUsuario.RECRUTADOR) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { empresaId: true },
      });
      if (!usuario?.empresaId) {
        return { success: false, error: 'Usuário recrutador não associado a uma empresa.' };
      }
      whereClause.vaga = { empresaId: usuario.empresaId };
    }

    if (filters.status && filters.status !== 'TODOS') {
      whereClause.status = filters.status as StatusCandidatura;
    }

    if (filters.vagaId) {
      whereClause.vagaId = filters.vagaId;
    }

    const candidaturas = await prisma.candidatura.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            curriculo: {
              select: {
                id: true,
                telefone: true,
              },
            },
          },
        },
        vaga: {
          select: {
            titulo: true,
          },
        },
      },
      orderBy: {
        dataCandidatura: 'desc',
      },
    });

    return { success: true, candidaturas };
  } catch (error) {
    console.error('Erro ao buscar candidaturas da empresa:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function updateCandidaturaStatusAction(
  candidaturaId: string,
  status: StatusCandidatura
): Promise<UpdateStatusResult> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const whereAuthClause: Prisma.CandidaturaWhereUniqueInput = { id: candidaturaId };
    if (role === RoleUsuario.RECRUTADOR) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { empresaId: true },
      });
      if (!usuario?.empresaId) {
        return { success: false, error: 'Usuário recrutador não associado a uma empresa.' };
      }

      const candidatura = await prisma.candidatura.findFirst({
        where: { id: candidaturaId, vaga: { empresaId: usuario?.empresaId } },
      });
      if (!candidatura) {
        return { success: false, error: 'Você não tem permissão para alterar esta candidatura.' };
      }
    }

    await prisma.candidatura.update({
      where: whereAuthClause,
      data: { status },
    });

    revalidatePath('/empresa/candidaturas');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status da candidatura:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function fetchCandidaturaDetailsForRecruiter(
  candidaturaId: string
): Promise<FetchCandidaturaDetailsResult> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);
  if (!isAuthorized || !userId) return { success: false, error: 'Acesso negado.' };

  try {
    const whereClause: Prisma.CandidaturaWhereInput = { id: candidaturaId };
    if (role === RoleUsuario.RECRUTADOR) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { empresaId: true },
      });
      const empresaId = usuario?.empresaId;
      if (!empresaId) {
        return { success: false, error: 'Recrutador não associado a uma empresa.' };
      }
      whereClause.vaga = { empresaId: empresaId };
    }

    let candidatura = await prisma.candidatura.findFirst({
      where: whereClause,
      include: {
        vaga: true,
        usuario: {
          include: {
            curriculo: {
              include: {
                experienciasProfissionais: { orderBy: { dataInicio: 'desc' } },
                formacoesAcademicas: { orderBy: { dataInicio: 'desc' } },
                habilidades: { orderBy: { nome: 'asc' } },
                idiomas: { orderBy: { nome: 'asc' } },
                projetos: { orderBy: { nome: 'asc' } },
                certificacoes: { orderBy: { dataEmissao: 'desc' } },
              },
            },
          },
        },
      },
    });

    if (!candidatura) {
      return {
        success: false,
        error: 'Candidatura não encontrada ou você não tem permissão para visualizá-la.',
      };
    }

    if (candidatura.status === 'INSCRITO') {
      candidatura = await prisma.candidatura.update({
        where: { id: candidaturaId },
        data: { status: 'EM_PROCESSO' },
        include: {
          vaga: true,
          usuario: {
            include: {
              curriculo: {
                include: {
                  experienciasProfissionais: { orderBy: { dataInicio: 'desc' } },
                  formacoesAcademicas: { orderBy: { dataInicio: 'desc' } },
                  habilidades: { orderBy: { nome: 'asc' } },
                  idiomas: { orderBy: { nome: 'asc' } },
                  projetos: { orderBy: { nome: 'asc' } },
                  certificacoes: { orderBy: { dataEmissao: 'desc' } },
                },
              },
            },
          },
        },
      });
      revalidatePath('/empresa/candidaturas');
    }

    return { success: true, candidatura };
  } catch (error) {
    console.error(`Erro ao buscar detalhes da candidatura ${candidaturaId}:`, error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}
