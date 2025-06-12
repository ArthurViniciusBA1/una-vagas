import { z } from 'zod';
import { VagaSchema as generatedVagaSchema, TipoVagaSchema } from './generated';

// --- SCHEMAS DE FORMULÁRIO ---

// ... (schemas existentes de currículo) ...

// --- SCHEMA PARA VAGA ---
export const vagaFormSchema = generatedVagaSchema
  .pick({
    titulo: true,
    descricao: true,
    requisitos: true,
    tipo: true,
    localizacao: true,
    faixaSalarial: true,
    ativa: true, // Para permitir inativar/ativar a vaga
    dataExpiracao: true,
  })
  .extend({
    id: z.string().optional(), // ID opcional para edição
    // Campos obrigatórios com mensagens customizadas
    titulo: z.string().min(3, 'O título da vaga é obrigatório e deve ter ao menos 3 caracteres.'),
    descricao: z
      .string()
      .min(20, 'A descrição da vaga é obrigatória e deve ter ao menos 20 caracteres.')
      .max(5000, 'A descrição é muito longa.'),
    localizacao: z.string().min(1, 'A localização da vaga é obrigatória.'),
    tipo: TipoVagaSchema,

    // Requisitos agora é uma string que será dividida em array
    requisitos: z.string().min(1, 'Os requisitos são obrigatórios. Separe-os por vírgula ou nova linha.'),

    // Faixa salarial é opcional
    faixaSalarial: z.string().optional().or(z.literal('')),

    // dataExpiracao opcional e pode ser vazia
    dataExpiracao: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data de expiração inválido (AAAA-MM-DD).')
      .optional()
      .or(z.literal('')), // Permite string vazia
  })
  .superRefine((data, ctx) => {
    // Exemplo de validação customizada para dataExpiracao
    if (data.dataExpiracao) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
      const expirationDate = new Date(data.dataExpiracao);

      if (expirationDate < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A data de expiração não pode ser anterior à data atual.',
          path: ['dataExpiracao'],
        });
      }
    }
  });

// --- TIPOS INFERIDOS ---

// ... (tipos existentes de currículo) ...

export type tVagaForm = z.infer<typeof vagaFormSchema>;
