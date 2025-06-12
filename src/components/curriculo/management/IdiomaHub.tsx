'use client';

import { Idioma } from '@prisma/client';
import { Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteIdiomaAction } from '@/actions/curriculoParcialActions';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';
import { IdiomaForm } from '../forms/IdiomaForm';

export function IdiomaHub({}: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, fetchCandidatoData } = useCandidato();
  const [idiomaParaEditar, setIdiomaParaEditar] = useState<Idioma | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenForm = (idioma: Idioma | null) => {
    setIdiomaParaEditar(idioma);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIdiomaParaEditar(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este idioma?')) return;

    startTransition(() => {
      toast.promise(deleteIdiomaAction(id), {
        loading: 'Removendo...',
        success: (res) => {
          if (res.success) {
            fetchCandidatoData();
            return 'Idioma removido com sucesso!';
          }
          throw new Error(res.error);
        },
        error: (err) => err.message,
      });
    });
  };

  if (showForm) {
    return <IdiomaForm setModalOpen={handleCloseForm} dadosIniciais={idiomaParaEditar} />;
  }

  return (
    <div className='pt-4 space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className='mr-2' />
          Adicionar Novo Idioma
        </Button>
      </div>
      <div className='space-y-3 max-h-[50vh] overflow-y-auto pr-2'>
        {curriculo?.idiomas && curriculo.idiomas.length > 0 ? (
          curriculo.idiomas.map((idioma) => (
            <div key={idioma.id} className='flex justify-between items-center p-3 rounded-md border bg-background text-sm'>
              <div>
                <span className='font-medium'>{idioma.nome}</span>
                <p className='text-muted-foreground text-xs'>
                  {idioma.nivel.charAt(0).toUpperCase() + idioma.nivel.slice(1).toLowerCase()}
                </p>
              </div>
              <div className='flex gap-1'>
                <Button variant='ghost' size='icon' onClick={() => handleOpenForm(idioma)} disabled={isPending}>
                  <Pencil size={16} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive'
                  onClick={() => handleDelete(idioma.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 size={16} className='animate-spin' /> : <Trash2 size={16} />}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className='text-muted-foreground text-center py-8'>Nenhum idioma adicionado.</p>
        )}
      </div>
    </div>
  );
}
