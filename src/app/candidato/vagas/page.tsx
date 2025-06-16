import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { fetchAvailableVagas } from '@/actions/vagaActions';
import VagasClientLayout from './VagasClientLayout';

interface PaginaListagemVagasProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function PaginaListagemVagas({ searchParams }: PaginaListagemVagasProps) {
  const params = await searchParams;
  // Lê os parâmetros da URL no servidor
  const currentPage = parseInt(params.page || '1');
  const limitPerPage = parseInt(params.limit || '9');

  const result = await fetchAvailableVagas({ page: currentPage, limit: limitPerPage });

  if (!result.success) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{result.error}</p>
        <p className='mt-4'>Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <Suspense
      key={currentPage}
      fallback={
        <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <VagasClientLayout
        vagas={result.vagas}
        totalVagas={result.totalVagas}
        currentPage={currentPage}
        limitPerPage={limitPerPage}
      />
    </Suspense>
  );
}
