'use client';

import {
  Ban,
  CheckCircle2,
  Eye,
  FileText,
  Hourglass,
  ListTodo,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { JSX, useState, useEffect, useTransition, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Prisma } from '@prisma/client';

import { fetchUserCandidaturas, cancelarCandidaturaAction } from '@/actions/candidaturaActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

const statusOptions = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'INSCRITO', label: 'Inscrito' },
  { value: 'VISUALIZADA', label: 'Visualizada' },
  { value: 'EM_PROCESSO', label: 'Em Processo' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
];

const getStatusBadgeVariant = (
  status: string
): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element } => {
  switch (status) {
    case 'INSCRITO':
      return { variant: 'secondary', icon: <FileText size={14} /> };
    case 'VISUALIZADA':
      return { variant: 'outline', icon: <Eye size={14} /> };
    case 'EM_PROCESSO':
      return { variant: 'default', icon: <Hourglass size={14} /> };
    case 'APROVADO':
      return { variant: 'outline', icon: <CheckCircle2 size={14} className='text-green-600' /> };
    case 'REJEITADO':
      return { variant: 'destructive', icon: <XCircle size={14} /> };
    default:
      return { variant: 'outline', icon: <ListTodo size={14} /> };
  }
};

export default function PaginaMinhasCandidaturas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [candidaturas, setCandidaturas] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ignoreStrictDoubleRender = useRef(false);

  const currentStatusFilter = searchParams.get('status') || 'TODOS';

  const loadCandidaturas = async (status: string) => {
    setIsLoading(true);
    setError(null);

    const result = await fetchUserCandidaturas(status === 'TODOS' ? undefined : status);
    if (result.success) {
      setCandidaturas(result.candidaturas || []);
    } else {
      setError(result.error || 'Falha ao carregar candidaturas.');
      toast.error(result.error || 'Falha ao carregar candidaturas.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!ignoreStrictDoubleRender.current) {
      ignoreStrictDoubleRender.current = true;
      const toastId = toast.loading('Carregando candidaturas...');
      loadCandidaturas(currentStatusFilter).then(() => {
        toast.dismiss(toastId);
      });
    }
  }, [currentStatusFilter]);

  const handleStatusChange = (newStatus: string) => {
    ignoreStrictDoubleRender.current = false;
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (newStatus === 'TODOS') {
        newSearchParams.delete('status');
      } else {
        newSearchParams.set('status', newStatus);
      }
      router.push(`/candidato/candidaturas?${newSearchParams.toString()}`);
    });
  };

  const handleCancelarCandidatura = (candidaturaId: string) => {
    startTransition(async () => {
      const result = await cancelarCandidaturaAction(candidaturaId);
      if (result.success) {
        toast.success('Candidatura cancelada com sucesso.');
        setCandidaturas((prev) => prev?.filter((c) => c.id !== candidaturaId) || null);
      } else {
        toast.error(result.error || 'Não foi possível cancelar a candidatura.');
      }
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <FileText size={32} /> Minhas Candidaturas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Acompanhe o status das suas inscrições em vagas.
        </p>
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
        {candidaturas && candidaturas.length > 0 ? (
          candidaturas.map((candidatura: any) => {
            const statusInfo = getStatusBadgeVariant(candidatura.status);
            const vagaExpirada =
              candidatura.vaga.dataExpiracao &&
              new Date(candidatura.vaga.dataExpiracao) < new Date();
            const canBeCancelled = ['INSCRITO', 'VISUALIZADA', 'EM_PROCESSO'].includes(
              candidatura.status
            );

            return (
              <div
                key={candidatura.id}
                className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between mb-4'>
                  {candidatura.vaga.empresa?.logoUrl && (
                    <img
                      src={candidatura.vaga.empresa.logoUrl}
                      alt={candidatura.vaga.empresa.nome || 'Logo da Empresa'}
                      className='w-10 h-10 rounded-full mr-3 object-cover'
                    />
                  )}
                  <div className='flex-grow'>
                    <h2 className='text-lg font-bold text-primary'>{candidatura.vaga.titulo}</h2>
                    <p className='text-muted-foreground text-xs'>
                      {candidatura.vaga.empresa?.nome || 'Empresa Desconhecida'}
                    </p>
                  </div>
                </div>

                <div className='text-sm text-gray-600 mb-3'>
                  <p>
                    <strong>Candidatura:</strong> {formatarData(candidatura.dataCandidatura)}
                  </p>
                </div>

                {vagaExpirada && (
                  <p className='text-red-500 text-xs italic mb-2'>Esta vaga expirou.</p>
                )}

                <div className='mb-4'>
                  <Badge
                    variant={statusInfo.variant}
                    className='capitalize text-sm font-semibold whitespace-nowrap'
                  >
                    {statusInfo.icon}
                    {candidatura.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className='mt-auto flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border gap-2'>
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`/candidato/vagas/${candidatura.vaga.id}`}>Ver Vaga</Link>
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size='sm'
                        variant='destructive'
                        disabled={!canBeCancelled || isPending}
                      >
                        <XCircle size={14} className='mr-2' /> Cancelar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancelar Candidatura</DialogTitle>
                        <DialogDescription>
                          Você tem certeza que deseja cancelar sua candidatura para a vaga de{' '}
                          <strong>{candidatura.vaga.titulo}</strong>? Esta ação não pode ser
                          desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type='button' variant='secondary'>
                            Fechar
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            type='button'
                            variant='destructive'
                            onClick={() => handleCancelarCandidatura(candidatura.id)}
                          >
                            Sim, cancelar
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })
        ) : (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhuma candidatura encontrada para este filtro.</p>
            <p className='mt-2 text-sm'>
              Explore as{' '}
              <Link href='/candidato/vagas' className='text-primary underline'>
                vagas disponíveis
              </Link>{' '}
              e encontre sua próxima oportunidade!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
