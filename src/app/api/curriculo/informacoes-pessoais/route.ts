import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { curriculoInformacoesPessoaisSchema, tCurriculoInformacoesPessoais } from '@/schemas/curriculoSchema';
import { RoleUsuario } from '@prisma/client';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json({ error: "Configuração do servidor incompleta (JWT)." }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (!decodedToken || !decodedToken.id || (decodedToken.role !== RoleUsuario.CANDIDATO && decodedToken.role !== RoleUsuario.ADMIN) ) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const userId = decodedToken.id;
    const body = await request.json();

    const validationResult = curriculoInformacoesPessoaisSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Dados inválidos.", details: validationResult.error.format() }, { status: 400 });
    }

    const dataToSave: tCurriculoInformacoesPessoais = validationResult.data;

    let curriculo = await prisma.curriculo.findUnique({
      where: { usuarioId: userId },
    });

    if (curriculo) {
      curriculo = await prisma.curriculo.update({
        where: { id: curriculo.id },
        data: {
          titulo: dataToSave.tituloCurriculo,
          resumoProfissional: dataToSave.resumoProfissional,
          telefone: dataToSave.telefone,
          endereco: dataToSave.enderecoCompleto,
          linkedinUrl: dataToSave.linkedinUrl,
          githubUrl: dataToSave.githubUrl,
          portfolioUrl: dataToSave.portfolioUrl,
        },
      });
    } else {
      curriculo = await prisma.curriculo.create({
        data: {
          usuarioId: userId,
          titulo: dataToSave.tituloCurriculo,
          resumoProfissional: dataToSave.resumoProfissional,
          telefone: dataToSave.telefone,
          endereco: dataToSave.enderecoCompleto,
          linkedinUrl: dataToSave.linkedinUrl,
          githubUrl: dataToSave.githubUrl,
          portfolioUrl: dataToSave.portfolioUrl,
        },
      });
    }

    return NextResponse.json({ message: "Informações pessoais salvas com sucesso!", curriculo }, { status: 200 });

  } catch (error) {
    console.error("API Error /api/curriculo/informacoes-pessoais:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao salvar informações pessoais." }, { status: 500 });
  }
}