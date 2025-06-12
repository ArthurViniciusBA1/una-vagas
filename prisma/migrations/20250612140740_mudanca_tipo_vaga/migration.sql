/*
  Warnings:

  - The values [EFETIVO_JR] on the enum `TipoVaga` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoVaga_new" AS ENUM ('ESTAGIO', 'EFETIVO', 'TRAINEE', 'TEMPORARIO', 'PROJETO');
ALTER TABLE "vagas" ALTER COLUMN "tipo" TYPE "TipoVaga_new" USING ("tipo"::text::"TipoVaga_new");
ALTER TYPE "TipoVaga" RENAME TO "TipoVaga_old";
ALTER TYPE "TipoVaga_new" RENAME TO "TipoVaga";
DROP TYPE "TipoVaga_old";
COMMIT;
