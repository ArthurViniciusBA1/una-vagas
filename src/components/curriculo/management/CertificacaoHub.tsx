"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCandidato } from '@/context/CandidatoContext';
import { Certificacao } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Link as LinkIcon } from 'lucide-react';
import { CertificacaoForm } from '../forms/CertificacaoForm';

export function CertificacaoHub({ setModalOpen }: { setModalOpen: (isOpen: boolean) => void }) {
  const { curriculo, deleteCertificacao } = useCandidato();
  const [certificacaoParaEditar, setCertificacaoParaEditar] = useState<Certificacao | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = (certificacao: Certificacao | null) => {
    setCertificacaoParaEditar(certificacao);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCertificacaoParaEditar(null);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta certificação?")) {
      await deleteCertificacao(id);
    }
  };

  if (showForm) {
    return (
        <CertificacaoForm 
            setModalOpen={handleCloseForm}
            dadosIniciais={certificacaoParaEditar}
        />
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle size={18} className="mr-2" />
          Adicionar Certificação
        </Button>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {curriculo?.certificacoes && curriculo.certificacoes.length > 0 ? (
          curriculo.certificacoes.map(cert => (
            <div key={cert.id} className="p-3 rounded-md border bg-background text-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-base">{cert.nome}</h3>
                        <p className="text-muted-foreground">{cert.organizacaoEmissora}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Emitido em: {new Date(cert.dataEmissao).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(cert)}>
                            <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cert.id)}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
                {cert.credencialUrl && (
                    <Button variant="link" asChild className="p-0 h-auto text-xs mt-2">
                        <Link href={cert.credencialUrl} target="_blank" rel="noopener noreferrer">
                            <LinkIcon size={14} className="mr-1.5"/> Ver Credencial
                        </Link>
                    </Button>
                )}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma certificação adicionada.</p>
        )}
      </div>
    </div>
  );
}