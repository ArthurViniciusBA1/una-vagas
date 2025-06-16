'use client';

import { useEffect, useState } from 'react';
import { Building, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getAdminDashboardStatsAction } from '@/actions/adminActions';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStats {
  totalUsuarios: number;
  totalEmpresas: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStatsAction().then((result) => {
      if (result.success) {
        setStats(result.data);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <div className='container mx-auto py-8'>
      <header className='mb-10'>
        <h1 className='text-4xl font-bold'>Painel Administrativo</h1>
        <p className='text-lg text-muted-foreground'>Gerencie a plataforma, empresas e usuários.</p>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        <div className='p-6 bg-card border rounded-lg flex flex-col'>
          <h2 className='text-2xl font-semibold flex items-center gap-3'>
            <Building size={24} /> Gestão de Empresas
          </h2>
          <div className='flex-grow mt-2'>
            {isLoading ? (
              <Skeleton className='h-10 w-20' />
            ) : (
              <p className='text-4xl font-extrabold'>{stats?.totalEmpresas ?? 0}</p>
            )}
            <p className='text-muted-foreground'>Empresas cadastradas</p>
          </div>
          <Button asChild className='mt-4'>
            <Link href='/admin/empresas'>Gerenciar Empresas</Link>
          </Button>
        </div>

        <div className='p-6 bg-card border rounded-lg flex flex-col'>
          <h2 className='text-2xl font-semibold flex items-center gap-3'>
            <Users size={24} /> Gestão de Usuários
          </h2>
          <div className='flex-grow mt-2'>
            {isLoading ? (
              <Skeleton className='h-10 w-20' />
            ) : (
              <p className='text-4xl font-extrabold'>{stats?.totalUsuarios ?? 0}</p>
            )}
            <p className='text-muted-foreground'>Usuários na plataforma</p>
          </div>
          <Button asChild className='mt-4'>
            <Link href='/admin/usuarios'>Gerenciar Usuários</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
