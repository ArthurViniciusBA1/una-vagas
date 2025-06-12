// src/actions/vagaActions.ts
'use server';

import { Prisma, RoleUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';

// Tipo para a vaga com a empresa incluída
const vagaWithEmpresaArgs = Prisma.validator<Prisma.VagaDefaultArgs>()({
  include: {
    empresa: {
      select: {
        nome: true,
        logoUrl: true,
      },
    },
  },
});

export type VagaWithEmpresa = Prisma.VagaGetPayload<typeof vagaWithEmpresaArgs>;

interface FetchVagasResult {
  success: boolean;
  error?: string;
  vagas?: any;
  totalVagas?: number; // Para paginação: total de vagas sem considerar o limite
}

interface FetchVagasParams {
  page?: number;
  limit?: number;
  status?: string; // Futuro: para filtrar por status da vaga (ativa/inativa)
  // Adicione outros filtros aqui (ex: tipo, localizacao, termo de busca)
}

/**
 * Busca as vagas disponíveis com filtros e paginação.
 * Esta é uma Server Action protegida.
 * @param params Parâmetros de paginação e filtro.
 * @returns Um objeto com sucesso, vagas e/ou erro.
 */
export async function fetchAvailableVagas(params: FetchVagasParams = {}): Promise<FetchVagasResult> {
  const { page = 1, limit = 9 } = params; // Default para 9 vagas por página
  const skip = (page - 1) * limit;

  // Autenticação (apenas para Candidato ou Admin)
  const { isAuthorized } = await authorizeUser([RoleUsuario.CANDIDATO, RoleUsuario.ADMIN]);

  if (!isAuthorized) {
    return { success: false, error: 'Acesso Negado. Faça login como Candidato para visualizar as vagas.' };
  }

  try {
    const whereClause: Prisma.VagaWhereInput = {
      ativa: true, // Apenas vagas ativas
      dataExpiracao: {
        gte: new Date(), // Vagas que ainda não expiraram
      },
    };

    // Futuramente, você pode adicionar filtros aqui com base em params.status ou outros
    // Ex: if (params.status && params.status !== 'TODOS') { whereClause.status = params.status as Prisma.StatusVaga; }

    const [vagas, totalVagas] = await prisma.$transaction([
      prisma.vaga.findMany({
        where: whereClause,
        orderBy: {
          dataPublicacao: 'desc',
        },
        include: {
          empresa: {
            select: {
              nome: true,
              logoUrl: true,
            },
          },
        },
        skip: skip,
        take: limit,
      }),
      prisma.vaga.count({
        where: whereClause,
      }),
    ]);

    return { success: true, vagas, totalVagas };
  } catch (e) {
    console.error('Erro ao buscar vagas na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao buscar as vagas disponíveis.' };
  }
}
