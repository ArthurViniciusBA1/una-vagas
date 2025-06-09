import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { habilidadeSchema } from '@/schemas/curriculoSchema';

interface TokenPayload extends JwtPayload {
  id: string;
  nome?: string;
  role?: RoleUsuario;
}

async function getUserAndCurriculo(token: string, jwtSecret: string) {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (!decodedToken?.id || (decodedToken.role !== RoleUsuario.CANDIDATO && decodedToken.role !== RoleUsuario.ADMIN)) {
      throw new Error("Não autorizado.");
    }
    const userId = decodedToken.id;

    let curriculo = await prisma.curriculo.findUnique({ where: { usuarioId: userId } });
    if (!curriculo) {
      curriculo = await prisma.curriculo.create({ data: { usuarioId: userId, titulo: `Currículo de ${decodedToken.nome || 'Usuário'}` } });
    }
    return { userId, curriculoId: curriculo.id };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || !token) return NextResponse.json({ error: "Autenticação falhou." }, { status: 401 });

  try {
    const { curriculoId } = await getUserAndCurriculo(token, jwtSecret);
    const body = await request.json();
    const data = habilidadeSchema.parse(body);

    const novaHabilidade = await prisma.habilidade.create({
      data: {
        curriculoId: curriculoId,
        nome: data.nome,
      }
    });
    return NextResponse.json({ message: "Habilidade adicionada!", habilidade: novaHabilidade }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar habilidade:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao adicionar habilidade." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || !token) return NextResponse.json({ error: "Autenticação falhou." }, { status: 401 });
  
    try {
      const { userId } = await getUserAndCurriculo(token, jwtSecret);
      const body = await request.json();
      const data = habilidadeSchema.parse(body);
      if (!data.id) return NextResponse.json({ error: "ID da habilidade é obrigatório." }, { status: 400 });

      const habilidadeExistente = await prisma.habilidade.findFirst({ where: { id: data.id, curriculo: { usuarioId: userId } } });
      if (!habilidadeExistente) return NextResponse.json({ error: "Habilidade não encontrada." }, { status: 404 });
      
      const habilidadeAtualizada = await prisma.habilidade.update({
        where: { id: data.id },
        data: {
            nome: data.nome,
        }
      });
      return NextResponse.json({ message: "Habilidade atualizada!", habilidade: habilidadeAtualizada }, { status: 200 });
    } catch (error) {
      console.error("Erro ao atualizar habilidade:", error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar habilidade." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || !token) return NextResponse.json({ error: "Autenticação falhou." }, { status: 401 });

    try {
        const { userId } = await getUserAndCurriculo(token, jwtSecret);
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "ID da habilidade é obrigatório." }, { status: 400 });
        
        const habilidadeExistente = await prisma.habilidade.findFirst({ where: { id, curriculo: { usuarioId: userId } } });
        if (!habilidadeExistente) return NextResponse.json({ error: "Habilidade não encontrada." }, { status: 404 });

        await prisma.habilidade.delete({ where: { id } });
        return NextResponse.json({ message: "Habilidade removida!" }, { status: 200 });
    } catch (error) {
        console.error("Erro ao remover habilidade:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao remover." }, { status: 500 });
    }
}