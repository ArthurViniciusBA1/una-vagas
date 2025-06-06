import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { formacaoAcademicaSchema } from '@/schemas/curriculoSchema';
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
    const data = formacaoAcademicaSchema.parse(body);

    const novaFormacao = await prisma.formacaoAcademica.create({
      data: {
        curriculoId: curriculoId,
        instituicao: data.instituicao,
        curso: data.curso,
        areaEstudo: data.areaEstudo || null,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.emCurso ? null : (data.dataFim ? new Date(data.dataFim) : null),
        emCurso: data.emCurso,
        descricao: data.descricao || null,
      }
    });
    return NextResponse.json({ message: "Formação adicionada!", formacao: novaFormacao }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao adicionar formação." }, { status: 500 });
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
      const data = formacaoAcademicaSchema.parse(body);
      if (!data.id) return NextResponse.json({ error: "ID da formação é obrigatório." }, { status: 400 });

      const formacaoExistente = await prisma.formacaoAcademica.findFirst({ where: { id: data.id, curriculo: { usuarioId: userId } } });
      if (!formacaoExistente) return NextResponse.json({ error: "Formação não encontrada." }, { status: 404 });
      
      const formacaoAtualizada = await prisma.formacaoAcademica.update({
        where: { id: data.id },
        data: {
            instituicao: data.instituicao,
            curso: data.curso,
            areaEstudo: data.areaEstudo || null,
            dataInicio: new Date(data.dataInicio),
            dataFim: data.emCurso ? null : (data.dataFim ? new Date(data.dataFim) : null),
            emCurso: data.emCurso,
            descricao: data.descricao || null,
        }
      });
      return NextResponse.json({ message: "Formação atualizada!", formacao: formacaoAtualizada }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar formação." }, { status: 500 });
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
        if (!id) return NextResponse.json({ error: "ID da formação é obrigatório." }, { status: 400 });
        
        const formacaoExistente = await prisma.formacaoAcademica.findFirst({ where: { id, curriculo: { usuarioId: userId } } });
        if (!formacaoExistente) return NextResponse.json({ error: "Formação não encontrada." }, { status: 404 });

        await prisma.formacaoAcademica.delete({ where: { id } });
        return NextResponse.json({ message: "Formação removida!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao remover." }, { status: 500 });
    }
}