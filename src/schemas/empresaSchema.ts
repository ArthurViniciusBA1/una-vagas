import { z } from 'zod';

export const empresaFormSchema = z.object({
  id: z.string(),
  nome: z.string().min(3, 'O nome da empresa é obrigatório e deve ter ao menos 3 caracteres.'),
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

export type tEmpresaForm = z.infer<typeof empresaFormSchema>;
