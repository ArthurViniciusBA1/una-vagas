import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

interface ApiCurriculoResumo {
  id?: string;
  tituloCurriculo?: string;
  resumoProfissional?: string;
  telefone?: string;
  enderecoCompleto?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  visibilidade?: boolean;
  temInformacoesPessoais?: boolean;
  numExperiencias?: number;
  numFormacoes?: number;
  numHabilidades?: number;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (!decodedToken?.id || (decodedToken.role !== RoleUsuario.CANDIDATO && decodedToken.role !== RoleUsuario.ADMIN)) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decodedToken.id },
      select: { id: true, nome: true, email: true, numeroRA: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const curriculoPrisma = await prisma.curriculo.findUnique({
      where: { usuarioId: usuario.id },
      select: {
        id: true,
        titulo: true,
        resumoProfissional: true,
        telefone: true,
        endereco: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        visibilidade: true,
        _count: {
          select: {
            experienciasProfissionais: true,
            formacoesAcademicas: true,
            habilidades: true,
          },
        },
      },
    });

    let curriculoResumoParaFrontend: ApiCurriculoResumo | null = null;

    if (curriculoPrisma) {
      curriculoResumoParaFrontend = {
        id: curriculoPrisma.id,
        tituloCurriculo: curriculoPrisma.titulo ?? undefined,
        resumoProfissional: curriculoPrisma.resumoProfissional ?? undefined,
        telefone: curriculoPrisma.telefone ?? undefined,
        enderecoCompleto: curriculoPrisma.endereco ?? undefined,
        linkedinUrl: curriculoPrisma.linkedinUrl ?? undefined,
        githubUrl: curriculoPrisma.githubUrl ?? undefined,
        portfolioUrl: curriculoPrisma.portfolioUrl ?? undefined,
        visibilidade: curriculoPrisma.visibilidade ?? undefined,
        temInformacoesPessoais: !!(curriculoPrisma.titulo || curriculoPrisma.id),
        numExperiencias: curriculoPrisma._count?.experienciasProfissionais || 0,
        numFormacoes: curriculoPrisma._count?.formacoesAcademicas || 0,
        numHabilidades: curriculoPrisma._count?.habilidades || 0,
      };
    }

    return NextResponse.json({ usuario, curriculoResumo: curriculoResumoParaFrontend });
  } catch (error) {
    console.error('API Error /api/candidato/dashboard-data:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard.' }, { status: 500 });
  }
}
