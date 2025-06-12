// src/actions/curriculoParcialActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  experienciaProfissionalSchema,
  tExperienciaProfissional,
  formacaoAcademicaSchema,
  tFormacaoAcademica,
  habilidadeSchema,
  tHabilidade,
  idiomaSchema,
  tIdioma,
  projetoSchema,
  tProjeto,
  certificacaoSchema,
  tCertificacao,
  curriculoInformacoesPessoaisSchema, // Importe o schema
  tCurriculoInformacoesPessoais, // Importe o tipo
} from '@/schemas/curriculoSchema';

interface TokenPayload {
  id: string;
}

// --- A "FÁBRICA" DE ACTIONS (Higher-Order Function) ---
type ActionLogic<TInput, TOutput> = (input: TInput, userId: string) => Promise<TOutput>;

async function createProtectedAction<TInput, TOutput>(schema: z.ZodSchema<TInput> | null, logic: ActionLogic<TInput, TOutput>) {
  return async (
    input: TInput
  ): Promise<{
    success: boolean;
    error?: string;
    data?: TOutput;
  }> => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return { success: false, error: 'Não autenticado.' };

    try {
      const { id: userId } = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

      if (schema) {
        const validation = schema.safeParse(input);
        if (!validation.success)
          return {
            success: false,
            error: validation.error.errors.map((e) => e.message).join(', ') || 'Dados de entrada inválidos.', // Melhorar mensagem de erro
          };
      }

      const result = await logic(input, userId);

      revalidatePath('/candidato/dashboard');
      revalidatePath('/candidato/curriculo/editar-completo');

      return { success: true, data: result };
    } catch (e) {
      console.error('Action Error:', e);
      // Para erros de JWT, pode ser mais específico
      if (e instanceof jwt.JsonWebTokenError) {
        return { success: false, error: 'Token inválido ou expirado. Faça login novamente.' };
      }
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Ocorreu um erro no servidor.',
      };
    }
  };
}

// --- FUNÇÃO AUXILIAR ---
async function getCurriculoId(userId: string): Promise<string> {
  const curriculo = await prisma.curriculo.findUnique({
    where: { usuarioId: userId },
    select: { id: true },
  });
  if (curriculo) return curriculo.id;
  const novoCurriculo = await prisma.curriculo.create({
    data: { usuarioId: userId, titulo: 'Meu Currículo' },
  });
  return novoCurriculo.id;
}

// --- DEFINIÇÃO DAS ACTIONS ---

// Informações Pessoais (NOVA ACTION)
const saveInformacoesPessoaisLogic: ActionLogic<tCurriculoInformacoesPessoais, any> = async (data, userId) => {
  // Ajuste para campos opcionais vazios
  const dataToSave = {
    ...data,
    resumoProfissional: data.resumoProfissional || null,
    telefone: data.telefone || null,
    endereco: data.endereco || null,
    linkedinUrl: data.linkedinUrl || null,
    githubUrl: data.githubUrl || null,
    portfolioUrl: data.portfolioUrl || null,
  };

  return prisma.curriculo.upsert({
    where: { usuarioId: userId },
    update: dataToSave,
    create: {
      usuarioId: userId,
      ...dataToSave,
    },
  });
};
export const saveInformacoesPessoaisAction = await createProtectedAction(
  curriculoInformacoesPessoaisSchema,
  saveInformacoesPessoaisLogic
);

// Experiência Profissional
const saveExperienciaLogic: ActionLogic<tExperienciaProfissional, any> = async (data, userId) => {
  const { id, local, ...rest } = data;
  const prismaData = {
    ...rest,
    local,
    dataInicio: new Date(rest.dataInicio),
    dataFim: rest.dataFim ? new Date(rest.dataFim) : null,
  };
  const curriculoId = await getCurriculoId(userId);
  return prisma.experienciaProfissional.upsert({
    where: { id: id || '' },
    create: { ...prismaData, curriculoId },
    update: prismaData,
  });
};
const deleteExperienciaLogic: ActionLogic<string, any> = (id, userId) =>
  prisma.experienciaProfissional.delete({
    where: { id, curriculo: { usuarioId: userId } },
  });
