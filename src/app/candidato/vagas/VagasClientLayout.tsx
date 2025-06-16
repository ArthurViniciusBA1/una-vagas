'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';

// O 'vagas' que este componente recebe são os dados já buscados pelo Server Component
export default function VagasClientLayout({ vagas, totalVagas, currentPage, limitPerPage }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
  };

  const totalPages = Math.ceil(totalVagas / limitPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <BriefcaseBusiness size={32} /> Vagas Disponíveis
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Explore as oportunidades que esperam por você.
        </p>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {vagas.length === 0 ? (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhuma vaga disponível no momento.</p>
            <p className='mt-2 text-sm'>Verifique novamente mais tarde.</p>
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
                <Button asChild size='sm'>
                  <Link href={`/candidato/vagas/${vaga.id}`}>Ver Detalhes</Link>
                </Button>
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
