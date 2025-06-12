// src/app/candidato/curriculo/[curriculoId]/page.tsx
import {
  Award,
  Briefcase,
  FileText,
  Github,
  Languages,
  Lightbulb,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  Pencil,
} from 'lucide-react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ReactNode } from 'react';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Link from 'next/link';
import { Prisma, RoleUsuario } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { CurriculoSecaoModal } from '@/components/curriculo/modals/CurriculoSecaoModal';
import { InformacoesPessoaisForm } from '@/components/curriculo/forms/InformacoesPessoaisForm';
import { ExperienciaHub } from '@/components/curriculo/management/ExperienciaHub';
import { FormacaoHub } from '@/components/curriculo/management/FormacaoHub';
import { HabilidadeHub } from '@/components/curriculo/management/HabilidadeHub';
import { IdiomaHub } from '@/components/curriculo/management/IdiomaHub';
import { ProjetoHub } from '@/components/curriculo/management/ProjetoHub';
import { CertificacaoHub } from '@/components/curriculo/management/CertificacaoHub';

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

function formatarData(data: Date | null | undefined): string {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function PaginaVisualizacaoCurriculo({
  params,
  searchParams,
}: {
  params: { curriculoId: string };
  searchParams: { edit?: string };
}) {
  const { curriculoId } = params;
  const isEditMode = searchParams.edit === 'true';

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