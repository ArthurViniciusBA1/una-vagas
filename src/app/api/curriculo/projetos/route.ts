import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { projetoSchema } from '@/schemas/curriculoSchema';

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
    const data = projetoSchema.parse(body);

    const novoProjeto = await prisma.projeto.create({
      data: {
        curriculoId: curriculoId,
        nome: data.nome,
        descricao: data.descricao,
        projectUrl: data.projectUrl,
        repositorioUrl: data.repositorioUrl,
      }
    });
    return NextResponse.json({ message: "Projeto adicionado!", projeto: novoProjeto }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar projeto:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao adicionar projeto." }, { status: 500 });
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
      const data = projetoSchema.parse(body);
      if (!data.id) return NextResponse.json({ error: "ID do projeto é obrigatório." }, { status: 400 });

      const projetoExistente = await prisma.projeto.findFirst({ where: { id: data.id, curriculo: { usuarioId: userId } } });
      if (!projetoExistente) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
      
      const projetoAtualizado = await prisma.projeto.update({
        where: { id: data.id },
        data: {
            nome: data.nome,
            descricao: data.descricao,
            projectUrl: data.projectUrl,
            repositorioUrl: data.repositorioUrl,
        }
      });
      return NextResponse.json({ message: "Projeto atualizado!", projeto: projetoAtualizado }, { status: 200 });
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar projeto." }, { status: 500 });
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
        if (!id) return NextResponse.json({ error: "ID do projeto é obrigatório." }, { status: 400 });
        
        const projetoExistente = await prisma.projeto.findFirst({ where: { id, curriculo: { usuarioId: userId } } });
        if (!projetoExistente) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });

        await prisma.projeto.delete({ where: { id } });
        return NextResponse.json({ message: "Projeto removido!" }, { status: 200 });
    } catch (error) {
        console.error("Erro ao remover projeto:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao remover." }, { status: 500 });
    }
}