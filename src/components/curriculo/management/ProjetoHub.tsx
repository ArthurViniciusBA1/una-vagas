"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCandidato } from '@/context/CandidatoContext';
import { Projeto } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Link as LinkIcon, Github } from 'lucide-react';
import { ProjetoForm } from '../forms/ProjetoForm';

export function ProjetoHub({ setModalOpen }: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, deleteProjeto } = useCandidato();
  const [projetoParaEditar, setProjetoParaEditar] = useState<Projeto | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = (projeto: Projeto | null) => {
    setProjetoParaEditar(projeto);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setProjetoParaEditar(null);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este projeto?")) {
      await deleteProjeto(id);
    }
  };

  const dadosIniciaisFormatados = projetoParaEditar ? {
    ...projetoParaEditar,
    descricao: projetoParaEditar.descricao ?? '',
    projectUrl: projetoParaEditar.projectUrl ?? '',
    repositorioUrl: projetoParaEditar.repositorioUrl ?? '',
  } : null;

  if (showForm) {
    return (
        <ProjetoForm 
            setModalOpen={handleCloseForm}
            dadosIniciais={dadosIniciaisFormatados}
        />
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className="mr-2" />
          Adicionar Novo Projeto
        </Button>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {curriculo?.projetos && curriculo.projetos.length > 0 ? (
          curriculo.projetos.map(projeto => (
            <div key={projeto.id} className="p-3 rounded-md border bg-background">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base">{projeto.nome}</h3>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(projeto)}>
                        <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(projeto.id)}>
                        <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
                {projeto.descricao && <p className="text-sm text-muted-foreground mt-1">{projeto.descricao}</p>}
                <div className='flex items-center gap-4 mt-3'>
                    {projeto.projectUrl && (
                        <Button variant="link" asChild className="p-0 h-auto text-xs">
                            <Link href={projeto.projectUrl} target="_blank" rel="noopener noreferrer">
                                <LinkIcon size={14} className="mr-1.5"/> Ver Projeto
                            </Link>
                        </Button>
                    )}
                    {projeto.repositorioUrl && (
                        <Button variant="link" asChild className="p-0 h-auto text-xs">
                            <Link href={projeto.repositorioUrl} target="_blank" rel="noopener noreferrer">
                                <Github size={14} className="mr-1.5"/> Repositório
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhum projeto adicionado.</p>
        )}
      </div>
    </div>
  );
}