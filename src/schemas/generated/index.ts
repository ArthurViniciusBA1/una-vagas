import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UsuarioScalarFieldEnumSchema = z.enum(['id','email','senha','nome','numeroRA','fotoUrl','role','empresaId','criadoEm','atualizadoEm']);

export const EmpresaScalarFieldEnumSchema = z.enum(['id','nome','cnpj','descricao','websiteUrl','logoUrl','cadastradaPorId','criadoEm','atualizadoEm']);

export const CurriculoScalarFieldEnumSchema = z.enum(['id','titulo','resumoProfissional','telefone','linkedinUrl','githubUrl','portfolioUrl','endereco','visibilidade','usuarioId','criadoEm','atualizadoEm']);

export const ExperienciaProfissionalScalarFieldEnumSchema = z.enum(['id','cargo','nomeEmpresa','local','dataInicio','dataFim','descricao','trabalhoAtual','curriculoId']);

export const FormacaoAcademicaScalarFieldEnumSchema = z.enum(['id','instituicao','curso','areaEstudo','dataInicio','dataFim','descricao','emCurso','curriculoId']);

export const HabilidadeScalarFieldEnumSchema = z.enum(['id','nome','categoria','curriculoId']);

export const IdiomaScalarFieldEnumSchema = z.enum(['id','nome','nivel','curriculoId']);

export const ProjetoScalarFieldEnumSchema = z.enum(['id','nome','descricao','projectUrl','repositorioUrl','dataInicio','dataFim','tecnologiasUsadas','curriculoId']);

export const CertificacaoScalarFieldEnumSchema = z.enum(['id','nome','organizacaoEmissora','dataEmissao','credencialId','credencialUrl','curriculoId']);

export const VagaScalarFieldEnumSchema = z.enum(['id','titulo','descricao','requisitos','tipo','localizacao','salario','faixaSalarial','ativa','empresaId','criadoPorId','dataPublicacao','dataExpiracao','criadoEm','atualizadoEm']);

