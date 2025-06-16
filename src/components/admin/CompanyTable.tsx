'use client';

import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatarData } from '@/lib/formatters';

interface CompanyTableProps {
  empresas: any[];
  isLoading: boolean;
  onOpenActionsModal: (empresa: any) => void;
}

export function CompanyTable({ empresas, isLoading, onOpenActionsModal }: CompanyTableProps) {
  return (
    <div className='bg-card border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Empresa</TableHead>
            <TableHead className='w-[200px]'>CNPJ</TableHead>
            <TableHead className='w-[200px]'>Data de Cadastro</TableHead>
            <TableHead className='w-[100px] text-center'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className='h-24 text-center'>
                <Loader2 className='mx-auto h-6 w-6 animate-spin' />
              </TableCell>
            </TableRow>
          ) : empresas.length > 0 ? (
            empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell className='font-medium'>{empresa.nome}</TableCell>
                <TableCell>{empresa.cnpj || 'N/A'}</TableCell>
                <TableCell>{formatarData(empresa.criadoEm)}</TableCell>
                <TableCell className='text-center'>
                  <Button variant='ghost' size='icon' onClick={() => onOpenActionsModal(empresa)}>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className='h-24 text-center'>
                Nenhuma empresa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
