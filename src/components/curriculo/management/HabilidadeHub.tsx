"use client";

import { Habilidade } from '@prisma/client';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';

import { HabilidadeForm } from '../forms/HabilidadeForm';

export function HabilidadeHub({ }: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, deleteHabilidade } = useCandidato();
  const [habilidadeParaEditar, setHabilidadeParaEditar] = useState<Habilidade | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = (habilidade: Habilidade | null) => {
    setHabilidadeParaEditar(habilidade);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setHabilidadeParaEditar(null);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta habilidade?")) {
      await deleteHabilidade(id);
    }
  };

  if (showForm) {
    return (
        <HabilidadeForm 
            setModalOpen={handleCloseForm}
            dadosIniciais={habilidadeParaEditar}
        />
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className="mr-2" />
          Adicionar Nova Habilidade
        </Button>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {curriculo?.habilidades && curriculo.habilidades.length > 0 ? (
          curriculo.habilidades.map(habilidade => (
            <div key={habilidade.id} className="flex justify-between items-center p-3 rounded-md border bg-background text-sm">
              <span className="font-medium">{habilidade.nome}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenForm(habilidade)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(habilidade.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma habilidade adicionada.</p>
        )}
      </div>
    </div>
  );
}