import { z } from 'zod';
import { NivelProficiencia, TipoVaga } from '@prisma/client';

// Este schema agora é simples, apenas com as regras de validação.
// A conversão de dados será feita nos componentes.

export const curriculoInformacoesPessoaisSchema = z.object({
  titulo: z.string().min(1, 'Título do currículo é obrigatório.').max(100),
  resumoProfissional: z.string().max(2000).optional(),
  telefone: z.string().max(20).optional(),
  endereco: z.string().max(255).optional(),
  linkedinUrl: z
    .string()
    .url({ message: 'URL do LinkedIn inválida.' })
    .optional(),
  githubUrl: z.string().url({ message: 'URL do GitHub inválida.' }).optional(),
  portfolioUrl: z
    .string()
    .url({ message: 'URL do Portfólio inválida.' })
    .optional(),
});
export type tCurriculoInformacoesPessoais = z.infer<
  typeof curriculoInformacoesPessoaisSchema
>;

export const experienciaProfissionalSchema = z.object({
  id: z.string().optional(),
  cargo: z.string().min(1, 'Cargo é obrigatório.').max(100),
  nomeEmpresa: z.string().min(1, 'Nome da empresa é obrigatório.').max(100),
  localidade: z.string().max(100).optional(),
  dataInicio: z
    .string({ required_error: 'Data de início é obrigatória.' })
    .min(7, 'Formato inválido.'),
  dataFim: z.string().optional(),
  trabalhoAtual: z.boolean(),
  descricao: z.string().max(2500).optional(),
});
export type tExperienciaProfissional = z.infer<
  typeof experienciaProfissionalSchema
>;

export const formacaoAcademicaSchema = z.object({
  id: z.string().optional(),
  instituicao: z.string().min(1, 'Instituição é obrigatória.').max(100),
  curso: z.string().min(1, 'Nome do curso é obrigatório.').max(100),
  areaEstudo: z.string().max(100).optional(),
  dataInicio: z
    .string({ required_error: 'Data de início é obrigatória.' })
    .min(7),
  dataFim: z.string().optional(),
  emCurso: z.boolean(),
  descricao: z.string().max(2500).optional(),
});
export type tFormacaoAcademica = z.infer<typeof formacaoAcademicaSchema>;

export const habilidadeSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'O nome da habilidade é obrigatório.').max(100),
});
export type tHabilidade = z.infer<typeof habilidadeSchema>;

export const idiomaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'O nome do idioma é obrigatório.').max(50),
  nivel: z.nativeEnum(NivelProficiencia, {
    required_error: 'O nível é obrigatório.',
  }),
});
export type tIdioma = z.infer<typeof idiomaSchema>;

export const projetoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'O nome do projeto é obrigatório.').max(100),
  descricao: z.string().max(2000).optional(),
  projectUrl: z
    .string()
    .url({ message: 'URL do projeto inválida.' })
    .optional(),
  repositorioUrl: z
    .string()
    .url({ message: 'URL do repositório inválida.' })
    .optional(),
});
export type tProjeto = z.infer<typeof projetoSchema>;

export const certificacaoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'O nome do certificado é obrigatório.').max(150),
  organizacaoEmissora: z
    .string()
    .min(1, 'A organização é obrigatória.')
    .max(100),
  dataEmissao: z
    .string({ required_error: 'Data de emissão é obrigatória.' })
    .min(7),
  credencialUrl: z
    .string()
    .url({ message: 'URL da credencial inválida.' })
    .optional(),
});
export type tCertificacao = z.infer<typeof certificacaoSchema>;

export const vagaSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, 'Título da vaga é obrigatório.').max(100),
  descricao: z.string().min(10, 'A descrição deve ser mais detalhada.'),
  requisitos: z.string().min(1, 'Os requisitos são obrigatórios.'),
  tipo: z.nativeEnum(TipoVaga, {
    required_error: 'O tipo da vaga é obrigatório.',
  }),
  localizacao: z.string().min(1, 'A localização é obrigatória.'),
  faixaSalarial: z.string().optional(),
  ativa: z.boolean().default(true),
});
export type tVaga = z.infer<typeof vagaSchema>;

// Schema para o currículo completo, unindo todos os outros
export const curriculoCompletoSchema = curriculoInformacoesPessoaisSchema.extend({
  experienciasProfissionais: z.array(experienciaProfissionalSchema).optional(),
  formacoesAcademicas: z.array(formacaoAcademicaSchema).optional(),
  habilidades: z.array(habilidadeSchema).optional(),
  idiomas: z.array(idiomaSchema).optional(),
  projetos: z.array(projetoSchema).optional(),
  certificacoes: z.array(certificacaoSchema).optional(),
});

export type tCurriculoCompleto = z.infer<typeof curriculoCompletoSchema>;