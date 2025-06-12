'use client';

import { BriefcaseBusiness, Users, Building2, LayoutDashboard, Briefcase, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react'; // Adiciona useState, useEffect, useRef
import { toast } from 'sonner';
import { fetchDashboardData } from '@/actions/empresaActions'; // Importa a nova Server Action

export default function PaginaDashboardEmpresa() {
  const [dashboardData, setDashboardData] = useState<any | null>(null); // 'any' temporariamente para os dados do dashboard
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ignoreStrictDoubleRender = useRef(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading('Carregando dashboard...');

    try {
      const result = await fetchDashboardData(); // Chama a Server Action

      if (result.success && result.data) {
        setDashboardData(result.data);
        toast.success('Dashboard carregado!', { id: toastId, duration: 2000 });
      } else {
        setError(result.error || 'Falha ao carregar dashboard.');
        toast.error(result.error || 'Falha ao carregar dashboard.', { id: toastId });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      toast.error('Ocorreu um erro inesperado.', { id: toastId });
      console.error('Erro no loadDashboardData:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Controla a dupla renderização do StrictMode
    if (!ignoreStrictDoubleRender.current) {
      ignoreStrictDoubleRender.current = true;
      loadDashboardData();
    }
  }, []); // Array de dependências vazio para carregar apenas uma vez na montagem

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
        <span className='ml-4 text-muted-foreground'>Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
        <p className='mt-4 text-center'>
          Por favor, tente{' '}
          <Button variant='link' onClick={loadDashboardData} className='p-0 h-auto underline'>
            novamente
          </Button>
          .
        </p>
      </div>
    );
  }

  // Se não houver dados após o carregamento (improvável se não há erro, mas bom para garantir)
  if (!dashboardData) {
    return (
      <div className='col-span-full text-center text-muted-foreground py-12'>
        <p className='text-xl'>Não foi possível carregar o dashboard. Tente novamente.</p>
        <p className='mt-2 text-sm'>
          <Button variant='link' onClick={loadDashboardData} className='p-0 h-auto underline'>
            Recarregar
          </Button>
        </p>
      </div>
    );
  }

  // Desestruturar os dados para facilitar o uso na UI
  const {
    empresaNome,
    empresaDescricao,
    recrutadorNome,
    recrutadorEmail,
    totalVagasAtivas,
    totalCandidaturasRecebidas,
    totalCandidaturasEmProcesso,
    totalCandidaturasAprovadas,
  } = dashboardData;

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <LayoutDashboard size={32} />
          <span>
            Dashboard
            {empresaNome === 'Painel Administrativo' ? ' Administrativo' : ` ${empresaNome}`}
          </span>
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Olá, <span className='font-semibold'>{recrutadorNome}</span> ({recrutadorEmail}).{' '}
          {empresaDescricao || 'Bem-vindo(a) ao seu painel de gestão de vagas.'}
        </p>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {/* Cards de Estatísticas */}
        <div className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center gap-3'>
          <BriefcaseBusiness size={30} className='text-primary mb-2' />
          <p className='text-4xl font-extrabold text-foreground'>{totalVagasAtivas}</p>
          <p className='text-muted-foreground text-sm font-medium'>Vagas Ativas</p>
          <Button asChild variant='ghost' className='mt-2 w-full'>
            <Link href='/empresa/vagas'>Gerenciar Vagas</Link>
          </Button>
        </div>

        <div className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center gap-3'>
          <Users size={30} className='text-primary mb-2' />
          <p className='text-4xl font-extrabold text-foreground'>{totalCandidaturasRecebidas}</p>
          <p className='text-lg text-muted-foreground font-medium'>Candidaturas Recebidas</p>
          <Button asChild variant='ghost' className='mt-2 w-full'>
            <Link href='/empresa/candidaturas'>Ver Todas</Link>
          </Button>
        </div>

        <div className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center gap-3'>
          <Briefcase size={30} className='text-primary mb-2' />
          <p className='text-4xl font-extrabold text-foreground'>{totalCandidaturasEmProcesso}</p>
          <p className='text-lg text-muted-foreground font-medium'>Em Processo</p>
          <Button asChild variant='ghost' className='mt-2 w-full'>
            <Link href='/empresa/candidaturas?status=EM_PROCESSO'>Ver Em Processo</Link>
          </Button>
        </div>

        <div className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center gap-3'>
          <Mail size={30} className='text-primary mb-2' />
          <p className='text-4xl font-extrabold text-foreground'>{totalCandidaturasAprovadas}</p>
          <p className='text-lg text-muted-foreground font-medium'>Candidaturas Aprovadas</p>
          <Button asChild variant='ghost' className='mt-2 w-full'>
            <Link href='/empresa/candidaturas?status=APROVADO'>Ver Aprovadas</Link>
          </Button>
        </div>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-bold text-foreground mb-4'>Ações Rápidas</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Button asChild>
            <Link href='/empresa/vagas/criar-vaga'>
              <BriefcaseBusiness size={18} className='mr-2' />
              Publicar Nova Vaga
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/empresa/perfil-empresa'>
              <Building2 size={18} className='mr-2' />
              Editar Perfil da Empresa
            </Link>
          </Button>
          {/* Adicione mais ações rápidas conforme necessário */}
        </div>
      </section>
    </div>
  );
}
