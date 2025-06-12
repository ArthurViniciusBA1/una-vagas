'use client';

import { Certificacao } from '@prisma/client';
import { Link as LinkIcon, Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteCertificacaoAction } from '@/actions/curriculoParcialActions';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';
import { CertificacaoForm } from '../forms/CertificacaoForm';

export function CertificacaoHub({}: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, fetchCandidatoData } = useCandidato();
  const [certificacaoParaEditar, setCertificacaoParaEditar] = useState<Certificacao | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = (certificacao: Certificacao | null) => {
    setCertificacaoParaEditar(certificacao);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCertificacaoParaEditar(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta certificação?')) return;

    startTransition(() => {
      toast.promise(deleteCertificacaoAction(id), {
        loading: 'Removendo...',
        success: (res) => {
          if (res.success) {
            fetchCandidatoData();
            return 'Certificação removida com sucesso!';
          }
          throw new Error(res.error);
        },
        error: (err) => err.message,
      });
    });
  };

  if (showForm) {
    return <CertificacaoForm setModalOpen={handleCloseForm} dadosIniciais={certificacaoParaEditar} />;
  }

  return (
    <div className='pt-4 space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className='mr-2' />
          Adicionar Certificação
        </Button>
      </div>
      <div className='space-y-3 max-h-[50vh] overflow-y-auto pr-2'>
        {curriculo?.certificacoes && curriculo.certificacoes.length > 0 ? (
          curriculo.certificacoes.map((cert) => (
            <div key={cert.id} className='p-3 rounded-md border bg-background text-sm'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='font-bold text-base'>{cert.nome}</h3>
                  <p className='text-muted-foreground'>{cert.organizacaoEmissora}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Emitido em:{' '}
                    {new Date(cert.dataEmissao).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </p>
                </div>
                <div className='flex gap-1'>
                  <Button variant='ghost' size='icon' onClick={() => handleOpenForm(cert)} disabled={isPending}>
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-destructive hover:text-destructive'
                    onClick={() => handleDelete(cert.id)}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 size={16} className='animate-spin' /> : <Trash2 size={16} />}
                  </Button>
                </div>
              </div>
              {cert.credencialUrl && (
                <Button variant='link' asChild className='p-0 h-auto text-xs mt-2'>
                  <Link href={cert.credencialUrl} target='_blank' rel='noopener noreferrer'>
                    <LinkIcon size={14} className='mr-1.5' /> Ver Credencial
                  </Link>
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className='text-muted-foreground text-center py-8'>Nenhuma certificação adicionada.</p>
        )}
      </div>
    </div>
  );
}
