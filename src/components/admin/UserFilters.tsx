'use client';

import { RoleUsuario } from '@prisma/client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFiltersProps {
  query: string;
  role: string;
  status: string;
  onSearch: (term: string) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
}

export function UserFilters({
  query,
  role,
  status,
  onSearch,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className='flex flex-wrap items-center gap-4 mb-6'>
      <Input
        placeholder='Buscar por nome, e-mail ou RA...'
        defaultValue={query}
        onChange={(e) => onSearch(e.target.value)}
        className='max-w-sm'
      />
      <Select onValueChange={onRoleChange} value={role}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Filtrar por tipo' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='TODOS'>Todos os Tipos</SelectItem>
          <SelectItem value='CANDIDATO'>Candidato</SelectItem>
          <SelectItem value='RECRUTADOR'>Recrutador</SelectItem>
          <SelectItem value='ADMIN'>Admin</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onStatusChange} value={status}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Filtrar por status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='TODOS'>Todos os Status</SelectItem>
          <SelectItem value='ATIVO'>Apenas Ativos</SelectItem>
          <SelectItem value='INATIVO'>Apenas Inativos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
