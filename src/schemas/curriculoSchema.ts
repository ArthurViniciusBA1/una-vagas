import { z } from "zod";
import { NivelProficiencia, TipoVaga } from "@prisma/client";

// =================================================================
// ==                     SCHEMAS DO CURRÍCULO                    ==
// =================================================================

// Schema Informacoes Pessoais
export const curriculoInformacoesPessoaisSchema = z.object({
  tituloCurriculo: z.string()
    .min(1, "Título do currículo é obrigatório.")
    .max(100, "O título é muito longo."),
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

// Schema Habilidade
export const habilidadeSchema = z.object({
    id: z.string().optional(),
    nome: z.string().min(1, "O nome da habilidade é obrigatório.").max(100, "Nome muito longo."),
    nivel: z.nativeEnum(NivelProficiencia).optional(),
});
export type tHabilidade = z.infer<typeof habilidadeSchema>;

// Schema Idioma
export const idiomaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do idioma é obrigatório.").max(50),
  nivel: z.nativeEnum(NivelProficiencia, { required_error: "O nível é obrigatório." }),
});
export type tIdioma = z.infer<typeof idiomaSchema>;

// Schema Projeto
export const projetoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do projeto é obrigatório.").max(100),
  descricao: z.string().max(2000, "Descrição muito longa.").optional().or(z.literal('')),
  projectUrl: z.string().url("URL do projeto inválida.").optional().or(z.literal('')),
  repositorioUrl: z.string().url("URL do repositório inválida.").optional().or(z.literal('')),
});
export type tProjeto = z.infer<typeof projetoSchema>;

// Schema Certificacao
export const certificacaoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do certificado é obrigatório.").max(150),
  organizacaoEmissora: z.string().min(1, "A organização é obrigatória.").max(100),
  dataEmissao: z.string({ required_error: "Data de emissão é obrigatória." }).min(7, "Formato inválido."),
  credencialUrl: z.string().url("URL da credencial inválida.").optional().or(z.literal('')),
});
export type tCertificacao = z.infer<typeof certificacaoSchema>;


// =================================================================
// ==                      SCHEMAS DA EMPRESA                     ==
// =================================================================

// Schema Vaga
export const vagaSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, "Título da vaga é obrigatório.").max(100),
  descricao: z.string().min(10, "A descrição deve ser mais detalhada."),
  requisitos: z.string().min(1, "Os requisitos são obrigatórios."),
  tipo: z.nativeEnum(TipoVaga, { required_error: "O tipo da vaga é obrigatório." }),
  localizacao: z.string().min(1, "A localização é obrigatória."),
  faixaSalarial: z.string().optional().or(z.literal('')),
  ativa: z.boolean().default(true),
});
export type tVaga = z.infer<typeof vagaSchema>;