export const CandidaturaScalarFieldEnumSchema = z.enum(['id','dataCandidatura','status','cartaApresentacao','usuarioId','vagaId','criadoEm','atualizadoEm']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const RoleUsuarioSchema = z.enum(['CANDIDATO','RECRUTADOR','ADMIN']);

export type RoleUsuarioType = `${z.infer<typeof RoleUsuarioSchema>}`

export const NivelProficienciaSchema = z.enum(['INICIANTE','INTERMEDIARIO','AVANCADO','ESPECIALISTA','NATIVO']);

export type NivelProficienciaType = `${z.infer<typeof NivelProficienciaSchema>}`

export const TipoVagaSchema = z.enum(['ESTAGIO','EFETIVO','TRAINEE','TEMPORARIO','PROJETO']);

export type TipoVagaType = `${z.infer<typeof TipoVagaSchema>}`

export const StatusCandidaturaSchema = z.enum(['INSCRITO','VISUALIZADA','EM_PROCESSO','APROVADO','REJEITADO','CANCELADA']);

export type StatusCandidaturaType = `${z.infer<typeof StatusCandidaturaSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USUARIO SCHEMA
/////////////////////////////////////////

export const UsuarioSchema = z.object({
  role: RoleUsuarioSchema,
  id: z.string().cuid(),
  email: z.string(),
  senha: z.string(),
  nome: z.string(),
  numeroRA: z.string().nullable(),
  fotoUrl: z.string().nullable(),
  empresaId: z.string().nullable(),
  criadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date(),
})

export type Usuario = z.infer<typeof UsuarioSchema>

/////////////////////////////////////////
// EMPRESA SCHEMA
/////////////////////////////////////////

export const EmpresaSchema = z.object({
  id: z.string().cuid(),
  nome: z.string(),
  cnpj: z.string().nullable(),
  descricao: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  logoUrl: z.string().nullable(),
  cadastradaPorId: z.string().nullable(),
  criadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date(),
})

export type Empresa = z.infer<typeof EmpresaSchema>

/////////////////////////////////////////
// CURRICULO SCHEMA
/////////////////////////////////////////

export const CurriculoSchema = z.object({
  id: z.string().cuid(),
  titulo: z.string(),
  resumoProfissional: z.string().nullable(),
  telefone: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  endereco: z.string().nullable(),
  visibilidade: z.boolean(),
  usuarioId: z.string(),
  criadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date(),
})

export type Curriculo = z.infer<typeof CurriculoSchema>

/////////////////////////////////////////
// EXPERIENCIA PROFISSIONAL SCHEMA
/////////////////////////////////////////

export const ExperienciaProfissionalSchema = z.object({
  id: z.string().cuid(),
  cargo: z.string(),
  nomeEmpresa: z.string(),
  local: z.string().nullable(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable(),
  descricao: z.string().nullable(),
  trabalhoAtual: z.boolean(),
  curriculoId: z.string(),
})

export type ExperienciaProfissional = z.infer<typeof ExperienciaProfissionalSchema>

/////////////////////////////////////////
// FORMACAO ACADEMICA SCHEMA
/////////////////////////////////////////

export const FormacaoAcademicaSchema = z.object({
  id: z.string().cuid(),
  instituicao: z.string(),
  curso: z.string(),
  areaEstudo: z.string().nullable(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable(),
  descricao: z.string().nullable(),
  emCurso: z.boolean(),
  curriculoId: z.string(),
})

export type FormacaoAcademica = z.infer<typeof FormacaoAcademicaSchema>

/////////////////////////////////////////
// HABILIDADE SCHEMA
/////////////////////////////////////////

export const HabilidadeSchema = z.object({
  id: z.string().cuid(),
  nome: z.string(),
  categoria: z.string().nullable(),
  curriculoId: z.string(),
})

export type Habilidade = z.infer<typeof HabilidadeSchema>

/////////////////////////////////////////
// IDIOMA SCHEMA
/////////////////////////////////////////

export const IdiomaSchema = z.object({
  nivel: NivelProficienciaSchema,
  id: z.string().cuid(),
  nome: z.string(),
  curriculoId: z.string(),
})

export type Idioma = z.infer<typeof IdiomaSchema>

/////////////////////////////////////////
// PROJETO SCHEMA
/////////////////////////////////////////

export const ProjetoSchema = z.object({
  id: z.string().cuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  projectUrl: z.string().nullable(),
  repositorioUrl: z.string().nullable(),
  dataInicio: z.coerce.date().nullable(),
  dataFim: z.coerce.date().nullable(),
  tecnologiasUsadas: z.string().array(),
  curriculoId: z.string(),
})

export type Projeto = z.infer<typeof ProjetoSchema>

/////////////////////////////////////////
// CERTIFICACAO SCHEMA
/////////////////////////////////////////

export const CertificacaoSchema = z.object({
  id: z.string().cuid(),
  nome: z.string(),
  organizacaoEmissora: z.string(),
  dataEmissao: z.coerce.date(),
  credencialId: z.string().nullable(),
  credencialUrl: z.string().nullable(),
  curriculoId: z.string(),
})

export type Certificacao = z.infer<typeof CertificacaoSchema>

/////////////////////////////////////////
// VAGA SCHEMA
/////////////////////////////////////////

export const VagaSchema = z.object({
  tipo: TipoVagaSchema,
  id: z.string().cuid(),
  titulo: z.string(),
  descricao: z.string(),
  requisitos: z.string().array(),
  localizacao: z.string(),
  salario: z.number().nullable(),
  faixaSalarial: z.string().nullable(),
  ativa: z.boolean(),
  empresaId: z.string(),
  criadoPorId: z.string(),
  dataPublicacao: z.coerce.date(),
  dataExpiracao: z.coerce.date().nullable(),
  criadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date(),
})

export type Vaga = z.infer<typeof VagaSchema>

/////////////////////////////////////////
// CANDIDATURA SCHEMA
/////////////////////////////////////////

export const CandidaturaSchema = z.object({
  status: StatusCandidaturaSchema,
  id: z.string().cuid(),
  dataCandidatura: z.coerce.date(),
  cartaApresentacao: z.string().nullable(),
  usuarioId: z.string(),
  vagaId: z.string(),
  criadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date(),
})

export type Candidatura = z.infer<typeof CandidaturaSchema>
