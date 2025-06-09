"use client";

import React from 'react';

import { InformacoesPessoaisForm } from '@/components/curriculo/forms/InformacoesPessoaisForm';
import { CurriculoSecaoModal } from '@/components/curriculo/modals/CurriculoSecaoModal';

import { CertificacaoHub } from './management/CertificacaoHub';
import { ExperienciaHub } from './management/ExperienciaHub';
import { FormacaoHub } from './management/FormacaoHub';
import { HabilidadeHub } from './management/HabilidadeHub';
import { IdiomaHub } from './management/IdiomaHub';
import { ProjetoHub } from './management/ProjetoHub';

type ActiveModalType = 'infoPessoal' | 'experiencia' | 'formacao' | 'habilidades' | 'idiomas' | 'projetos' | 'certificacoes' | null;

interface DashboardModalsManagerProps {
  activeModal: ActiveModalType;
  setActiveModal: (modal: ActiveModalType) => void;
}

export function DashboardModalsManager({ activeModal, setActiveModal }: DashboardModalsManagerProps) {
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <CurriculoSecaoModal 
        isOpen={activeModal === 'infoPessoal'} 
        setIsOpen={closeModal} 
        title="Editar Informações Pessoais"
      >
        <InformacoesPessoaisForm setModalOpen={closeModal} />
      </CurriculoSecaoModal>

      <CurriculoSecaoModal 
        isOpen={activeModal === 'experiencia'} 
        setIsOpen={closeModal} 
        title="Gerenciar Experiências Profissionais"
        dialogContentClassName="sm:max-w-2xl"
      >
        {activeModal === 'experiencia' && <ExperienciaHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>
      
      <CurriculoSecaoModal 
        isOpen={activeModal === 'formacao'} 
        setIsOpen={closeModal} 
        title="Gerenciar Formação Acadêmica"
        dialogContentClassName="sm:max-w-2xl"
      >
        {activeModal === 'formacao' && <FormacaoHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>

      <CurriculoSecaoModal 
        isOpen={activeModal === 'habilidades'} 
        setIsOpen={closeModal} 
        title="Gerenciar Habilidades"
        dialogContentClassName="sm:max-w-xl"
      >
        {activeModal === 'habilidades' && <HabilidadeHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>

      <CurriculoSecaoModal 
        isOpen={activeModal === 'idiomas'} 
        setIsOpen={closeModal} 
        title="Gerenciar Idiomas"
        dialogContentClassName="sm:max-w-xl"
      >
        {activeModal === 'idiomas' && <IdiomaHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>

      <CurriculoSecaoModal 
        isOpen={activeModal === 'projetos'} 
        setIsOpen={closeModal} 
        title="Gerenciar Projetos"
        dialogContentClassName="sm:max-w-xl"
      >
        {activeModal === 'projetos' && <ProjetoHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>
      
      <CurriculoSecaoModal 
        isOpen={activeModal === 'certificacoes'} 
        setIsOpen={closeModal} 
        title="Gerenciar Certificações"
        dialogContentClassName="sm:max-w-xl"
      >
        {activeModal === 'certificacoes' && <CertificacaoHub setModalOpen={closeModal} />}
      </CurriculoSecaoModal>
    </>
  );
}