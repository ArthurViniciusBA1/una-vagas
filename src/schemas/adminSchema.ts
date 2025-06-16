import { z } from 'zod';
import { RoleUsuario } from '@prisma/client';

export const novaEmpresaSchema = z.object({
  nomeEmpresa: z.string().min(3, 'O nome da empresa é obrigatório.'),
  cnpj: z.string().optional().or(z.literal('')),

  nomeRecrutador: z.string().min(3, 'O nome do recrutador é obrigatório.'),
  emailRecrutador: z.string().email('O e-mail do recrutador é inválido.'),
  senhaRecrutador: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export const mudarSenhaAdminSchema = z
  .object({
    novaSenha: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres.'),
    confirmarNovaSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarNovaSenha'],
  });

export const editarUsuarioSchema = z
  .object({
    id: z.string(),
    nome: z.string().min(3, 'O nome é obrigatório.'),
    email: z.string().email('O e-mail é inválido.'),
    role: z.nativeEnum(RoleUsuario),
    empresaId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'RECRUTADOR') {
        return !!data.empresaId;
      }
      return true;
    },
    {
      message: 'A seleção de uma empresa é obrigatória para recrutadores.',
      path: ['empresaId'],
    }
  );

export const empresaFormSchema = z.object({
  id: z.string(),
  nome: z.string().min(3, 'O nome da empresa é obrigatório.'),
  descricao: z
    .string()
    .max(2000, 'A descrição não pode exceder 2000 caracteres.')
    .optional()
    .or(z.literal('')),
  cnpj: z
    .string()
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      'Formato de CNPJ inválido. Use 00.000.000/0000-00.'
    )
    .optional()
    .or(z.literal('')),
  websiteUrl: z.string().url('URL do website inválida.').optional().or(z.literal('')),
  logoUrl: z.string().url('URL do logo inválida.').optional().or(z.literal('')),
});

export type tNovaEmpresa = z.infer<typeof novaEmpresaSchema>;
export type tMudarSenhaAdmin = z.infer<typeof mudarSenhaAdminSchema>;
export type tEditarUsuario = z.infer<typeof editarUsuarioSchema>;
export type tEmpresaForm = z.infer<typeof empresaFormSchema>;
