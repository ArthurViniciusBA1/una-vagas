'use server';

import { Prisma, RoleUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';
import { revalidatePath } from 'next/cache';
import { vagaFormSchema } from '@/schemas/vagaSchema';

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
  vagas?: any[];
  totalVagas?: number;
}

interface FetchVagasParams {
  page?: number;
  limit?: number;
  status?: string;
}

// ... (demais interfaces não precisam de alteração)

export async function fetchAvailableVagas(
  params: FetchVagasParams = {}
): Promise<FetchVagasResult> {
  const { page = 1, limit = 9 } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized } = await authorizeUser([RoleUsuario.CANDIDATO, RoleUsuario.ADMIN]);

  if (!isAuthorized) {
    return {
      success: false,
      error: 'Acesso Negado. Faça login como Candidato para visualizar as vagas.',
    };
  }

  try {
    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    const whereClause: Prisma.VagaWhereInput = {
      ativa: true,
      OR: [
        { dataExpiracao: null }, // Permite vagas que nunca expiram
        { dataExpiracao: { gte: new Date() } }, // Permite vagas cuja data de expiração é hoje ou no futuro
      ],
    };
    // --- FIM DA ALTERAÇÃO ---

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

// O restante do arquivo continua o mesmo...
// (saveVagaAction, fetchCompanyVagas, etc. não precisam ser alterados)

export async function saveVagaAction(formData: any): Promise<any> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Não autorizado para criar/editar vagas.' };
  }

  const validation = vagaFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', ') || 'Dados inválidos.',
    };
  }

  const { id, requisitos, dataExpiracao, ...rest } = validation.data;

  try {
    let empresaIdParaVaga: string | undefined | null = null;
    const usuarioLogado = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { empresaId: true },
    });

    if (role === RoleUsuario.RECRUTADOR) {
      empresaIdParaVaga = usuarioLogado?.empresaId;
    } else if (role === RoleUsuario.ADMIN) {
      if (id) {
        const vagaExistente = await prisma.vaga.findUnique({
          where: { id },
          select: { empresaId: true },
        });
        empresaIdParaVaga = vagaExistente?.empresaId;
      } else {
        empresaIdParaVaga = formData.empresaId;
      }
    }

    if (!empresaIdParaVaga) {
      const errorMessage =
        role === RoleUsuario.RECRUTADOR
          ? 'Seu usuário de recrutador não está vinculado a uma empresa.'
          : 'Não foi possível determinar a empresa para esta vaga. Se for admin, certifique-se de fornecê-la.';
      return { success: false, error: errorMessage };
    }

    const requisitosArray = requisitos
      .split(/[\n,]+/)
      .map((req: string) => req.trim())
      .filter((req: string) => req.length > 0);
    const dataExpiracaoDate = dataExpiracao ? new Date(`${dataExpiracao}T23:59:59Z`) : null;

    const vagaDataParaUpdate = {
      ...rest,
      requisitos: requisitosArray,
      dataExpiracao: dataExpiracaoDate,
      empresaId: empresaIdParaVaga,
    };

    const vagaDataParaCreate = {
      ...vagaDataParaUpdate,
      dataPublicacao: new Date(),
      criadoPorId: userId,
    };

    let vaga;
    if (id) {
      if (role === RoleUsuario.RECRUTADOR) {
        const vagaExistente = await prisma.vaga.findFirst({
          where: { id: id, empresaId: empresaIdParaVaga },
        });
        if (!vagaExistente) {
          return { success: false, error: 'Você não tem permissão para editar esta vaga.' };
        }
      }
      vaga = await prisma.vaga.update({ where: { id }, data: vagaDataParaUpdate });
    } else {
      vaga = await prisma.vaga.create({
        data: vagaDataParaCreate,
      });
    }

    revalidatePath('/empresa/dashboard');
    revalidatePath('/empresa/vagas');
    revalidatePath('/candidato/vagas');
    revalidatePath(`/candidato/vagas/${vaga.id}`);

    return { success: true, vaga };
  } catch (e) {
    console.error('Erro ao salvar vaga:', e);
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Ocorreu um erro ao salvar a vaga.',
    };
  }
}

export async function fetchCompanyVagas(params: FetchVagasParams = {}): Promise<FetchVagasResult> {
  const { page = 1, limit = 9 } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Não autorizado para ver vagas da empresa.' };
  }

  let targetEmpresaId: string | null = null;
  if (role === RoleUsuario.RECRUTADOR) {
    const usuarioRecrutador = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { empresaId: true },
    });
    if (!usuarioRecrutador?.empresaId) {
      return {
        success: false,
        error: 'Seu usuário de recrutador não está vinculado a uma empresa.',
      };
    }
    targetEmpresaId = usuarioRecrutador.empresaId;
  }

  try {
    const whereClause: any = {};

    if (targetEmpresaId) {
      whereClause.empresaId = targetEmpresaId;
    }

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
    console.error('Erro ao buscar vagas da empresa na Server Action:', e);
    return { success: false, error: 'Ocorreu um erro ao buscar as vagas da empresa.' };
  }
}

export async function fetchVagaForEdit(vagaId: string): Promise<any> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const vaga = await prisma.vaga.findUnique({
      where: { id: vagaId },
    });

    if (!vaga) {
      return { success: false, error: 'Vaga não encontrada.' };
    }

    if (role === RoleUsuario.RECRUTADOR) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { empresaId: true },
      });
      if (vaga.empresaId !== usuario?.empresaId) {
        return { success: false, error: 'Você não tem permissão para editar esta vaga.' };
      }
    }

    const dataFormatada = vaga.dataExpiracao ? vaga.dataExpiracao.toISOString().split('T')[0] : '';
    const requisitosString = vaga.requisitos.join(', \n');

    return {
      success: true,
      vaga: {
        ...vaga,
        dataExpiracao: dataFormatada,
        requisitos: requisitosString,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar vaga para edição:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function toggleVagaStatusAction(vagaId: string, novoStatus: boolean): Promise<any> {
  const { isAuthorized, userId, role } = await authorizeUser([
    RoleUsuario.RECRUTADOR,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    if (role === RoleUsuario.RECRUTADOR) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { empresaId: true },
      });

      if (!usuario?.empresaId) {
        return {
          success: false,
          error: 'Seu usuário de recrutador não está vinculado a uma empresa.',
        };
      }

      const vaga = await prisma.vaga.findFirst({
        where: { id: vagaId, empresaId: usuario?.empresaId },
      });
      if (!vaga) {
        return { success: false, error: 'Você não tem permissão para alterar esta vaga.' };
      }
    }

    const vagaAtualizada = await prisma.vaga.update({
      where: { id: vagaId },
      data: { ativa: novoStatus },
    });

    revalidatePath('/empresa/vagas');
    revalidatePath('/empresa/dashboard');

    return { success: true, vaga: vagaAtualizada };
  } catch (error) {
    console.error('Erro ao alterar status da vaga:', error);
    return {
      success: false,
      error: 'Ocorreu um erro no servidor ao tentar alterar o status da vaga.',
    };
  }
}
