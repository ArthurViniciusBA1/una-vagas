'use server';

import { Prisma, RoleUsuario, StatusCandidatura, Candidatura } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';

interface FetchCandidaturasResult {
  success: boolean;
  error?: string;
  candidaturas?: Candidatura[];
  userId?: string;
}

/**
 * Busca as candidaturas do usuário logado com base no status.
 * Esta é uma Server Action protegida.
 * @param status O status pelo qual filtrar (opcional).
 * @returns Um objeto com sucesso, candidaturas e/ou erro.
 */
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
      whereClause.status = status as StatusCandidatura; // AGORA StatusCandidatura é reconhecido
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

    return { success: true, candidaturas, userId };
  } catch (e) {
    console.error('Erro ao buscar candidaturas na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao buscar suas candidaturas.' };
  }
}
