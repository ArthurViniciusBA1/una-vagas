'use client';

import { Habilidade } from '@prisma/client';
import { Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteHabilidadeAction } from '@/actions/curriculoParcialActions';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';
import { HabilidadeForm } from '../forms/HabilidadeForm';

export function HabilidadeHub({}: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, fetchCandidatoData } = useCandidato();
  const [habilidadeParaEditar, setHabilidadeParaEditar] = useState<Habilidade | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = (habilidade: Habilidade | null) => {
    setHabilidadeParaEditar(habilidade);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setHabilidadeParaEditar(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta habilidade?')) return;

    startTransition(() => {
      toast.promise(deleteHabilidadeAction(id), {
        loading: 'Removendo...',
        success: (res) => {
          if (res.success) {
            fetchCandidatoData();
            return 'Habilidade removida com sucesso!';
          }
          throw new Error(res.error);
        },
        error: (err) => err.message,
      });
    });
  };

  if (showForm) {
    return <HabilidadeForm setModalOpen={handleCloseForm} dadosIniciais={habilidadeParaEditar} />;
  }

  return (
    <div className='pt-4 space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className='mr-2' />
          Adicionar Nova Habilidade
        </Button>
      </div>
      <div className='space-y-3 max-h-[50vh] overflow-y-auto pr-2'>
        {curriculo?.habilidades && curriculo.habilidades.length > 0 ? (
          curriculo.habilidades.map((habilidade) => (
            <div key={habilidade.id} className='flex justify-between items-center p-3 rounded-md border bg-background text-sm'>
              <span className='font-medium'>{habilidade.nome}</span>
              <div className='flex gap-1'>
                <Button variant='ghost' size='icon' onClick={() => handleOpenForm(habilidade)} disabled={isPending}>
                  <Pencil size={16} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive'
                  onClick={() => handleDelete(habilidade.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 size={16} className='animate-spin' /> : <Trash2 size={16} />}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className='text-muted-foreground text-center py-8'>Nenhuma habilidade adicionada.</p>
        )}
      </div>
    </div>
  );
}
