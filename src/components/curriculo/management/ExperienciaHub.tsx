'use client';

import { ExperienciaProfissional } from '@prisma/client';
import { ArrowLeft, Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteExperienciaAction } from '@/actions/curriculoParcialActions';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';
import { ExperienciaProfissionalForm } from '../forms/ExperienciaProfissionalForm';

export function ExperienciaHub({}: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, fetchCandidatoData } = useCandidato();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [experienciaParaEditar, setExperienciaParaEditar] = useState<ExperienciaProfissional | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = (exp: ExperienciaProfissional | null) => {
    setExperienciaParaEditar(exp);
    setView('form');
  };

  const handleFormSuccess = () => {
    setView('list');
    setExperienciaParaEditar(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta experiência?')) return;

    startTransition(() => {
      toast.promise(deleteExperienciaAction(id), {
        loading: 'Removendo...',
        success: (res) => {
          if (res.success) {
            fetchCandidatoData(); // Atualiza a lista no contexto
            return 'Experiência removida com sucesso!';
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
        <ExperienciaProfissionalForm setModalOpen={handleFormSuccess} dadosIniciais={experienciaParaEditar} />
      </div>
    );
  }

  return (
    <div className='pt-4 space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className='mr-2' />
          Adicionar Nova Experiência
        </Button>
      </div>
      <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
        {curriculo?.experienciasProfissionais && curriculo.experienciasProfissionais.length > 0 ? (
          curriculo.experienciasProfissionais.map((exp) => (
            <div key={exp.id} className='flex justify-between items-start p-3 rounded-md border bg-background'>
              <div>
                <h3 className='font-bold text-lg'>{exp.cargo}</h3>
                <p className='text-primary font-medium'>{exp.nomeEmpresa}</p>
                <p className='text-sm text-muted-foreground'>
                  {new Date(exp.dataInicio).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', timeZone: 'UTC' })} -
                  {exp.trabalhoAtual
                    ? ' Presente'
                    : exp.dataFim
                      ? ` ${new Date(exp.dataFim).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', timeZone: 'UTC' })}`
                      : ''}
                </p>
              </div>
              <div className='flex gap-1'>
                <Button variant='ghost' size='icon' onClick={() => handleOpenForm(exp)} disabled={isPending}>
                  <Pencil size={18} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive'
                  onClick={() => handleDelete(exp.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className='animate-spin' size={18} /> : <Trash2 size={18} />}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className='text-muted-foreground text-center py-8'>Nenhuma experiência profissional adicionada.</p>
        )}
      </div>
    </div>
  );
}