export const saveExperienciaAction = await createProtectedAction(experienciaProfissionalSchema, saveExperienciaLogic);
export const deleteExperienciaAction = await createProtectedAction(z.string().min(1), deleteExperienciaLogic);

// Formação Acadêmica
const saveFormacaoLogic: ActionLogic<tFormacaoAcademica, any> = async (data, userId) => {
  const { id, ...rest } = data;
  const prismaData = {
    ...rest,
    dataInicio: new Date(rest.dataInicio),
    dataFim: rest.dataFim ? new Date(rest.dataFim) : null,
  };
  const curriculoId = await getCurriculoId(userId);
  return prisma.formacaoAcademica.upsert({
    where: { id: id || '' },
    create: { ...prismaData, curriculoId },
    update: prismaData,
  });
};
const deleteFormacaoLogic: ActionLogic<string, any> = (id, userId) =>
  prisma.formacaoAcademica.delete({
    where: { id, curriculo: { usuarioId: userId } },
  });
export const saveFormacaoAction = await createProtectedAction(formacaoAcademicaSchema, saveFormacaoLogic);
export const deleteFormacaoAction = await createProtectedAction(z.string().min(1), deleteFormacaoLogic);

// Habilidade
const saveHabilidadeLogic: ActionLogic<tHabilidade, any> = async (data, userId) => {
  const { id, ...rest } = data;
  const curriculoId = await getCurriculoId(userId);
  return prisma.habilidade.upsert({
    where: { id: id || '' },
    create: { ...rest, curriculoId },
    update: rest,
  });
};
const deleteHabilidadeLogic: ActionLogic<string, any> = (id, userId) =>
  prisma.habilidade.delete({
    where: { id, curriculo: { usuarioId: userId } },
  });
export const saveHabilidadeAction = await createProtectedAction(habilidadeSchema, saveHabilidadeLogic);
export const deleteHabilidadeAction = await createProtectedAction(z.string().min(1), deleteHabilidadeLogic);

// Idioma
const saveIdiomaLogic: ActionLogic<tIdioma, any> = async (data, userId) => {
  const { id, ...rest } = data;
  const curriculoId = await getCurriculoId(userId);
  return prisma.idioma.upsert({
    where: { id: id || '' },
    create: { ...rest, curriculoId },
    update: rest,
  });
};
const deleteIdiomaLogic: ActionLogic<string, any> = (id, userId) =>
  prisma.idioma.delete({
    where: { id, curriculo: { usuarioId: userId } },
  });
export const saveIdiomaAction = await createProtectedAction(idiomaSchema, saveIdiomaLogic);
export const deleteIdiomaAction = await createProtectedAction(z.string().min(1), deleteIdiomaLogic);

// Projeto
const saveProjetoLogic: ActionLogic<tProjeto, any> = async (data, userId) => {
  const { id, ...rest } = data;
  const curriculoId = await getCurriculoId(userId);
  return prisma.projeto.upsert({
    where: { id: id || '' },
    create: { ...rest, curriculoId },
    update: rest,
  });
};
const deleteProjetoLogic: ActionLogic<string, any> = (id, userId) =>
  prisma.projeto.delete({
    where: { id, curriculo: { usuarioId: userId } },
  });
export const saveProjetoAction = await createProtectedAction(projetoSchema, saveProjetoLogic);
export const deleteProjetoAction = await createProtectedAction(z.string().min(1), deleteProjetoLogic);

// Certificação
const saveCertificacaoLogic: ActionLogic<tCertificacao, any> = async (data, userId) => {
  const { id, ...rest } = data;
  const prismaData = {
    ...rest,
    dataEmissao: new Date(rest.dataEmissao),
  };

  const curriculoId = await getCurriculoId(userId);
  return prisma.certificacao.upsert({
    where: { id: id || '' },
    create: { ...prismaData, curriculoId },
    update: prismaData,
  });
};
const deleteCertificacaoLogic: ActionLogic<string, any> = (id, userId) =>
  prisma.certificacao.delete({
    where: { id, curriculo: { usuarioId: userId } },
  });
export const saveCertificacaoAction = await createProtectedAction(certificacaoSchema, saveCertificacaoLogic);
export const deleteCertificacaoAction = await createProtectedAction(z.string().min(1), deleteCertificacaoLogic);
