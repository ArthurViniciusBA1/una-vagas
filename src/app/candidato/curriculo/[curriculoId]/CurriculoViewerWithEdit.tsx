/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/candidato/curriculo/[curriculoId]/CurriculoViewerWithEdit.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import {
  Award,
  Briefcase,
  FileText,
  Github,
  Languages,
  Lightbulb,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  Pencil, // Mantenha, se os ícones forem usados em outras partes
} from 'lucide-react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { CurriculoSecaoModal } from '@/components/curriculo/modals/CurriculoSecaoModal';
import { InformacoesPessoaisForm } from '@/components/curriculo/forms/InformacoesPessoaisForm';
import { ExperienciaHub } from '@/components/curriculo/management/ExperienciaHub';
import { FormacaoHub } from '@/components/curriculo/management/FormacaoHub';
import { HabilidadeHub } from '@/components/curriculo/management/HabilidadeHub';
import { IdiomaHub } from '@/components/curriculo/management/IdiomaHub';
import { ProjetoHub } from '@/components/curriculo/management/ProjetoHub';
import { CertificacaoHub } from '@/components/curriculo/management/CertificacaoHub';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';

// Importe o novo wrapper de transição
import { ModeTransitionWrapper } from '@/components/curriculo/ModeTransitionWrapper';

const curriculoQueryArgs = Prisma.validator<Prisma.CurriculoDefaultArgs>()({
  include: {
    usuario: { select: { id: true, nome: true, email: true } },
    experienciasProfissionais: { orderBy: { dataInicio: 'desc' as const } },
    formacoesAcademicas: { orderBy: { dataInicio: 'desc' as const } },
    habilidades: { orderBy: { nome: 'asc' as const } },
    idiomas: { orderBy: { nome: 'asc' as const } },
    projetos: { orderBy: { nome: 'asc' as const } },
    certificacoes: { orderBy: { dataEmissao: 'desc' as const } },
  },
});
type CurriculoCompleto = Prisma.CurriculoGetPayload<typeof curriculoQueryArgs>;

interface CurriculoViewerWithEditProps {
  curriculo: CurriculoCompleto;
  isEditMode: boolean;
  loggedInUserId: string;
}

