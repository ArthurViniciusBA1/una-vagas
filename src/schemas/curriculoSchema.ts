import { z } from "zod";

// Schema Informacoes Pessoais
export const curriculoInformacoesPessoaisSchema = z.object({
  tituloCurriculo: z.string()
    .min(1, "Título do currículo é obrigatório.")
    .max(100),
  resumoProfissional: z.string()
    .max(2000, "O resumo não deve exceder 2000 caracteres.")
    .optional().or(z.literal('')),
  telefone: z.string()
    .max(20, "Telefone muito longo.")
    .optional().or(z.literal('')),
  enderecoCompleto: z.string()
    .max(255, "Endereço muito longo.")
    .optional().or(z.literal('')),
  linkedinUrl: z.string()
    .url({ message: "URL do LinkedIn inválida." })
    .optional().or(z.literal('')),
  githubUrl: z.string()
    .url({ message: "URL do GitHub inválida." })
    .optional().or(z.literal('')),
  portfolioUrl: z.string()
    .url({ message: "URL do Portfólio inválida." })
    .optional().or(z.literal('')),
});

export type tCurriculoInformacoesPessoais = z.infer<typeof curriculoInformacoesPessoaisSchema>;

// Schema Experiencia Profissional
export const experienciaProfissionalSchema = z.object({
  id: z.string().optional(),
  cargo: z.string()
    .min(1, "Cargo é obrigatório.")
    .max(100),
  nomeEmpresa: z.string()
    .min(1, "Nome da empresa é obrigatório.")
    .max(100),
  localidade: z.string()
    .max(100)
    .optional().or(z.literal('')),
  dataInicio: z.string({ required_error: "Data de início é obrigatória." })
    .min(7, "Formato inválido. Use AAAA-MM."),
  dataFim: z.string()
    .optional().or(z.literal('')),
  trabalhoAtual: z.boolean(),
  descricao: z.string()
    .max(2500, "A descrição é muito longa.")
    .optional().or(z.literal('')),
});

export type tExperienciaProfissional = z.infer<typeof experienciaProfissionalSchema>;

// Schema Formacao Academica
export const formacaoAcademicaSchema = z.object({
  id: z.string().optional(),
  instituicao: z.string()
    .min(1, "Instituição é obrigatória.")
    .max(100),
  curso: z.string()
    .min(1, "Nome do curso é obrigatório.")
    .max(100),
  areaEstudo: z.string()
    .max(100)
    .optional().or(z.literal('')),
  dataInicio: z.string({ required_error: "Data de início é obrigatória." })
    .min(7, "Formato inválido."),
  dataFim: z.string()
    .optional().or(z.literal('')),
  emCurso: z.boolean(),
  descricao: z.string()
    .max(2500, "A descrição é muito longa.")
    .optional().or(z.literal('')),
});

export type tFormacaoAcademica = z.infer<typeof formacaoAcademicaSchema>;
