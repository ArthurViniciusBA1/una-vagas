"use client";

import React, { useState } from 'react';
import { useCandidato } from '@/context/CandidatoContext';
import { FormacaoAcademica } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { FormacaoAcademicaForm } from '../forms/FormacaoAcademicaForm';

export function FormacaoHub({ setModalOpen }: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, deleteFormacao } = useCandidato();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formacaoParaEditar, setFormacaoParaEditar] = useState<FormacaoAcademica | null>(null);

  const handleOpenForm = (formacao: FormacaoAcademica | null) => {
    setFormacaoParaEditar(formacao);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta formação?")) {
      await deleteFormacao(id);
    }
  };

  const handleFormSuccess = () => {
    setView('list');
    setFormacaoParaEditar(null);
  };
  
  const dadosIniciaisFormatados = formacaoParaEditar ? {
    ...formacaoParaEditar,
    dataInicio: new Date(formacaoParaEditar.dataInicio).toISOString().substring(0, 7),
    dataFim: formacaoParaEditar.dataFim ? new Date(formacaoParaEditar.dataFim).toISOString().substring(0, 7) : '',
    descricao: formacaoParaEditar.descricao ?? '',
    areaEstudo: formacaoParaEditar.areaEstudo ?? '',
  } : null;

  if (view === 'form') {
    return (
      <div className="pt-4">
        <Button variant="ghost" size="sm" onClick={() => setView('list')} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Voltar para a lista
        </Button>
        <FormacaoAcademicaForm 
            setModalOpen={handleFormSuccess}
            dadosIniciais={dadosIniciaisFormatados}
        />
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className="mr-2" />
          Adicionar Formação
        </Button>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {curriculo?.formacoesAcademicas && curriculo.formacoesAcademicas.length > 0 ? (
          curriculo.formacoesAcademicas.map(formacao => (
            <div key={formacao.id} className="flex justify-between items-start p-3 rounded-md border bg-background">
              <div>
                <h3 className="font-bold text-lg">{formacao.curso}</h3>
                <p className="text-primary font-medium">{formacao.instituicao}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenForm(formacao)}> <Pencil size={18} /> </Button>
                <Button variant="default" size="icon" className="text-destructive bg-transparent hover:bg-destructive hover:text-white" onClick={() => handleDelete(formacao.id)}> <Trash2 size={18} /> </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma formação acadêmica adicionada.</p>
        )}
      </div>
    </div>
  );
}