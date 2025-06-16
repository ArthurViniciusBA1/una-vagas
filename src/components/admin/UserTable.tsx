import { MoreHorizontal, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

interface UserTableProps {
  usuarios: any[];
  isLoading: boolean;
  onOpenActionsModal: (user: any) => void;
}

export function UserTable({ usuarios, isLoading, onOpenActionsModal }: UserTableProps) {
  return (
    <div className='bg-card border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[300px]'>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead className='w-[150px]'>RA</TableHead>
            <TableHead className='w-[150px]'>Tipo</TableHead>
            <TableHead className='w-[180px]'>Data de Cadastro</TableHead>
            <TableHead className='w-[100px] text-center'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className='h-24 text-center'>
                <Loader2 className='mx-auto h-6 w-6 animate-spin' />
              </TableCell>
            </TableRow>
          ) : usuarios.length > 0 ? (
            usuarios.map((user) => (
              <TableRow
                key={user.id}
                className={cn(!user.ativo && 'bg-muted/50 text-muted-foreground')}
              >
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-2'>
                    {user.ativo ? (
                      <CheckCircle2 className='h-4 w-4 text-green-500' />
                    ) : (
                      <XCircle className='h-4 w-4 text-destructive' />
                    )}
                    {user.nome}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.numeroRA || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant='outline' className='capitalize'>
                    {user.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatarData(user.criadoEm)}</TableCell>
                <TableCell className='text-center'>
                  <Button variant='ghost' size='icon' onClick={() => onOpenActionsModal(user)}>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className='h-24 text-center'>
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
