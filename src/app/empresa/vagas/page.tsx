// src/app/empresa/vagas/page.tsx
'use client'; // <-- TRANSFORMA EM CLIENT COMPONENT

import { BriefcaseBusiness, Loader2, ChevronLeft, ChevronRight, Pencil, EyeOff, PlusCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters'; // Importa a função de formatação de data
import { useState, useEffect, useTransition, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchCompanyVagas } from '@/actions/vagaActions'; // Importa a Server Action
import { toast } from 'sonner';

export default function PaginaMinhasVagasEmpresa() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estado para armazenar as vagas e o status do carregamento
  const [vagas, setVagas] = useState<any[] | null>(null); // Tipagem 'any' temporariamente, conforme sua solicitação
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVagas, setTotalVagas] = useState(0);

  // Use uma ref para controlar se a chamada inicial do useEffect (incluindo a dupla do StrictMode) já foi processada
  const ignoreStrictDoubleRender = useRef(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const limitPerPage = parseInt(searchParams.get('limit') || '9');

  // Função para buscar as vagas usando a Server Action
  const loadVagas = async (page: number, limit: number) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading('Carregando vagas...');

    try {
      // Chama a Server Action para buscar vagas da empresa
      const result = await fetchCompanyVagas({ page, limit });

      if (result.success) {
        setVagas(result.vagas || []);
        setTotalVagas(result.totalVagas || 0);
        toast.success('Vagas carregadas!', { id: toastId });
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

  // Lógica para Ações da Vaga (Editar/Inativar/Ativar)
  const handleEditVaga = (vagaId: string) => {
    router.push(`/empresa/vagas/${vagaId}/editar`); // Rota de edição (a ser criada)
  };

  const handleToggleActive = (vagaId: string, currentStatus: boolean) => {
    // Futuramente: Implementar Server Action para inativar/ativar vaga
    toast.info(`Funcionalidade de ${currentStatus ? 'inativar' : 'ativar'} vaga ${vagaId} ainda não implementada.`);
    // Exemplo: toggleVagaStatusAction(vagaId, !currentStatus);
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
          <Button variant='link' onClick={() => loadVagas(currentPage, limitPerPage)} className='p-0 h-auto underline'>
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
          <Button variant='link' onClick={() => loadVagas(currentPage, limitPerPage)} className='p-0 h-auto underline'>
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
          <BriefcaseBusiness size={32} /> Minhas Vagas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>Gerencie as vagas publicadas pela sua empresa.</p>
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
          vagas.map(
            (
              vaga: any // Tipagem 'any' mantida conforme sua solicitação
            ) => (
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
                    <p className='text-muted-foreground text-sm'>{vaga.empresa?.nome || 'Empresa Desconhecida'}</p>
                  </div>
                </div>

                <p className='text-foreground text-sm mb-3 line-clamp-3'>{vaga.descricao}</p>
                <div className='text-sm text-gray-600 mb-3'>
                  <p>
                    <strong>Tipo:</strong> {vaga.tipo.replace(/_/g, ' ').toLowerCase()}
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
                  <div className='flex gap-2'>
                    <Button variant='ghost' size='sm' onClick={() => handleEditVaga(vaga.id)}>
                      <Pencil size={16} className='mr-1' /> Editar
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleToggleActive(vaga.id, vaga.ativa)}
                      className={vaga.ativa ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}
                    >
                      {vaga.ativa ? <EyeOff size={16} className='mr-1' /> : <CheckCircle2 size={16} className='mr-1' />}{' '}
                      {vaga.ativa ? 'Inativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </section>

      {/* Controles de Paginação */}
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
