'use server';

import { Prisma, RoleUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeUser } from '@/lib/auth.server';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

import {
  novaEmpresaSchema,
  tNovaEmpresa,
  editarUsuarioSchema,
  tEditarUsuario,
  empresaFormSchema,
  tEmpresaForm,
} from '@/schemas/adminSchema';

interface AdminActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface ListarResult {
  success: boolean;
  error?: string;
  items?: any[];
  total?: number;
}

// ... (outras actions que não serão modificadas) ...
export async function criarEmpresaComRecrutadorAction(
  data: tNovaEmpresa
): Promise<AdminActionResult> {
  const { isAuthorized, role } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  const validation = novaEmpresaSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados do formulário inválidos.' };
  }

  const { nomeEmpresa, cnpj, nomeRecrutador, emailRecrutador, senhaRecrutador } = validation.data;

  try {
    const emailEmUso = await prisma.usuario.findUnique({ where: { email: emailRecrutador } });
    if (emailEmUso) {
      return { success: false, error: 'Este e-mail já está em uso.' };
    }

    const hashedPassword = await bcrypt.hash(senhaRecrutador, 10);

    await prisma.$transaction(async (tx) => {
      const novaEmpresa = await tx.empresa.create({
        data: {
          nome: nomeEmpresa,
          cnpj: cnpj || null,
        },
      });

      await tx.usuario.create({
        data: {
          nome: nomeRecrutador,
          email: emailRecrutador,
          senha: hashedPassword,
          role: RoleUsuario.RECRUTADOR,
          empresaId: novaEmpresa.id,
        },
      });
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar empresa com recrutador:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function procurarUsuariosAction(termoBusca: string): Promise<AdminActionResult> {
  const { isAuthorized, role } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  if (!termoBusca || termoBusca.length < 2) {
    return { success: true, data: [] };
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        OR: [
          { nome: { contains: termoBusca, mode: 'insensitive' } },
          { email: { contains: termoBusca, mode: 'insensitive' } },
          { numeroRA: { contains: termoBusca, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
      take: 10,
    });
    return { success: true, data: usuarios };
  } catch (error) {
    console.error('Erro ao procurar usuários:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function adminMudarSenhaUsuarioAction(
  usuarioId: string,
  novaSenha: string
): Promise<AdminActionResult> {
  const { isAuthorized, role } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  if (!usuarioId || !novaSenha || novaSenha.length < 6) {
    return { success: false, error: 'Dados inválidos para alteração de senha.' };
  }

  try {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao mudar senha do usuário:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function adminEditarUsuarioAction(data: tEditarUsuario): Promise<AdminActionResult> {
  const { isAuthorized, role: adminRole } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || adminRole !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  const validation = editarUsuarioSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados inválidos.' };
  }

  const { id, ...updateData } = validation.data;

  const dataPayload: Prisma.UsuarioUpdateInput = {
    nome: updateData.nome,
    email: updateData.email,
    role: updateData.role,
  };

  if (updateData.role === 'RECRUTADOR' && updateData.empresaId) {
    dataPayload.empresa = {
      connect: { id: updateData.empresaId },
    };
  } else {
    dataPayload.empresa = {
      disconnect: true,
    };
  }

  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dataPayload,
    });
    revalidatePath('/admin/usuarios');
    return { success: true, data: usuarioAtualizado };
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function getAdminDashboardStatsAction(): Promise<AdminActionResult> {
  const { isAuthorized, role } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const totalUsuarios = await prisma.usuario.count();
    const totalEmpresas = await prisma.empresa.count();
    return { success: true, data: { totalUsuarios, totalEmpresas } };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do admin:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function listarTodasEmpresasAction(
  params: { page: number; query?: string } = { page: 1 }
): Promise<ListarResult> {
  const { isAuthorized, role } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  const { page, query } = params;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const whereClause: Prisma.EmpresaWhereInput = {};
    if (query) {
      whereClause.OR = [
        { nome: { contains: query, mode: 'insensitive' } },
        { cnpj: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [empresas, total] = await prisma.$transaction([
      prisma.empresa.findMany({
        where: whereClause,
        select: { id: true, nome: true, cnpj: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.empresa.count({ where: whereClause }),
    ]);

    return { success: true, items: empresas, total };
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}
export async function listarTodosUsuariosAction(
  params: { page: number; query?: string; role?: RoleUsuario; status?: string } = { page: 1 }
): Promise<ListarResult> {
  const { isAuthorized, role: adminRole } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || adminRole !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  const { page, query, role, status } = params;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const whereClause: Prisma.UsuarioWhereInput = {};
    if (query) {
      whereClause.OR = [
        { nome: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { numeroRA: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (role) {
      whereClause.role = role;
    }
    if (status) {
      whereClause.ativo = status === 'ATIVO';
    }

    const [usuarios, total] = await prisma.$transaction([
      prisma.usuario.findMany({
        where: whereClause,
        select: {
          id: true,
          nome: true,
          email: true,
          numeroRA: true,
          role: true,
          ativo: true,
          criadoEm: true,
          empresaId: true,
        },
        orderBy: [{ ativo: 'desc' }, { criadoEm: 'desc' }],
        take: limit,
        skip: skip,
      }),
      prisma.usuario.count({ where: whereClause }),
    ]);

    return { success: true, items: usuarios, total };
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function adminToggleUsuarioAtivoAction(usuarioId: string): Promise<AdminActionResult> {
  const { isAuthorized, role, userId: adminId } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  if (usuarioId === adminId) {
    return { success: false, error: 'Você não pode inativar sua própria conta.' };
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { ativo: true },
    });

    if (!usuario) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const novoStatus = !usuario.ativo;
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { ativo: novoStatus },
    });

    revalidatePath('/admin/usuarios');
    return { success: true, data: { novoStatus } };
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}

export async function adminEditarEmpresaAction(data: tEmpresaForm): Promise<AdminActionResult> {
  const { isAuthorized, role } = await authorizeUser([RoleUsuario.ADMIN]);
  if (!isAuthorized || role !== RoleUsuario.ADMIN) {
    return { success: false, error: 'Acesso negado.' };
  }

  const validation = empresaFormSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados de formulário inválidos.' };
  }

  const { id, ...updateData } = validation.data;

  try {
    const empresaAtualizada = await prisma.empresa.update({
      where: { id },
      data: {
        ...updateData,
        cnpj: updateData.cnpj || null,
      },
    });
    revalidatePath('/admin/empresas');
    return { success: true, data: empresaAtualizada };
  } catch (error) {
    console.error('Erro ao editar empresa:', error);
    return { success: false, error: 'Ocorreu um erro no servidor.' };
  }
}
