// src/app/candidato/candidaturas/page.tsx
'use client'; // <-- TRANSFORMA EM CLIENT COMPONENT

import { FileText, BriefcaseBusiness, Ban, CheckCircle2, Eye, Hourglass, XCircle, ListTodo, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Removida a importação desnecessária de Candidatura se não for usada diretamente
// import { Candidatura } from '@prisma/client';
import { formatarData } from '@/lib/formatters'; // Importa a função de formatação de data
import { Badge } from '@/components/ui/badge';
import { JSX, useState, useEffect, useTransition, useRef } from 'react'; // Adiciona useState, useEffect, useTransition, useRef
import { useSearchParams, useRouter } from 'next/navigation'; // Adiciona useSearchParams, useRouter
import { fetchUserCandidaturas } from '@/actions/candidaturaActions'; // Importa a Server Action
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Prisma } from '@prisma/client'; // Importa Prisma para a tipagem explícita

// Tipo para a candidatura com vagas e empresas incluídas (reafirmado para clareza)
const candidaturaComDetalhesArgs = Prisma.validator<Prisma.CandidaturaDefaultArgs>()({
  include: {
    vaga: {
      select: {
        id: true,
        titulo: true,
        localizacao: true,
        tipo: true,
        dataExpiracao: true,
        empresa: {
          select: {
            nome: true,
            logoUrl: true,
          },
        },
      },
    },
  },
});

export type CandidaturaComDetalhes = Prisma.CandidaturaGetPayload<typeof candidaturaComDetalhesArgs>;

// Helper para mapear status de candidatura para cores de badge
const getStatusBadgeVariant = (
  status: string
): { variant: 'secondary' | 'outline' | 'default' | 'destructive'; icon: JSX.Element } => {
  switch (status) {
    case 'INSCRITO':
      return { variant: 'secondary', icon: <FileText size={14} /> };
    case 'VISUALIZADA':
      return { variant: 'outline', icon: <Eye size={14} /> };
    case 'EM_PROCESSO':
      return { variant: 'default', icon: <Hourglass size={14} /> };
    case 'APROVADO':
      return { variant: 'outline', icon: <CheckCircle2 size={14} className='text-green-600' /> }; // Mantido como outline para consistência com sonner
    case 'REJEITADO':
      return { variant: 'destructive', icon: <XCircle size={14} /> };
    case 'CANCELADA':
      return { variant: 'destructive', icon: <Ban size={14} /> };
    default:
      return { variant: 'outline', icon: <ListTodo size={14} /> };
  }
};

// Opções de status para o filtro
const statusOptions = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'INSCRITO', label: 'Inscrito' },
  { value: 'VISUALIZADA', label: 'Visualizada' },
  { value: 'EM_PROCESSO', label: 'Em Processo' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export default function PaginaMinhasCandidaturas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // Para transições de estado

  const [candidaturas, setCandidaturas] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ignoreStrictDoubleRender = useRef(false);

  // Lê o status inicial da URL ou define 'TODOS' como padrão
  const currentStatusFilter = searchParams.get('status') || 'TODOS';

  // Função para buscar as candidaturas usando a Server Action
  const loadCandidaturas = async (status: string) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading('Carregando candidaturas...'); // Sempre mostra o loading

    try {
      const result = await fetchUserCandidaturas(status === 'TODOS' ? undefined : status);

      if (result.success) {
        setCandidaturas(result.candidaturas || []);
        toast.success('Candidaturas carregadas!', { id: toastId, duration: 2000 });
      } else {
        setError(result.error || 'Falha ao carregar candidaturas.');
        toast.error(result.error || 'Falha ao carregar candidaturas.', { id: toastId });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado ao buscar candidaturas.');
      toast.error('Ocorreu um erro inesperado.', { id: toastId });
      console.error('Erro no loadCandidaturas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!ignoreStrictDoubleRender.current) {
      ignoreStrictDoubleRender.current = true;
      loadCandidaturas(currentStatusFilter);
    }

    return () => {
      toast.dismiss();
    };
  }, [currentStatusFilter]);

  const handleStatusChange = (newStatus: string) => {
    ignoreStrictDoubleRender.current = false;

    startTransition(() => {
      // Inicia uma transição para a navegação
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (newStatus === 'TODOS') {
        newSearchParams.delete('status');
      } else {
        newSearchParams.set('status', newStatus);
      }
      router.push(`/candidato/candidaturas?${newSearchParams.toString()}`);
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
        <span className='ml-4 text-muted-foreground'>Carregando candidaturas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
        <p className='mt-4 text-center'>
          Por favor, tente{' '}
          <Button variant='link' onClick={() => loadCandidaturas(currentStatusFilter)} className='p-0 h-auto underline'>
            novamente
          </Button>
          .
        </p>
      </div>
    );
  }

  if (!candidaturas) {
    return (
      <div className='col-span-full text-center text-muted-foreground py-12'>
        <p className='text-xl'>Não foi possível carregar suas candidaturas. Tente novamente.</p>
        <p className='mt-2 text-sm'>
          <Button variant='link' onClick={() => loadCandidaturas(currentStatusFilter)} className='p-0 h-auto underline'>
            Recarregar
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <FileText size={32} /> Minhas Candidaturas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>Acompanhe o status das suas inscrições em vagas.</p>
      </header>

      <div className='mb-6 flex justify-end'>
        <Select onValueChange={handleStatusChange} value={currentStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filtrar por Status' />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {candidaturas.length === 0 ? (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Você ainda não se candidatou a nenhuma vaga para este status.</p>
            <p className='mt-2 text-sm'>
              Explore as{' '}
              <Link href='/candidato/vagas' className='text-primary underline'>
                vagas disponíveis
              </Link>{' '}
              e encontre sua próxima oportunidade!
            </p>
          </div>
        ) : (
          candidaturas.map((candidatura: any) => {
            const statusInfo = getStatusBadgeVariant(candidatura.status);
            const vagaExpirada = candidatura.vaga.dataExpiracao && new Date(candidatura.vaga.dataExpiracao) < new Date();

            return (
              <div
                key={candidatura.id}
                className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center'>
                    {candidatura.vaga.empresa?.logoUrl && (
                      <img
                        src={candidatura.vaga.empresa.logoUrl}
                        alt={candidatura.vaga.empresa.nome || 'Logo da Empresa'}
                        className='w-10 h-10 rounded-full mr-3 object-cover'
                      />
                    )}
                    <div>
                      <h2 className='text-lg font-bold text-primary'>{candidatura.vaga.titulo}</h2>
                      <p className='text-muted-foreground text-xs'>
                        {candidatura.vaga.empresa?.nome || 'Empresa Desconhecida'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='text-sm text-gray-600 mb-3'>
                  <p>
                    <strong>Tipo:</strong> {candidatura.vaga.tipo.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p>
                    <strong>Local:</strong> {candidatura.vaga.localizacao}
                  </p>
                  <p>
                    <strong>Candidatura:</strong> {formatarData(candidatura.dataCandidatura)}
                  </p>
                </div>

                {vagaExpirada && (
                  <p className='text-red-500 text-xs italic mb-2'>
                    Atenção: Esta vaga expirou em {formatarData(candidatura.vaga.dataExpiracao)}.
                  </p>
                )}

                <div className='mt-auto flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border'>
                  <Button asChild size='sm'>
                    <Link href={`/candidato/vagas/${candidatura.vaga.id}`}>Ver Vaga</Link>
                  </Button>
                  <Badge variant={statusInfo.variant} className='capitalize text-sm font-semibold whitespace-nowrap'>
                    {statusInfo.icon}
                    {candidatura.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
