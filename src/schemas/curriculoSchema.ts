import { z } from "zod";
import { NivelProficiencia, TipoVaga } from "@prisma/client";

// =================================================================
// ==                     SCHEMAS DO CURRÍCULO                    ==
// =================================================================

// Schema Informacoes Pessoais
export const curriculoInformacoesPessoaisSchema = z.object({
  titulo: z.string() // MUDANÇA: de 'tituloCurriculo' para 'titulo'
    .min(1, "Título do currículo é obrigatório.")
    .max(100, "O título é muito longo."),
  resumoProfissional: z.string()
    .max(2000, "O resumo não deve exceder 2000 caracteres.")
    .optional().or(z.literal('')),
  telefone: z.string()
    .max(20, "Telefone muito longo.")
    .optional().or(z.literal('')),
  endereco: z.string() // MUDANÇA: de 'enderecoCompleto' para 'endereco'
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

// ... O restante do arquivo permanece igual ...
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

export const habilidadeSchema = z.object({
    id: z.string().optional(),
    nome: z.string().min(1, "O nome da habilidade é obrigatório.").max(100, "Nome muito longo."),
});
export type tHabilidade = z.infer<typeof habilidadeSchema>;

export const idiomaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do idioma é obrigatório.").max(50),
  nivel: z.nativeEnum(NivelProficiencia, { required_error: "O nível é obrigatório." }),
});
export type tIdioma = z.infer<typeof idiomaSchema>;

export const projetoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do projeto é obrigatório.").max(100),
  descricao: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().max(2000, "Descrição muito longa.").optional()
  ),
  projectUrl: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().url("URL do projeto inválida.").optional()
  ),
  repositorioUrl: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().url("URL do repositório inválida.").optional()
  ),
});
export type tProjeto = z.infer<typeof projetoSchema>;

export const certificacaoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do certificado é obrigatório.").max(150),
  organizacaoEmissora: z.string().min(1, "A organização é obrigatória.").max(100),
  dataEmissao: z.string({ required_error: "Data de emissão é obrigatória." }).min(7, "Formato inválido."),
  credencialUrl: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().url("URL da credencial inválida.").optional()
  ),
});
export type tCertificacao = z.infer<typeof certificacaoSchema>;

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