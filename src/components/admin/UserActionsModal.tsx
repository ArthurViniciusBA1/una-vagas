'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, KeyRound, Trash2, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import { Empresa } from '@prisma/client';
import { toast } from 'sonner';

import { EditarUsuarioForm } from '@/components/admin/EditarUsuarioForm';
import { SimplePasswordChangeForm } from '@/components/admin/SimplePasswordChangeForm';
import { Button } from '@/components/ui/button';
import { adminToggleUsuarioAtivoAction } from '@/actions/adminActions';

interface UserActionsModalProps {
  user: any | null;
  empresas: Pick<Empresa, 'id' | 'nome'>[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: () => void;
}

export function UserActionsModal({
  user,
  empresas,
  isOpen,
  onOpenChange,
  onUserUpdate,
}: UserActionsModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  const handleToggleAtivo = () => {
    startTransition(async () => {
      const result = await adminToggleUsuarioAtivoAction(user.id);
      if (result.success) {
        const acao = result.data.novoStatus ? 'reativado' : 'inativado';
        toast.success(`Usuário ${acao} com sucesso!`);
        onUserUpdate();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Falha ao alterar status.');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Ações para: {user.nome}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue='editar' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='editar'>
              <UserCog className='h-4 w-4 mr-2' />
              Editar
            </TabsTrigger>
            <TabsTrigger value='senha'>
              <KeyRound className='h-4 w-4 mr-2' />
              Senha
            </TabsTrigger>
            <TabsTrigger
              value='inativar'
              className='data-[state=active]:bg-destructive/90 data-[state=active]:text-destructive-foreground'
            >
              {user.ativo ? (
                <UserX className='h-4 w-4 mr-2' />
              ) : (
                <UserCheck className='h-4 w-4 mr-2' />
              )}
              {user.ativo ? 'Inativar' : 'Reativar'}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='editar' className='py-4'>
            <EditarUsuarioForm
              usuario={user}
              empresas={empresas}
              setDialogOpen={onOpenChange}
              onUserUpdate={onUserUpdate}
            />
          </TabsContent>
          <TabsContent value='senha' className='py-4'>
            <SimplePasswordChangeForm usuarioId={user.id} setDialogOpen={onOpenChange} />
          </TabsContent>
          <TabsContent value='inativar' className='py-4 space-y-4'>
            <div className='p-4 bg-destructive/10 border-l-4 border-destructive text-destructive'>
              <div className='flex'>
                <div className='py-1'>
                  <AlertTriangle className='h-5 w-5 mr-3' />
                </div>
                <div>
                  <p className='font-bold'>Atenção</p>
                  <p className='text-sm'>
                    {user.ativo
                      ? 'Inativar um usuário impedirá que ele acesse a plataforma. Ele não será excluído.'
                      : 'Reativar um usuário permitirá que ele volte a acessar a plataforma normalmente.'}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex justify-end'>
              <DialogClose asChild>
                <Button
                  variant={user.ativo ? 'destructive' : 'secondary'}
                  onClick={handleToggleAtivo}
                  disabled={isPending}
                >
                  {user.ativo ? 'Confirmar Inativação' : 'Confirmar Reativação'}
                </Button>
              </DialogClose>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
