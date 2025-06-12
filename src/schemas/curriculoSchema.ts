// src/schemas/curriculoSchema.ts
import { z } from 'zod';
import {
  CurriculoSchema as generatedCurriculoSchema,
  ExperienciaProfissionalSchema as generatedExperienciaSchema,
  FormacaoAcademicaSchema as generatedFormacaoSchema,
  HabilidadeSchema as generatedHabilidadeSchema,
  IdiomaSchema as generatedIdiomaSchema,
  ProjetoSchema as generatedProjetoSchema,
  CertificacaoSchema as generatedCertificacaoSchema,
  VagaSchema as generatedVagaSchema,
} from './generated/prisma';

// --- SCHEMAS DE FORMULÁRIO ---

export const curriculoInformacoesPessoaisSchema = generatedCurriculoSchema
  .pick({
    titulo: true,
    resumoProfissional: true,
    telefone: true,
    endereco: true,
    linkedinUrl: true,
    githubUrl: true,
    portfolioUrl: true,
  })
  .extend({
    titulo: z.string().min(1, 'Título do currículo é obrigatório.'),
    resumoProfissional: z.string().max(2000).optional().or(z.literal('')),
    telefone: z.string().max(20).optional().or(z.literal('')),
    endereco: z.string().max(255).optional().or(z.literal('')),
    linkedinUrl: z.string().url({ message: 'URL do LinkedIn inválida.' }).optional().or(z.literal('')),
    githubUrl: z.string().url({ message: 'URL do GitHub inválida.' }).optional().or(z.literal('')),
    portfolioUrl: z.string().url({ message: 'URL do Portfólio inválida.' }).optional().or(z.literal('')),
  });

export const experienciaProfissionalSchema = generatedExperienciaSchema
  .extend({
    id: z.string().optional(),
    curriculoId: z.string().optional(),
    cargo: z.string().min(1, 'Cargo é obrigatório.'),
    nomeEmpresa: z.string().min(1, 'Nome da empresa é obrigatório.'),
    // CORREÇÃO: Usando z.string().refine para validar o formato da data como 'YYYY-MM'
    // e transform. No contexto do formulário, ela é uma string.
    dataInicio: z
      .string({
        required_error: 'Data de início é obrigatória.',
      })
      .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
      .transform((str) => {
        // Zod inferirá como string no input, mas para o Prisma, precisamos de Date
        // A conversão para Date é feita na Server Action, aqui validamos apenas o formato string.
        return str; // A transformação real para Date ocorrerá na action
      }),
    dataFim: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
      .optional()
      .or(z.literal('')), // Permite string vazia
    local: z.string().max(100).optional().or(z.literal('')),
    descricao: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.trabalhoAtual) {
        return data.dataFim && data.dataFim.length > 0;
      }
      return true;
    },
    {
      message: 'A data de fim é obrigatória se não for o seu trabalho atual.',
      path: ['dataFim'],
    }
  );

export const formacaoAcademicaSchema = generatedFormacaoSchema
  .extend({
    id: z.string().optional(),
    curriculoId: z.string().optional(),
    instituicao: z.string().min(1, 'Instituição é obrigatória.'),
    curso: z.string().min(1, 'Nome do curso é obrigatório.'),
    // CORREÇÃO: Usando z.string().refine para validar o formato da data como 'YYYY-MM'
    dataInicio: z
      .string({
        required_error: 'Data de início é obrigatória.',
      })
      .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
      .transform((str) => {
        return str; // A transformação real para Date ocorrerá na action
      }),
    dataFim: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
      .optional()
      .or(z.literal('')), // Permite string vazia
    areaEstudo: z.string().max(255).optional().or(z.literal('')),
    descricao: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.emCurso) {
        return data.dataFim && data.dataFim.length > 0;
      }
      return true;
    },
    {
      message: 'A data de fim é obrigatória se não for em curso.',
      path: ['dataFim'],
    }
  );

export const habilidadeSchema = generatedHabilidadeSchema.pick({ nome: true }).extend({
  id: z.string().optional(),
  curriculoId: z.string().optional(),
  nome: z.string().min(1, 'O nome da habilidade é obrigatório.'),
});

export const idiomaSchema = generatedIdiomaSchema.pick({ nome: true, nivel: true }).extend({
  id: z.string().optional(),
  curriculoId: z.string().optional(),
  nome: z.string().min(1, 'O nome do idioma é obrigatório.'),
});

export const projetoSchema = generatedProjetoSchema
  .pick({
    nome: true,
    descricao: true,
  })
  .extend({
    id: z.string().optional(),
    curriculoId: z.string().optional(),
    nome: z.string().min(1, 'O nome do projeto é obrigatório.'),
    projectUrl: z.string().url({ message: 'URL do Projeto inválida.' }).optional().or(z.literal('')),
    repositorioUrl: z.string().url({ message: 'URL do Repositório inválida.' }).optional().or(z.literal('')),
    // Adicionar as datas para consistência, se não estiverem já lá na generated
    dataInicio: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
      .optional()
      .or(z.literal('')),
    dataFim: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
      .optional()
      .or(z.literal('')),
    tecnologiasUsadas: z.array(z.string()).optional(), // Certificar-se que este campo é opcional e array
  });

export const certificacaoSchema = z.object({
  id: z.string().optional(),
  curriculoId: z.string().optional(),
  nome: z.string().min(1, 'O nome do certificado é obrigatório.'),
  organizacaoEmissora: z.string().min(1, 'A organização é obrigatória.'),
  // CORREÇÃO: Usando z.string().refine para validar o formato da data como 'YYYY-MM'
  dataEmissao: z
    .string({
      required_error: 'Data de emissão é obrigatória.',
    })
    .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
    .transform((str) => {
      return str; // A transformação real para Date ocorrerá na action
    }),
  // CORREÇÃO: dataExpiracao também como string opcional
  dataExpiracao: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Formato de data inválido (YYYY-MM).')
    .optional()
    .or(z.literal('')), // Permite string vazia
  credencialId: z.string().optional().or(z.literal('')),
  credencialUrl: z.string().url({ message: 'URL da credencial inválida.' }).optional().or(z.literal('')),
});

// Schema para o currículo completo, unindo todos os outros
export const curriculoCompletoSchema = curriculoInformacoesPessoaisSchema.extend({
  experienciasProfissionais: z.array(experienciaProfissionalSchema).optional(),
  formacoesAcademicas: z.array(formacaoAcademicaSchema).optional(),
  habilidades: z.array(habilidadeSchema).optional(),
  idiomas: z.array(idiomaSchema).optional(),
  projetos: z.array(projetoSchema).optional(),
  certificacoes: z.array(certificacaoSchema).optional(),
});

// --- TIPOS INFERIDOS ---

export type tCurriculoInformacoesPessoais = z.infer<typeof curriculoInformacoesPessoaisSchema>;
export type tExperienciaProfissional = z.infer<typeof experienciaProfissionalSchema>;
export type tFormacaoAcademica = z.infer<typeof formacaoAcademicaSchema>;
export type tHabilidade = z.infer<typeof habilidadeSchema>;
export type tIdioma = z.infer<typeof idiomaSchema>;
export type tProjeto = z.infer<typeof projetoSchema>;
export type tCertificacao = z.infer<typeof certificacaoSchema>;

export type tCurriculoCompleto = z.infer<typeof curriculoCompletoSchema>;