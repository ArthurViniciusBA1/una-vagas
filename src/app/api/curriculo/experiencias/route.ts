import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { experienciaProfissionalSchema } from '@/schemas/curriculoSchema';

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
    const data = experienciaProfissionalSchema.parse(body);

    const novaExperiencia = await prisma.experienciaProfissional.create({
      data: {
        curriculoId: curriculoId,
        cargo: data.cargo,
        nomeEmpresa: data.nomeEmpresa,
        local: data.localidade || null,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.trabalhoAtual ? null : (data.dataFim ? new Date(data.dataFim) : null),
        trabalhoAtual: data.trabalhoAtual || false,
        descricao: data.descricao || null,
      }
    });
    return NextResponse.json({ message: "Experiência adicionada!", experiencia: novaExperiencia }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao adicionar experiência." }, { status: 500 });
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
      const data = experienciaProfissionalSchema.parse(body);
      if (!data.id) return NextResponse.json({ error: "ID da experiência é obrigatório." }, { status: 400 });

      const experienciaExistente = await prisma.experienciaProfissional.findFirst({ where: { id: data.id, curriculo: { usuarioId: userId } } });
      if (!experienciaExistente) return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });
      
      const experienciaAtualizada = await prisma.experienciaProfissional.update({
        where: { id: data.id },
        data: {
            cargo: data.cargo,
            nomeEmpresa: data.nomeEmpresa,
            local: data.localidade || null,
            dataInicio: new Date(data.dataInicio),
            dataFim: data.trabalhoAtual ? null : (data.dataFim ? new Date(data.dataFim) : null),
            trabalhoAtual: data.trabalhoAtual || false,
            descricao: data.descricao || null,
        }
      });
      return NextResponse.json({ message: "Experiência atualizada!", experiencia: experienciaAtualizada }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar experiência." }, { status: 500 });
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
        if (!id) return NextResponse.json({ error: "ID da experiência é obrigatório." }, { status: 400 });
        
        const experienciaExistente = await prisma.experienciaProfissional.findFirst({ where: { id, curriculo: { usuarioId: userId } } });
        if (!experienciaExistente) return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });

        await prisma.experienciaProfissional.delete({ where: { id } });
        return NextResponse.json({ message: "Experiência removida!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao remover." }, { status: 500 });
    }
}