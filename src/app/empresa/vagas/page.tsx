'use client';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Loader2,
  Pencil,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { fetchCompanyVagas, toggleVagaStatusAction } from '@/actions/vagaActions';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';

export default function PaginaMinhasVagasEmpresa() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [vagas, setVagas] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVagas, setTotalVagas] = useState(0);

  const ignoreStrictDoubleRender = useRef(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const limitPerPage = parseInt(searchParams.get('limit') || '9');

  const loadVagas = async (page: number, limit: number) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading('Carregando vagas...');

    try {
      const result = await fetchCompanyVagas({ page, limit });

      if (result.success) {
        setVagas(result.vagas || []);
        setTotalVagas(result.totalVagas || 0);
        toast.success('Vagas carregadas!', { id: toastId, duration: 2000 });
      } else {
        setError(result.error || 'Falha ao carregar vagas.');
        toast.error(result.error || 'Falha ao carregar vagas.', { id: toastId });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      toast.error('Ocorreu um erro inesperado.', { id: toastId });
      console.error('Erro no loadVagas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!ignoreStrictDoubleRender.current) {
      ignoreStrictDoubleRender.current = true;
      loadVagas(currentPage, limitPerPage);
    }
  }, [currentPage, limitPerPage]);

  const handlePageChange = (newPage: number) => {
    ignoreStrictDoubleRender.current = false;
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/empresa/vagas?${newSearchParams.toString()}`);
    });
  };

  const totalPages = Math.ceil(totalVagas / limitPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handleEditVaga = (vagaId: string) => {
    router.push(`/empresa/vagas/editar/${vagaId}`);
  };

  const handleToggleActive = (vagaId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'Inativando' : 'Ativando';
    const toastId = toast.loading(`${action} vaga...`);

    startTransition(async () => {
      const result = await toggleVagaStatusAction(vagaId, !currentStatus);

      if (result.success) {
        toast.success(`Vaga ${currentStatus ? 'inativada' : 'ativada'} com sucesso!`, {
          id: toastId,
        });
        setVagas((prevVagas) =>
          (prevVagas || []).map((vaga) =>
            vaga.id === vagaId ? { ...vaga, ativa: !currentStatus } : vaga
          )
        );
      } else {
        toast.error(result.error || `Falha ao ${action.toLowerCase()} a vaga.`, { id: toastId });
      }
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
        <span className='ml-4 text-muted-foreground'>Carregando vagas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
        <p className='mt-4 text-center'>
          Por favor, tente{' '}
          <Button
            variant='link'
            onClick={() => loadVagas(currentPage, limitPerPage)}
            className='p-0 h-auto underline'
          >
            novamente
          </Button>
          .
        </p>
      </div>
    );
  }

  if (!vagas) {
    return (
      <div className='col-span-full text-center text-muted-foreground py-12'>
        <p className='text-xl'>Não foi possível carregar as vagas. Tente novamente.</p>
        <p className='mt-2 text-sm'>
          <Button
            variant='link'
            onClick={() => loadVagas(currentPage, limitPerPage)}
            className='p-0 h-auto underline'
          >
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
          Minhas Vagas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Gerencie as vagas publicadas pela sua empresa.
        </p>
        <Button asChild className='mt-4'>
          <Link href='/empresa/vagas/criar-vaga'>
            <PlusCircle size={18} className='mr-2' /> Nova Vaga
          </Link>
        </Button>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {vagas.length === 0 ? (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhuma vaga encontrada.</p>
            <p className='mt-2 text-sm'>
              <Link href='/empresa/vagas/criar-vaga' className='text-primary underline'>
                Publique sua primeira vaga
              </Link>{' '}
              agora!
            </p>
          </div>
        ) : (
          vagas.map((vaga: any) => (
            <div
              key={vaga.id}
              className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
            >
              <div className='flex items-center mb-4'>
                {vaga.empresa?.logoUrl && (
                  <img
                    src={vaga.empresa.logoUrl}
                    alt={vaga.empresa.nome || 'Logo da Empresa'}
                    className='w-12 h-12 rounded-full mr-4 object-cover'
                  />
                )}
                <div>
                  <h2 className='text-xl font-bold text-primary'>{vaga.titulo}</h2>
                  <p className='text-muted-foreground text-sm'>
                    {vaga.empresa?.nome || 'Empresa Desconhecida'}
                  </p>
                </div>
              </div>

              <p className='text-foreground text-sm mb-3 line-clamp-3'>{vaga.descricao}</p>
              <div className='text-sm text-gray-600 mb-3'>
                <p>
                  <strong>Tipo:</strong>{' '}
                  <span className='capitalize'>{vaga.tipo.replace(/_/g, ' ').toLowerCase()}</span>
                </p>
                <p>
                  <strong>Local:</strong> {vaga.localizacao}
                </p>
                {vaga.faixaSalarial && (
                  <p>
                    <strong>Salário:</strong> {vaga.faixaSalarial}
                  </p>
                )}
              </div>

              <div className='mt-auto flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border'>
                <span>Publicado em: {formatarData(vaga.dataPublicacao)}</span>
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleEditVaga(vaga.id)}
                    disabled={isPending}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant={vaga.ativa ? 'destructive' : 'confirm'}
                    size='icon'
                    onClick={() => handleToggleActive(vaga.id, vaga.ativa)}
                    disabled={isPending}
                    className={
                      vaga.ativa
                        ? 'text-destructive hover:bg-destructive hover:text-white'
                        : 'text-green-600 hover:text-green-700'
                    }
                  >
                    {vaga.ativa ? (
                      <EyeOff size={16} aria-label='Desativar' />
                    ) : (
                      <CheckCircle2 size={16} aria-label='Ativar' />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-4 mt-8'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage || isPending}
          >
            <ChevronLeft size={16} className='mr-2' /> Anterior
          </Button>
          <span className='text-sm font-medium text-foreground'>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || isPending}
          >
            Próxima <ChevronRight size={16} className='ml-2' />
          </Button>
        </div>
      )}
    </div>
  );
}
