import {
  Award,
  Briefcase,
  FileText,
  Github,
  Languages,
  Lightbulb,
  Link as LinkIcon,
  Linkedin,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

function CurriculoSecao({
  titulo,
  icon,
  children,
}: {
  titulo: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <section className='mb-8'>
      <div className='flex items-center mb-4'>
        <div className='bg-primary/10 p-2 rounded-full mr-4'>{icon}</div>
        <h2 className='text-xl font-bold text-primary'>{titulo}</h2>
      </div>
      <div className='pl-[52px] border-l-2 border-primary/20 ml-3'>{children}</div>
    </section>
  );
}

function formatarData(data: Date | null | undefined): string {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function ResumeDisplay({ curriculo }: { curriculo: any }) {
  if (!curriculo) {
    return (
      <div className='p-8 text-center text-muted-foreground bg-muted/50 rounded-lg'>
        Este candidato ainda não criou um currículo.
      </div>
    );
  }

  return (
    <div className='bg-card rounded-lg p-6 sm:p-10'>
      {curriculo.resumoProfissional && (
        <CurriculoSecao
          titulo='Resumo Profissional'
          icon={<FileText size={20} className='text-primary' />}
        >
          <p className='text-gray-700 leading-relaxed'>{curriculo.resumoProfissional}</p>
        </CurriculoSecao>
      )}
      <CurriculoSecao
        titulo='Experiência Profissional'
        icon={<Briefcase size={20} className='text-primary' />}
      >
        <div className='space-y-6'>
          {curriculo.experienciasProfissionais?.map((exp: any) => (
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
      >
        <div className='space-y-6'>
          {curriculo.formacoesAcademicas?.map((formacao: any) => (
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
      <CurriculoSecao titulo='Habilidades' icon={<Lightbulb size={20} className='text-primary' />}>
        <div className='flex flex-wrap gap-2'>
          {curriculo.habilidades?.map((hab: any) => (
            <Badge key={hab.id} variant='secondary'>
              {hab.nome}
            </Badge>
          ))}
        </div>
      </CurriculoSecao>
      <CurriculoSecao titulo='Idiomas' icon={<Languages size={20} className='text-primary' />}>
        <div className='space-y-2'>
          {curriculo.idiomas?.map((idioma: any) => (
            <p key={idioma.id} className='text-gray-700'>
              {idioma.nome} -{' '}
              <span className='font-semibold capitalize'>{idioma.nivel.toLowerCase()}</span>
            </p>
          ))}
        </div>
      </CurriculoSecao>
      <CurriculoSecao titulo='Projetos' icon={<Lightbulb size={20} className='text-primary' />}>
        <div className='space-y-6'>
          {curriculo.projetos?.map((proj: any) => (
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
      <CurriculoSecao titulo='Certificações' icon={<Award size={20} className='text-primary' />}>
        <div className='space-y-4'>
          {curriculo.certificacoes?.map((cert: any) => (
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
    </div>
  );
}
