import { Usuario } from "@prisma/client"; 

import { prisma } from "../lib/prisma"; 

/**
 * Procura um usuário no banco de dados pelo ID.
 * @param id O ID do usuário.
 * @returns O objeto Usuario encontrado ou null se não for encontrado.
 */
export async function procurarUsuarioPorId(id: string): Promise<Usuario | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: id,
      },
    });
    return usuario;
  } catch (error) {
    console.error("Erro ao procurar usuário por ID:", error);
    throw new Error("Falha ao procurar usuário por ID.");
  }
}