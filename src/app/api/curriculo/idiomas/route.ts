import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { idiomaSchema } from '@/schemas/curriculoSchema';
import { RoleUsuario } from '@prisma/client';

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
    const data = idiomaSchema.parse(body);

    const novoIdioma = await prisma.idioma.create({
      data: {
        curriculoId: curriculoId,
        nome: data.nome,
        nivel: data.nivel,
      }
    });
    return NextResponse.json({ message: "Idioma adicionado!", idioma: novoIdioma }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar idioma:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao adicionar idioma." }, { status: 500 });
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
      const data = idiomaSchema.parse(body);
      if (!data.id) return NextResponse.json({ error: "ID do idioma é obrigatório." }, { status: 400 });

      const idiomaExistente = await prisma.idioma.findFirst({ where: { id: data.id, curriculo: { usuarioId: userId } } });
      if (!idiomaExistente) return NextResponse.json({ error: "Idioma não encontrado." }, { status: 404 });
      
      const idiomaAtualizado = await prisma.idioma.update({
        where: { id: data.id },
        data: {
            nome: data.nome,
            nivel: data.nivel,
        }
      });
      return NextResponse.json({ message: "Idioma atualizado!", idioma: idiomaAtualizado }, { status: 200 });
    } catch (error) {
      console.error("Erro ao atualizar idioma:", error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar idioma." }, { status: 500 });
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
        if (!id) return NextResponse.json({ error: "ID do idioma é obrigatório." }, { status: 400 });
        
        const idiomaExistente = await prisma.idioma.findFirst({ where: { id, curriculo: { usuarioId: userId } } });
        if (!idiomaExistente) return NextResponse.json({ error: "Idioma não encontrado." }, { status: 404 });

        await prisma.idioma.delete({ where: { id } });
        return NextResponse.json({ message: "Idioma removido!" }, { status: 200 });
    } catch (error) {
        console.error("Erro ao remover idioma:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao remover." }, { status: 500 });
    }
}