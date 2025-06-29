/* eslint-disable @typescript-eslint/no-unused-vars */
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Prisma, RoleUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';

import CurriculoViewerWithEdit from './CurriculoViewerWithEdit';

const curriculoQueryArgs = {
  include: {
    usuario: { select: { id: true, nome: true, email: true } },
    experienciasProfissionais: { orderBy: { dataInicio: 'desc' as const } },
    formacoesAcademicas: { orderBy: { dataInicio: 'desc' as const } },
    habilidades: { orderBy: { nome: 'asc' as const } },
    idiomas: { orderBy: { nome: 'asc' as const } },
    projetos: { orderBy: { nome: 'asc' as const } },
    certificacoes: { orderBy: { dataEmissao: 'desc' as const } },
  },
};

type CurriculoCompleto = Prisma.CurriculoGetPayload<typeof curriculoQueryArgs>;

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

export default async function PaginaVisualizacaoCurriculo({
  params,
  searchParams,
}: {
  params: Promise<{ curriculoId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { curriculoId } = await params;
  const resolvedSearchParams = await searchParams;
  const isEditMode = resolvedSearchParams.edit === 'true';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    redirect('/entrar');
  }

  const curriculo: CurriculoCompleto | null = await prisma.curriculo.findUnique({
    where: { id: curriculoId },
    ...curriculoQueryArgs,
  });

  if (!curriculo) {
    notFound();
  }

  let loggedInUserId: string | null = null;

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    loggedInUserId = decodedToken.id;

    if (decodedToken.id !== curriculo.usuarioId && decodedToken.role !== RoleUsuario.ADMIN) {
      redirect('/acesso-negado');
    }
  } catch (error) {
    redirect('/entrar');
  }

  return (
    <CurriculoViewerWithEdit
      curriculo={curriculo}
      isEditMode={isEditMode}
      loggedInUserId={loggedInUserId}
    />
  );
}
