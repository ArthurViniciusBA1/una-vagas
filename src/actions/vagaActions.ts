// src/actions/vagaActions.ts
'use server';

import { Prisma, RoleUsuario, TipoVaga } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { vagaFormSchema, tVagaForm } from '@/schemas/vagaSchema';

// Tipo para a vaga com a empresa incluída (mantido, mas não será usado para 'vagas' no FetchVagasResult)
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

// Tipos para as Server Actions
interface FetchVagasResult {
  success: boolean;
  error?: string;
  vagas?: any[]; // <--- TIPADO COMO 'any[]' AQUI
  totalVagas?: number;
}

interface FetchVagasParams {
  page?: number;
  limit?: number;
  status?: string;
  // Adicione outros filtros aqui (ex: tipo, localizacao, termo de busca)
}

interface SaveVagaResult {
  success: boolean;
  error?: string;
  vaga?: Prisma.VagaGetPayload<{}>; // Retorna a vaga salva
}

/**
 * Busca as vagas disponíveis para candidatos com filtros e paginação.
 * Esta é uma Server Action protegida.
 * @param params Parâmetros de paginação e filtro.
 * @returns Um objeto com sucesso, vagas e/ou erro.
 */
export async function fetchAvailableVagas(params: FetchVagasParams = {}): Promise<FetchVagasResult> {
  const { page = 1, limit = 9 } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized } = await authorizeUser([RoleUsuario.CANDIDATO, RoleUsuario.ADMIN]);

  if (!isAuthorized) {
    return { success: false, error: 'Acesso Negado. Faça login como Candidato para visualizar as vagas.' };
  }

  try {
    const whereClause: Prisma.VagaWhereInput = {
      ativa: true,
      dataExpiracao: {
        gte: new Date(),
      },
    };

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

    // O retorno ainda corresponderá a FetchVagasResult, com 'vagas' sendo 'any[]'
    return { success: true, vagas, totalVagas };
  } catch (e) {
    console.error('Erro ao buscar vagas na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao buscar as vagas disponíveis.' };
  }
}

/**
 * Salva ou atualiza uma vaga.
 * @param data Os dados da vaga do formulário.
 * @returns Um objeto com sucesso e a vaga salva, ou erro.
 */
export async function saveVagaAction(formData: any): Promise<SaveVagaResult> {
  const { isAuthorized, userId, role } = await authorizeUser([RoleUsuario.RECRUTADOR, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId || (role !== RoleUsuario.RECRUTADOR && role !== RoleUsuario.ADMIN)) {
    return { success: false, error: 'Não autorizado para criar/editar vagas.' };
  }

  let empresaIdParaVaga: string | undefined;
  // Se o usuário é recrutador, ele deve ter uma empresa vinculada e a vaga será para essa empresa
  if (role === RoleUsuario.RECRUTADOR) {
    const usuarioRecrutador = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { empresaId: true },
    });
    if (!usuarioRecrutador?.empresaId) {
      return { success: false, error: 'Seu usuário de recrutador não está vinculado a uma empresa.' };
    }
    empresaIdParaVaga = usuarioRecrutador.empresaId;
  } else if (role === RoleUsuario.ADMIN) {
    // Se for ADMIN, o empresaId deve vir do formulário
    if (!formData.empresaId) {
      return { success: false, error: 'Administradores devem especificar a empresa da vaga.' };
    }
    empresaIdParaVaga = formData.empresaId;
  }

  try {
    const validation = vagaFormSchema.safeParse(formData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', ') || 'Dados inválidos.',
      };
    }

    const { id, requisitos, dataExpiracao, ...rest } = validation.data;

    const requisitosArray = requisitos
      .split(',')
      .map((req: any) => req.trim())
      .filter((req: any) => req.length > 0);
    const dataExpiracaoDate = dataExpiracao ? new Date(dataExpiracao) : null;

    const vagaData = {
      ...rest,
      requisitos: requisitosArray,
      dataExpiracao: dataExpiracaoDate,
      empresaId: empresaIdParaVaga!,
      criadoPorId: userId,
      dataPublicacao: new Date(),
    };

    const vaga = id
      ? await prisma.vaga.update({
          where: { id },
          data: vagaData,
        })
      : await prisma.vaga.create({
          data: vagaData,
        });

    revalidatePath('/empresa/dashboard');
    revalidatePath('/empresa/vagas');
    revalidatePath(`/candidato/vagas`);
    revalidatePath(`/candidato/vagas/${vaga.id}`);

    return { success: true, vaga };
  } catch (e) {
    console.error('Erro ao salvar vaga:', e);
    // Erros de validação do Zod já são tratados acima. Aqui seriam erros de banco/servidor.
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Ocorreu um erro ao salvar a vaga.',
    };
  }
}

/**
 * Busca as vagas de uma empresa específica (do recrutador logado ou selecionada pelo admin).
 * @param params Parâmetros de paginação e filtro.
 * @returns Um objeto com sucesso, vagas e/ou erro.
 */
export async function fetchCompanyVagas(params: FetchVagasParams = {}): Promise<FetchVagasResult> {
  const { page = 1, limit = 9 } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized, userId, role } = await authorizeUser([RoleUsuario.RECRUTADOR, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Não autorizado para ver vagas da empresa.' };
  }

  let targetEmpresaId: string | null = null;
  // Se for recrutador, pega o empresaId dele
  if (role === RoleUsuario.RECRUTADOR) {
    const usuarioRecrutador = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { empresaId: true },
    });
    if (!usuarioRecrutador?.empresaId) {
      return { success: false, error: 'Seu usuário de recrutador não está vinculado a uma empresa.' };
    }
    targetEmpresaId = usuarioRecrutador.empresaId;
  } else if (role === RoleUsuario.ADMIN) {
    // Se for admin, pode ver todas as vagas, ou filtrar por uma empresa específica se for passado no params
    // Por simplicidade, se o admin não especificar, mostra todas.
    // Futuramente: admin pode selecionar empresa no filtro da UI.
  }

  try {
    const whereClause: Prisma.VagaWhereInput = {};

    if (targetEmpresaId) {
      whereClause.empresaId = targetEmpresaId;
    }
    // Futuramente, adicione filtros aqui com base em params (ex: status, termo de busca)

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

    // O retorno ainda corresponderá a FetchVagasResult, com 'vagas' sendo 'any[]'
    return { success: true, vagas, totalVagas };
  } catch (e) {
    console.error('Erro ao buscar vagas da empresa na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao buscar as vagas da empresa.' };
  }
}
