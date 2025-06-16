import { notFound } from 'next/navigation';
import { ArrowLeft, FileWarning, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import { fetchCandidaturaDetailsForRecruiter } from '@/actions/candidaturaActions';
import { ApplicationActionBar } from '@/components/empresa/ApplicationActionBar';
import { FloatingRequirements } from '@/components/empresa/FloatingRequirements';
import { ResumeDisplay } from '@/components/empresa/ResumeDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function PaginaAnaliseCandidatura({
  params,
}: {
  params: Promise<{ candidaturaId: string }>;
}) {
  const paramsData = params;
  const { candidaturaId } = await paramsData;
  const { candidatura, error } = await fetchCandidaturaDetailsForRecruiter(candidaturaId);

  if (error || !candidatura) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4'>
        <FileWarning size={64} className='text-destructive mb-4' />
        <h1 className='text-3xl font-bold mb-2'>Erro ao Carregar Candidatura</h1>
        <p className='text-muted-foreground'>{error || 'A candidatura não foi encontrada.'}</p>
      </div>
    );
  }

  const { vaga, usuario } = candidatura;
  const curriculo = usuario.curriculo;

  return (
    <>
      <div className='container mx-auto max-w-6xl py-8'>
        <div className='mb-6'>
          <Button asChild variant='outline'>
            <Link href='/empresa/candidaturas'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Voltar para a Lista de Candidaturas
            </Link>
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='md:col-span-2'>
            <div className='p-6 bg-card border rounded-lg mb-8'>
              <h1 className='text-2xl font-bold text-gray-800'>{usuario.nome}</h1>
              <p className='text-lg text-primary font-medium mt-1'>
                Candidato à vaga de: {vaga.titulo}
              </p>
              <div className='text-sm text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1 mt-4'>
                {usuario.email && (
                  <span className='flex items-center gap-2'>
                    <Mail size={14} /> {usuario.email}
                  </span>
                )}
                {curriculo?.telefone && (
                  <span className='flex items-center gap-2'>
                    <Phone size={14} /> {curriculo.telefone}
                  </span>
                )}
                {curriculo?.endereco && (
                  <span className='flex items-center gap-2'>
                    <MapPin size={14} /> {curriculo.endereco}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-4 mt-3'>
                {curriculo?.linkedinUrl && (
                  <Link href={curriculo.linkedinUrl} target='_blank' rel='noopener noreferrer'>
                    <Linkedin className='text-blue-700' />
                  </Link>
                )}
                {curriculo?.githubUrl && (
                  <Link href={curriculo.githubUrl} target='_blank' rel='noopener noreferrer'>
                    <Github className='text-gray-800' />
                  </Link>
                )}
              </div>
            </div>
            <ResumeDisplay curriculo={curriculo} />
          </div>

          <div className='md:col-span-1'>
            <div className='sticky top-24 space-y-6'>
              <div className='p-4 bg-card border rounded-lg shadow-sm'>
                <h3 className='font-semibold mb-2'>Status da Candidatura</h3>
                <Badge variant='outline' className='text-base capitalize'>
                  {candidatura.status.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              </div>
              <ApplicationActionBar
                candidaturaId={candidatura.id}
                statusAtual={candidatura.status}
              />
            </div>
          </div>
        </div>
      </div>
      <FloatingRequirements requisitos={vaga.requisitos} />
    </>
  );
}
