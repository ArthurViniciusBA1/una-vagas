import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { certificacaoSchema } from '@/schemas/curriculoSchema';

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
    const data = certificacaoSchema.parse(body);

    const novaCertificacao = await prisma.certificacao.create({
      data: {
        curriculoId: curriculoId,
        nome: data.nome,
        organizacaoEmissora: data.organizacaoEmissora,
        dataEmissao: new Date(data.dataEmissao),
        credencialUrl: data.credencialUrl,
      }
    });
    return NextResponse.json({ message: "Certificação adicionada!", certificacao: novaCertificacao }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar certificação:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao adicionar certificação." }, { status: 500 });
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
      const data = certificacaoSchema.parse(body);
      if (!data.id) return NextResponse.json({ error: "ID da certificação é obrigatório." }, { status: 400 });

      const certificacaoExistente = await prisma.certificacao.findFirst({ where: { id: data.id, curriculo: { usuarioId: userId } } });
      if (!certificacaoExistente) return NextResponse.json({ error: "Certificação não encontrada." }, { status: 404 });
      
      const certificacaoAtualizada = await prisma.certificacao.update({
        where: { id: data.id },
        data: {
            nome: data.nome,
            organizacaoEmissora: data.organizacaoEmissora,
            dataEmissao: new Date(data.dataEmissao),
            credencialUrl: data.credencialUrl,
        }
      });
      return NextResponse.json({ message: "Certificação atualizada!", certificacao: certificacaoAtualizada }, { status: 200 });
    } catch (error) {
      console.error("Erro ao atualizar certificação:", error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar certificação." }, { status: 500 });
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
        if (!id) return NextResponse.json({ error: "ID da certificação é obrigatório." }, { status: 400 });
        
        const certificacaoExistente = await prisma.certificacao.findFirst({ where: { id, curriculo: { usuarioId: userId } } });
        if (!certificacaoExistente) return NextResponse.json({ error: "Certificação não encontrada." }, { status: 404 });

        await prisma.certificacao.delete({ where: { id } });
        return NextResponse.json({ message: "Certificação removida!" }, { status: 200 });
    } catch (error) {
        console.error("Erro ao remover certificação:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao remover." }, { status: 500 });
    }
}