function formatarData(data: Date | null | undefined): string {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function CurriculoSecao({
  titulo,
  icon,
  children,
  isEditMode,
  onEditClick,
}: {
  titulo: string;
  icon: ReactNode;
  children: ReactNode;
  isEditMode: boolean;
  onEditClick?: () => void;
}) {
  return (
    <section className='mb-8'>
      <div className='flex items-center mb-4'>
        <div className='bg-primary/10 p-2 rounded-full mr-4'>{icon}</div>
        <h2 className='text-2xl font-bold text-primary'>{titulo}</h2>
        {isEditMode && onEditClick && (
          <Button
            variant='ghost'
            size='icon'
            onClick={onEditClick}
            className='ml-3 text-gray-500 hover:text-primary'
          >
            <Pencil size={18} />
          </Button>
        )}
      </div>
      <div className='pl-[56px] border-l-2 border-primary/20 ml-4'>{children}</div>
    </section>
  );
}

export default function CurriculoViewerWithEdit({
  curriculo: initialCurriculo,
  isEditMode,
  loggedInUserId,
}: CurriculoViewerWithEditProps) {
  const { curriculo, fetchCandidatoData } = useCandidato();

  const currentCurriculo = curriculo || initialCurriculo;

  const [activeModal, setActiveModal] = useState<
    | 'infoPessoal'
    | 'experiencia'
    | 'formacao'
    | 'habilidades'
    | 'idiomas'
    | 'projetos'
    | 'certificacoes'
    | null
  >(null);

  const handleOpenModal = (modalType: typeof activeModal) => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    fetchCandidatoData();
  };

  if (!currentCurriculo) {
    return (
      <div className='text-center text-muted-foreground'>
        Currículo não encontrado ou carregando...
      </div>
    );
  }

  const isOwner = loggedInUserId === currentCurriculo.usuario.id;

  return (
    <ModeTransitionWrapper isEditMode={isEditMode} isOwner={isOwner}>
      <div className='max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-10 my-8'>
        <header className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10'>
          <div>
            <h1 className='text-4xl font-extrabold text-gray-800'>
              {currentCurriculo.usuario.nome}
            </h1>
            <p className='text-xl text-primary font-medium mt-1'>{currentCurriculo.titulo}</p>
          </div>
          <div className='text-sm text-gray-600 flex flex-col items-start sm:items-end gap-1.5'>
            {currentCurriculo.usuario.email && (
              <span className='flex items-center gap-2'>
                <Mail size={14} /> {currentCurriculo.usuario.email}
              </span>
            )}
            {currentCurriculo.telefone && (
              <span className='flex items-center gap-2'>
                <Phone size={14} /> {currentCurriculo.telefone}
              </span>
            )}
            {currentCurriculo.endereco && (
              <span className='flex items-center gap-2'>
                <MapPin size={14} /> {currentCurriculo.endereco}
              </span>
            )}
            <div className='flex items-center gap-3 mt-2'>
              {currentCurriculo.linkedinUrl && (
                <Link href={currentCurriculo.linkedinUrl} target='_blank' rel='noopener noreferrer'>
                  <Linkedin className='text-blue-700' />
                </Link>
              )}
              {currentCurriculo.githubUrl && (
                <Link href={currentCurriculo.githubUrl} target='_blank' rel='noopener noreferrer'>
                  <Github className='text-gray-800' />
                </Link>
              )}
            </div>
          </div>
        </header>

        {currentCurriculo.resumoProfissional && (
          <CurriculoSecao
            titulo='Resumo Profissional'
            icon={<User size={20} className='text-primary' />}
            isEditMode={isEditMode}
            onEditClick={() => handleOpenModal('infoPessoal')}
          >
            <p className='text-gray-700 leading-relaxed'>{currentCurriculo.resumoProfissional}</p>
          </CurriculoSecao>
        )}

        <CurriculoSecao
          titulo='Experiência Profissional'
          icon={<Briefcase size={20} className='text-primary' />}
          isEditMode={isEditMode}
          onEditClick={() => handleOpenModal('experiencia')}
        >
          <div className='space-y-6'>
            {currentCurriculo.experienciasProfissionais.map((exp) => (
              <div key={exp.id}>
                <h3 className='text-lg font-semibold text-gray-800'>{exp.cargo}</h3>
                <p className='text-md text-gray-700'>
                  {exp.nomeEmpresa} • {exp.local}
                </p>
                <p className='text-sm text-gray-500 capitalize'>
                  {formatarData(exp.dataInicio)} -{' '}
                  {exp.trabalhoAtual ? 'Presente' : formatarData(exp.dataFim)}
                </p>
                {exp.descricao && (
                  <p className='mt-2 text-sm text-gray-600 whitespace-pre-line'>{exp.descricao}</p>
                )}
              </div>
            ))}
          </div>
        </CurriculoSecao>

        <CurriculoSecao
          titulo='Formação Acadêmica'
          icon={<FileText size={20} className='text-primary' />}
          isEditMode={isEditMode}
          onEditClick={() => handleOpenModal('formacao')}
        >
          <div className='space-y-6'>
            {currentCurriculo.formacoesAcademicas.map((formacao) => (
              <div key={formacao.id}>
                <h3 className='text-lg font-semibold text-gray-800'>{formacao.curso}</h3>
                <p className='text-md text-gray-700'>{formacao.instituicao}</p>
                <p className='text-sm text-gray-500 capitalize'>
                  {formatarData(formacao.dataInicio)} -{' '}
                  {formacao.emCurso ? 'Presente' : formatarData(formacao.dataFim)}
                </p>
              </div>
            ))}
          </div>
        </CurriculoSecao>

        <CurriculoSecao
          titulo='Habilidades'
          icon={<Star size={20} className='text-primary' />}
          isEditMode={isEditMode}
          onEditClick={() => handleOpenModal('habilidades')}
        >
          <div className='flex flex-wrap gap-2'>
            {currentCurriculo.habilidades.map((hab) => (
              <Badge key={hab.id} variant='secondary'>
                {hab.nome}
              </Badge>
            ))}
          </div>
        </CurriculoSecao>

        <CurriculoSecao
          titulo='Idiomas'
          icon={<Languages size={20} className='text-primary' />}
          isEditMode={isEditMode}
          onEditClick={() => handleOpenModal('idiomas')}
        >
          <div className='space-y-2'>
            {currentCurriculo.idiomas.map((idioma) => (
              <p key={idioma.id} className='text-gray-700'>
                {idioma.nome} -{' '}
                <span className='font-semibold capitalize'>{idioma.nivel.toLowerCase()}</span>
              </p>
            ))}
          </div>
        </CurriculoSecao>

        <CurriculoSecao
          titulo='Projetos'
          icon={<Lightbulb size={20} className='text-primary' />}
          isEditMode={isEditMode}
          onEditClick={() => handleOpenModal('projetos')}
        >
          <div className='space-y-6'>
            {currentCurriculo.projetos.map((proj) => (
              <div key={proj.id}>
                <div className='flex items-center gap-2'>
                  <h3 className='text-lg font-semibold text-gray-800'>{proj.nome}</h3>
                  {proj.projectUrl && (
                    <Link href={proj.projectUrl} target='_blank'>
                      <LinkIcon size={14} className='text-blue-600 hover:underline' />
                    </Link>
                  )}
                  {proj.repositorioUrl && (
                    <Link href={proj.repositorioUrl} target='_blank'>
                      <Github size={14} className='text-gray-800 hover:underline' />
                    </Link>
                  )}
                </div>
                {proj.descricao && <p className='mt-1 text-sm text-gray-600'>{proj.descricao}</p>}
              </div>
            ))}
          </div>
        </CurriculoSecao>

        <CurriculoSecao
          titulo='Certificações'
          icon={<Award size={20} className='text-primary' />}
          isEditMode={isEditMode}
          onEditClick={() => handleOpenModal('certificacoes')}
        >
          <div className='space-y-4'>
            {currentCurriculo.certificacoes.map((cert) => (
              <div key={cert.id}>
                <div className='flex items-center gap-2'>
                  <h3 className='text-md font-semibold text-gray-800'>{cert.nome}</h3>
                  {cert.credencialUrl && (
                    <Link href={cert.credencialUrl} target='_blank'>
                      <LinkIcon size={14} className='text-blue-600 hover:underline' />
                    </Link>
                  )}
                </div>
                <p className='text-sm text-gray-700'>
                  {cert.organizacaoEmissora} - {formatarData(cert.dataEmissao)}
                </p>
              </div>
            ))}
          </div>
        </CurriculoSecao>

        {activeModal === 'infoPessoal' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Editar Informações Pessoais'
          >
            <InformacoesPessoaisForm setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
        {activeModal === 'experiencia' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Gerenciar Experiências Profissionais'
            dialogContentClassName='sm:max-w-2xl'
          >
            <ExperienciaHub setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
        {activeModal === 'formacao' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Gerenciar Formação Acadêmica'
            dialogContentClassName='sm:max-w-2xl'
          >
            <FormacaoHub setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
        {activeModal === 'habilidades' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Gerenciar Habilidades'
            dialogContentClassName='sm:max-w-xl'
          >
            <HabilidadeHub setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
        {activeModal === 'idiomas' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Gerenciar Idiomas'
            dialogContentClassName='sm:max-w-xl'
          >
            <IdiomaHub setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
        {activeModal === 'projetos' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Gerenciar Projetos'
            dialogContentClassName='sm:max-w-xl'
          >
            <ProjetoHub setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
        {activeModal === 'certificacoes' && (
          <CurriculoSecaoModal
            isOpen={true}
            setIsOpen={handleCloseModal}
            title='Gerenciar Certificações'
            dialogContentClassName='sm:max-w-xl'
          >
            <CertificacaoHub setModalOpen={handleCloseModal} />
          </CurriculoSecaoModal>
        )}
      </div>
    </ModeTransitionWrapper>
  );
}
