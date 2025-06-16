'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Empresa, RoleUsuario } from '@prisma/client';

import { listarTodosUsuariosAction } from '@/actions/adminActions';
import { UserTable } from '@/components/admin/UserTable';
import { UserFilters } from '@/components/admin/UserFilters';
import { PaginationControls } from '@/components/admin/PaginationControls';
import { UserActionsModal } from '@/components/admin/UserActionsModal';

interface UserManagementClientProps {
  initialUsuarios: any[];
  initialTotal: number;
  empresas: Pick<Empresa, 'id' | 'nome'>[];
}

export function UserManagementClient({
  initialUsuarios,
  initialTotal,
  empresas,
}: UserManagementClientProps) {
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const page = Number(searchParams.get('page')) || 1;
  const query = searchParams.get('query') || '';
  const role = searchParams.get('role') || 'TODOS';
  const status = searchParams.get('status') || 'TODOS';

  // Função para recarregar os dados, útil após uma edição no modal
  const fetchData = () => {
    const roleParam = role === 'TODOS' ? undefined : (role as RoleUsuario);
    const statusParam = status === 'TODOS' ? undefined : status;

    setIsLoading(true);
    listarTodosUsuariosAction({ page, query, role: roleParam, status: statusParam }).then(
      (result) => {
        if (result.success) {
          setUsuarios(result.items || []);
          setTotal(result.total || 0);
        }
        setIsLoading(false);
      }
    );
  };

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 500);

  const handleFilterChange = (key: 'role' | 'status', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value && value !== 'TODOS') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Atualiza a lista de usuários quando os dados iniciais (do servidor) mudam
  useEffect(() => {
    setUsuarios(initialUsuarios);
    setTotal(initialTotal);
  }, [initialUsuarios, initialTotal]);

  return (
    <>
      <UserFilters
        query={query}
        role={role}
        status={status}
        onSearch={debouncedSearch}
        onRoleChange={(value) => handleFilterChange('role', value)}
        onStatusChange={(value) => handleFilterChange('status', value)}
      />

      <UserTable
        usuarios={usuarios}
        isLoading={isLoading}
        onOpenActionsModal={(user) => {
          setSelectedUser(user);
          setIsModalOpen(true);
        }}
      />

      <PaginationControls
        page={page}
        totalPages={Math.ceil(total / 10)}
        onPageChange={handlePageChange}
      />

      <UserActionsModal
        user={selectedUser}
        empresas={empresas}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUserUpdate={fetchData}
      />
    </>
  );
}
