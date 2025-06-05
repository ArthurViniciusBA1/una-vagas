/*
  Warnings:

  - You are about to drop the column `numeroMatricula` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroRA]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "usuarios_numeroMatricula_key";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "numeroMatricula",
ADD COLUMN     "numeroRA" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_numeroRA_key" ON "usuarios"("numeroRA");
