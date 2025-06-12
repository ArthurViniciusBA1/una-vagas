import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        numeroRA: true,
        email: true,
        role: true,
        empresaId: true,
        criadoEm: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar usuários para o painel de administração:', error);
    return NextResponse.json({ message: 'Erro ao buscar usuários.' }, { status: 500 });
  }
}
