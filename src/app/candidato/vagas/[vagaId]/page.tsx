import { Briefcase, Building2, Calendar, DollarSign, MapPin, Tag, UserRoundCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { RoleUsuario, Prisma } from '@prisma/client';
import { authorizeUser } from '@/lib/auth.server';
import { formatarData } from '@/lib/formatters';
import { Key } from 'react';

export default async function PaginaDetalheVaga({ params }: { params: Promise<{ vagaId: string }> }) {
  const { vagaId } = await params;

  const { isAuthorized } = await authorizeUser([RoleUsuario.CANDIDATO, RoleUsuario.ADMIN]);

  if (!isAuthorized) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4'>
        <UserRoundCheck size={64} className='text-primary mb-4' />
        <h1 className='text-3xl font-bold mb-2'>Acesso Restrito</h1>
        <p className='text-muted-foreground mb-6'>
          Você precisa estar logado como Candidato ou Administrador para ver os detalhes da vaga.
        </p>
        <Button asChild>
          <Link href='/entrar'>Fazer Login</Link>
        </Button>
      </div>
    );
  }

  const vaga: any = await prisma.vaga.findUnique({
    where: {
      id: vagaId,
      ativa: true,
      dataExpiracao: {
        gte: new Date(),
      },
    },
    include: {
      empresa: {
        select: {
          nome: true,
          cnpj: true,
          descricao: true,
          websiteUrl: true,
          logoUrl: true,
        },
      },
      criadoPor: {
        select: {
          nome: true,
          email: true,
        },
      },
    },
  });

  if (!vaga) {
    notFound();
  }

  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-3xl font-extrabold text-primary mb-2'>{vaga.titulo}</h1>
          <p className='text-xl text-foreground font-semibold flex items-center gap-2'>
            <Building2 size={20} /> {vaga.empresa.nome}
          </p>
        </div>
        {vaga.empresa.logoUrl && (
          <img src={vaga.empresa.logoUrl} alt={vaga.empresa.nome} className='w-20 h-20 rounded-full object-cover shadow-sm' />
        )}
      </div>

      <div className='space-y-4 text-muted-foreground text-sm mb-6'>
        <p className='flex items-center gap-2'>
          <Tag size={16} /> <strong>Tipo:</strong> {vaga.tipo.replace(/_/g, ' ')}
        </p>
        <p className='flex items-center gap-2'>
          <MapPin size={16} /> <strong>Local:</strong> {vaga.localizacao}
        </p>
        {vaga.faixaSalarial && (
          <p className='flex items-center gap-2'>
            <DollarSign size={16} /> <strong>Salário:</strong> {vaga.faixaSalarial}
          </p>
        )}
        <p className='flex items-center gap-2'>
          <Calendar size={16} /> <strong>Publicado em:</strong> {formatarData(vaga.dataPublicacao)}
          {vaga.dataExpiracao && ` (Expira em: ${formatarData(vaga.dataExpiracao)})`}
        </p>
      </div>

      <section className='mb-6'>
        <h2 className='text-2xl font-bold text-foreground mb-3'>Descrição da Vaga</h2>
        <p className='text-gray-700 whitespace-pre-line leading-relaxed'>{vaga.descricao}</p>
      </section>

      {vaga.requisitos && vaga.requisitos.length > 0 && (
        <section className='mb-6'>
          <h2 className='text-2xl font-bold text-foreground mb-3'>Requisitos</h2>
          <ul className='list-disc list-inside text-gray-700'>
            {vaga.requisitos.map((req: any, index: Key) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </section>
      )}

      {vaga.empresa.descricao && (
        <section className='mb-6'>
          <h2 className='text-2xl font-bold text-foreground mb-3'>Sobre a Empresa</h2>
          <p className='text-gray-700 whitespace-pre-line leading-relaxed'>{vaga.empresa.descricao}</p>
          {vaga.empresa.websiteUrl && (
            <p className='mt-2 text-sm text-blue-600 hover:underline'>
              <Link href={vaga.empresa.websiteUrl} target='_blank' rel='noopener noreferrer'>
                Visitar Website da Empresa
              </Link>
            </p>
          )}
        </section>
      )}

      <footer className='mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
        <Button asChild variant='outline'>
          <Link href='/candidato/vagas'>Voltar para Vagas</Link>
        </Button>
        <Button variant='default' className='w-full sm:w-auto'>
          Candidatar-se Agora
        </Button>
      </footer>
    </div>
  );
}
