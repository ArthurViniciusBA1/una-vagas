import { Users } from 'lucide-react';
import { RoleUsuario } from '@prisma/client';

import { listarTodosUsuariosAction, listarTodasEmpresasAction } from '@/actions/adminActions';
import { UserManagementClient } from '@/components/admin/UserManagementClient';

interface AdminUsuariosPageProps {
  searchParams: {
    page?: string;
    query?: string;
    role?: string;
    status?: string;
  };
}

export default async function AdminUsuariosPage({ searchParams }: AdminUsuariosPageProps) {
  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || '';
  const role =
    searchParams.role === 'TODOS' || !searchParams.role
      ? undefined
      : (searchParams.role as RoleUsuario);
  const status =
    searchParams.status === 'TODOS' || !searchParams.status ? undefined : searchParams.status;

  // Busca os dados no servidor antes de renderizar
  const resultUsuarios = await listarTodosUsuariosAction({ page, query, role, status });
  const resultEmpresas = await listarTodasEmpresasAction();

  const initialUsuarios = resultUsuarios.success ? resultUsuarios.items : [];
  const initialTotal = resultUsuarios.success ? resultUsuarios.total : 0;
  const empresas = resultEmpresas.success ? resultEmpresas.data : [];

  return (
    <div className='container mx-auto py-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold flex items-center gap-3'>
          <Users /> Gestão de Usuários
        </h1>
        <p className='text-muted-foreground mt-1'>
          Visualize, filtre e gerencie todos os usuários da plataforma.
        </p>
      </header>

      <UserManagementClient
        initialUsuarios={initialUsuarios || []}
        initialTotal={initialTotal || 0}
        empresas={empresas || []}
      />
    </div>
  );
}
