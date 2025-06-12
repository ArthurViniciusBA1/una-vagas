import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { curriculoInformacoesPessoaisSchema } from '@/schemas/curriculoSchema';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json({ error: 'Configuração do servidor incompleta (JWT).' }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (
      !decodedToken ||
      !decodedToken.id ||
      (decodedToken.role !== RoleUsuario.CANDIDATO && decodedToken.role !== RoleUsuario.ADMIN)
    ) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const userId = decodedToken.id;
    const body = await request.json();

    const validationResult = curriculoInformacoesPessoaisSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Dados inválidos.', details: validationResult.error.format() }, { status: 400 });
    }

    const dataFromForm = validationResult.data;

    const dataToSave = {
      ...dataFromForm,
      resumoProfissional: dataFromForm.resumoProfissional || null,
      telefone: dataFromForm.telefone || null,
      endereco: dataFromForm.endereco || null,
      linkedinUrl: dataFromForm.linkedinUrl || null,
      githubUrl: dataFromForm.githubUrl || null,
      portfolioUrl: dataFromForm.portfolioUrl || null,
    };

    const curriculoAtualizado = await prisma.curriculo.upsert({
      where: { usuarioId: userId },
      update: dataToSave,
      create: {
        usuarioId: userId,
        ...dataToSave,
      },
    });

    return NextResponse.json(
      { message: 'Informações pessoais salvas com sucesso!', curriculo: curriculoAtualizado },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error /api/curriculo/informacoes-pessoais:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao salvar informações pessoais.' }, { status: 500 });
  }
}
