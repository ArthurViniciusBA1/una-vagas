import { PrismaClient } from "@prisma/client";

// Declare uma variável global para o PrismaClient em ambiente de desenvolvimento
// Isso previne que o hot-reloading do Next.js crie múltiplas instâncias do PrismaClient.
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Verifica se estamos em ambiente de produção (Vercel ou outro)
// Em produção, cria uma nova instância do PrismaClient.
// Em desenvolvimento, usa a instância global para evitar problemas de hot-reloading.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };