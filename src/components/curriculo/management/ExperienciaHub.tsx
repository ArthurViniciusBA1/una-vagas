"use client";

import React, { useState } from 'react';
import { useCandidato } from '@/context/CandidatoContext';
import { ExperienciaProfissional } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { ExperienciaProfissionalForm } from '../forms/ExperienciaProfissionalForm';
import { tExperienciaProfissional } from '@/schemas/curriculoSchema';

export function ExperienciaHub({ setModalOpen }: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, deleteExperiencia } = useCandidato();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [experienciaParaEditar, setExperienciaParaEditar] = useState<ExperienciaProfissional | null>(null);

  /**
   * Controla a abertura do formulário, recebendo a experiência a ser editada
   * ou null para adicionar uma nova.
   */
  const handleOpenForm = (exp: ExperienciaProfissional | null) => {
    setExperienciaParaEditar(exp);
    setView('form');
  };

  /**
   * Chama a função de deletar do contexto após confirmação do usuário.
   */
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta experiência?")) {
      await deleteExperiencia(id);
    }
  };

  /**
   * Função passada para o formulário. Quando o formulário é salvo com sucesso,
   * ele chama esta função para voltar à tela de lista.
   */
  const handleFormSuccess = () => {
    setView('list');
    setExperienciaParaEditar(null);
  };
  
  /**
   * Prepara os dados para o formulário, convertendo datas para o formato YYYY-MM
   * e mapeando o campo `local` do banco para `localidade` no formulário.
   */
  const dadosIniciaisFormatados = experienciaParaEditar ? {
      ...experienciaParaEditar,
      localidade: experienciaParaEditar.local || '',
      dataInicio: new Date(experienciaParaEditar.dataInicio).toISOString().substring(0, 7),
      dataFim: experienciaParaEditar.dataFim ? new Date(experienciaParaEditar.dataFim).toISOString().substring(0, 7) : '',
  } : null;

  if (view === 'form') {
    return (
      <div className="pt-4">
        <Button variant="ghost" size="sm" onClick={() => setView('list')} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Voltar para a lista
        </Button>
        <ExperienciaProfissionalForm 
            setModalOpen={handleFormSuccess}
            dadosIniciais={dadosIniciaisFormatados as tExperienciaProfissional | null}
        />
      </div>
    );
  }
  
  return (
    <div className="pt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className="mr-2" />
          Adicionar Nova Experiência
        </Button>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {curriculo?.experienciasProfissionais && curriculo.experienciasProfissionais.length > 0 ? (
          curriculo.experienciasProfissionais.map(exp => (
            <div key={exp.id} className="flex justify-between items-start p-3 rounded-md border bg-background">
              <div>
                <h3 className="font-bold text-lg">{exp.cargo}</h3>
                <p className="text-primary font-medium">{exp.nomeEmpresa}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(exp.dataInicio).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })} - 
                  {exp.trabalhoAtual ? ' Presente' : (exp.dataFim ? ` ${new Date(exp.dataFim).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}` : '')}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenForm(exp)}>
                  <Pencil size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:white hover:bg-destructive" onClick={() => handleDelete(exp.id)}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma experiência profissional adicionada.</p>
        )}
      </div>
    </div>
  );
}