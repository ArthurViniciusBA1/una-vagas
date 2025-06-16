'use client';

import { FileText, Loader2, Mail, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { fetchCandidaturasForEmpresa } from '@/actions/candidaturaActions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';

export default function PaginaGestaoCandidaturas() {
  const [candidaturas, setCandidaturas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidaturas = async () => {
    setIsLoading(true);
    const result = await fetchCandidaturasForEmpresa();
    if (result.success) {
      setCandidaturas(result.candidaturas || []);
      setError(null);
    } else {
      setError(result.error || 'Falha ao carregar candidaturas.');
      toast.error(result.error || 'Falha ao carregar candidaturas.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCandidaturas();
  }, []);

  const candidaturasAgrupadas = useMemo(() => {
    if (!candidaturas) return {};
    return candidaturas.reduce((acc: any, candidatura: any) => {
      const vagaTitulo = candidatura.vaga.titulo;
      if (!acc[vagaTitulo]) {
        acc[vagaTitulo] = [];
      }
      acc[vagaTitulo].push(candidatura);
      return acc;
    }, {});
  }, [candidaturas]);

  const formatarTelefoneWhatsApp = (telefone: string | null | undefined): string => {
    if (!telefone) return '';
    return telefone.replace(/\D/g, '');
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
        <Button variant='link' onClick={loadCandidaturas} className='p-0 h-auto underline mt-4'>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <Users size={32} />
          Gerenciar Candidaturas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Analise os candidatos inscritos em suas vagas.
        </p>
      </header>

      {candidaturas && Object.keys(candidaturasAgrupadas).length > 0 ? (
        <Accordion type='single' collapsible className='w-full space-y-4'>
          {Object.entries(candidaturasAgrupadas).map(([vagaTitulo, candidaturasDaVaga]: any) => (
            <AccordionItem
              key={vagaTitulo}
              value={vagaTitulo}
              className='bg-card border rounded-lg shadow-sm'
            >
              <AccordionTrigger className='p-4 font-semibold text-lg hover:no-underline'>
                <div className='flex items-center gap-4'>
                  <span>{vagaTitulo}</span>
                  <Badge variant='secondary'>{candidaturasDaVaga.length} candidato(s)</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='border-t'>
                  {candidaturasDaVaga.map((candidatura: any) => {
                    const curriculo = candidatura.usuario.curriculo;
                    const telefoneWhats = formatarTelefoneWhatsApp(curriculo?.telefone);
                    return (
                      <div
                        key={candidatura.id}
                        className='grid grid-cols-3 items-center p-4 border-b last:border-b-0'
                      >
                        <div className='col-span-1'>
                          <p className='font-medium text-primary'>{candidatura.usuario.nome}</p>
                          <p className='text-xs text-muted-foreground'>
                            {formatarData(candidatura.dataCandidatura)}
                          </p>
                        </div>
                        <div className='col-span-1 flex justify-center'>
                          <Badge variant='outline' className='capitalize'>
                            {candidatura.status.replace(/_/g, ' ').toLowerCase()}
                          </Badge>
                        </div>
                        <div className='col-span-1 flex items-center justify-end gap-2'>
                          <Button
                            asChild
                            variant='outline'
                            size='icon'
                            title='Analisar Candidatura'
                          >
                            <Link href={`/empresa/candidaturas/${candidatura.id}`}>
                              <FileText size={16} />
                            </Link>
                          </Button>
                          <Button asChild variant='outline' size='icon' title='Enviar E-mail'>
                            <a href={`mailto:${candidatura.usuario.email}`}>
                              <Mail size={16} />
                            </a>
                          </Button>
                          {telefoneWhats ? (
                            <Button asChild variant='outline' size='icon' title='Enviar WhatsApp'>
                              <a
                                href={`https://wa.me/${telefoneWhats}`}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <MessageSquare size={16} />
                              </a>
                            </Button>
                          ) : (
                            <Button
                              variant='outline'
                              size='icon'
                              disabled
                              title='Candidato sem telefone'
                            >
                              <MessageSquare size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='text-center p-8 text-muted-foreground bg-card border rounded-lg'>
          <p>Nenhuma candidatura recebida ainda.</p>
        </div>
      )}
    </div>
  );
}
