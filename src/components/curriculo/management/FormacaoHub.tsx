'use client';

import { FormacaoAcademica } from '@prisma/client';
import { ArrowLeft, Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteFormacaoAction } from '@/actions/curriculoParcialActions';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';
import { FormacaoAcademicaForm } from '../forms/FormacaoAcademicaForm';

export function FormacaoHub({}: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, fetchCandidatoData } = useCandidato();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formacaoParaEditar, setFormacaoParaEditar] = useState<FormacaoAcademica | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = (formacao: FormacaoAcademica | null) => {
    setFormacaoParaEditar(formacao);
    setView('form');
  };

  const handleFormSuccess = () => {
    setView('list');
    setFormacaoParaEditar(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta formação?')) return;

    startTransition(() => {
      toast.promise(deleteFormacaoAction(id), {
        loading: 'Removendo...',
        success: (res) => {
          if (res.success) {
            fetchCandidatoData();
            return 'Formação removida com sucesso!';
          }
          throw new Error(res.error);
        },
        error: (err) => err.message,
      });
    });
  };

  if (view === 'form') {
    return (
      <div className='pt-4'>
        <Button variant='ghost' size='sm' onClick={handleFormSuccess} className='mb-4'>
          <ArrowLeft size={16} className='mr-2' />
          Voltar para a lista
        </Button>
        <FormacaoAcademicaForm setModalOpen={handleFormSuccess} dadosIniciais={formacaoParaEditar} />
      </div>
    );
  }

  return (
    <div className='pt-4 space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className='mr-2' />
          Adicionar Formação
        </Button>
      </div>
      <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
        {curriculo?.formacoesAcademicas && curriculo.formacoesAcademicas.length > 0 ? (
          curriculo.formacoesAcademicas.map((formacao) => (
            <div key={formacao.id} className='flex justify-between items-start p-3 rounded-md border bg-background'>
              <div>
                <h3 className='font-bold text-lg'>{formacao.curso}</h3>
                <p className='text-primary font-medium'>{formacao.instituicao}</p>
              </div>
              <div className='flex gap-1'>
                <Button variant='ghost' size='icon' onClick={() => handleOpenForm(formacao)} disabled={isPending}>
                  <Pencil size={18} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive'
                  onClick={() => handleDelete(formacao.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 size={18} className='animate-spin' /> : <Trash2 size={18} />}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className='text-muted-foreground text-center py-8'>Nenhuma formação acadêmica adicionada.</p>
        )}
      </div>
    </div>
  );
}
