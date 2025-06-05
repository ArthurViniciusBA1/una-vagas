-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('CANDIDATO', 'RECRUTADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "NivelProficiencia" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'ESPECIALISTA', 'NATIVO');

-- CreateEnum
CREATE TYPE "TipoVaga" AS ENUM ('ESTAGIO', 'EFETIVO_JR', 'TRAINEE', 'TEMPORARIO', 'PROJETO');

-- CreateEnum
CREATE TYPE "StatusCandidatura" AS ENUM ('INSCRITO', 'VISUALIZADA', 'EM_PROCESSO', 'APROVADO', 'REJEITADO', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroMatricula" TEXT,
    "fotoUrl" TEXT,
    "role" "RoleUsuario" NOT NULL DEFAULT 'CANDIDATO',
    "empresaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "descricao" TEXT,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "cadastradaPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumoProfissional" TEXT,
    "telefone" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "endereco" TEXT,
    "visibilidade" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiencias_profissionais" (
    "id" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "nomeEmpresa" TEXT NOT NULL,
    "local" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "descricao" TEXT,
    "trabalhoAtual" BOOLEAN NOT NULL DEFAULT false,
    "curriculoId" TEXT NOT NULL,

    CONSTRAINT "experiencias_profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formacoes_academicas" (
    "id" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "areaEstudo" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "descricao" TEXT,
    "emCurso" BOOLEAN NOT NULL DEFAULT false,
    "curriculoId" TEXT NOT NULL,

    CONSTRAINT "formacoes_academicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nivel" "NivelProficiencia",
    "categoria" TEXT,
    "curriculoId" TEXT NOT NULL,

    CONSTRAINT "habilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idiomas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nivel" "NivelProficiencia" NOT NULL,
    "curriculoId" TEXT NOT NULL,

    CONSTRAINT "idiomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos_pessoais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "projectUrl" TEXT,
    "repositorioUrl" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "tecnologiasUsadas" TEXT[],
    "curriculoId" TEXT NOT NULL,

    CONSTRAINT "projetos_pessoais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "organizacaoEmissora" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataExpiracao" TIMESTAMP(3),
    "credencialId" TEXT,
    "credencialUrl" TEXT,
    "curriculoId" TEXT NOT NULL,

    CONSTRAINT "certificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "requisitos" TEXT[],
    "tipo" "TipoVaga" NOT NULL,
    "localizacao" TEXT NOT NULL,
    "salario" DOUBLE PRECISION,
    "faixaSalarial" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "dataPublicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataExpiracao" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" TEXT NOT NULL,
    "dataCandidatura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusCandidatura" NOT NULL DEFAULT 'INSCRITO',
    "cartaApresentacao" TEXT,
    "usuarioId" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_numeroMatricula_key" ON "usuarios"("numeroMatricula");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nome_key" ON "empresas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "curriculos_usuarioId_key" ON "curriculos"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "habilidades_curriculoId_nome_key" ON "habilidades"("curriculoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "idiomas_curriculoId_nome_key" ON "idiomas"("curriculoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "candidaturas_usuarioId_vagaId_key" ON "candidaturas"("usuarioId", "vagaId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_cadastradaPorId_fkey" FOREIGN KEY ("cadastradaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculos" ADD CONSTRAINT "curriculos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiencias_profissionais" ADD CONSTRAINT "experiencias_profissionais_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "curriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formacoes_academicas" ADD CONSTRAINT "formacoes_academicas_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "curriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilidades" ADD CONSTRAINT "habilidades_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "curriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idiomas" ADD CONSTRAINT "idiomas_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "curriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos_pessoais" ADD CONSTRAINT "projetos_pessoais_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "curriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificacoes" ADD CONSTRAINT "certificacoes_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "curriculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "vagas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
