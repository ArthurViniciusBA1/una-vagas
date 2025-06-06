import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { RoleUsuario } from '@prisma/client';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json({ error: "Configuração do servidor incompleta." }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (!decodedToken?.id || (decodedToken.role !== RoleUsuario.CANDIDATO && decodedToken.role !== RoleUsuario.ADMIN)) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decodedToken.id },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        numeroRA: true, 
        role: true,
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const curriculo = await prisma.curriculo.findUnique({
      where: { usuarioId: usuario.id },
      include: { 
        experienciasProfissionais: true,
        formacoesAcademicas: true,
        habilidades: true,
        idiomas: true,
        projetos: true,
        certificacoes: true,
      }
    });

    const curriculoData = curriculo ? {
        ...curriculo,
    } : null;


    return NextResponse.json({ usuario, curriculo: curriculoData });

  } catch (error) {
    console.error("API Error /api/candidato/meus-dados:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar dados do candidato." }, { status: 500 });
  }
}