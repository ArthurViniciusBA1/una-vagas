"use client";

import React from 'react';
import { CurriculoSecaoModal } from '@/components/curriculo/modals/CurriculoSecaoModal';
import { InformacoesPessoaisForm } from '@/components/curriculo/forms/InformacoesPessoaisForm';
import { ExperienciaHub } from './management/ExperienciaHub';
import { FormacaoHub } from './management/FormacaoHub';

type ActiveModalType = 'infoPessoal' | 'experiencia' | 'formacao' | 'habilidades' | 'idiomas' | 'projetos' | 'certificacoes' | null;

interface DashboardModalsManagerProps {
  activeModal: ActiveModalType;
  setActiveModal: (modal: ActiveModalType) => void;
}

export function DashboardModalsManager({ activeModal, setActiveModal }: DashboardModalsManagerProps) {
  const closeModal = () => setActiveModal(null);

  return (
    <>
      {/* Modal de Informações Pessoais */}
      <CurriculoSecaoModal 
        isOpen={activeModal === 'infoPessoal'} 
        setIsOpen={closeModal} 
        title="Editar Informações Pessoais"
      >
        <InformacoesPessoaisForm setModalOpen={closeModal} />
      </CurriculoSecaoModal>

      {/* Modal de Experiências */}
      <CurriculoSecaoModal 
        isOpen={activeModal === 'experiencia'} 
        setIsOpen={closeModal} 
        title="Gerenciar Experiências Profissionais"
        dialogContentClassName="sm:max-w-2xl"
      >
        {activeModal === 'experiencia' && <ExperienciaHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>
      
      {/* Modal de Formação */}
      <CurriculoSecaoModal 
        isOpen={activeModal === 'formacao'} 
        setIsOpen={closeModal} 
        title="Gerenciar Formação Acadêmica"
        dialogContentClassName="sm:max-w-2xl"
      >
        {activeModal === 'formacao' && <FormacaoHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>
    </>
  );
}