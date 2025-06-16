'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { adminMudarSenhaUsuarioAction, procurarUsuariosAction } from '@/actions/adminActions';
import { mudarSenhaAdminSchema, tMudarSenhaAdmin } from '@/schemas/adminSchema';
import { FloatingLabelInput } from '../custom/FloatingLabelInput';

export function MudarSenhaAdminForm() {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [users, setUsers] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<tMudarSenhaAdmin>({
    resolver: zodResolver(mudarSenhaAdminSchema),
    defaultValues: { novaSenha: '', confirmarNovaSenha: '' },
  });

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setLoading(true);
        const result = await procurarUsuariosAction(searchTerm);
        if (result.success) {
          setUsers(result.data || []);
        }
        setLoading(false);
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const onSubmit = async (data: tMudarSenhaAdmin) => {
    if (!selectedUser) {
      toast.error('Nenhum usuário selecionado.');
      return;
    }
    const toastId = toast.loading('Alterando senha...');
    const result = await adminMudarSenhaUsuarioAction(selectedUser.id, data.novaSenha);
    if (result.success) {
      toast.success(`Senha do usuário ${selectedUser.nome} alterada com sucesso!`, { id: toastId });
      form.reset();
      setSelectedUser(null);
      setSearchTerm('');
      setUsers([]);
    } else {
      toast.error(result.error || 'Falha ao alterar senha.', { id: toastId });
    }
  };

  return (
    <div className='space-y-4'>
      <div>
        <Label>Procurar Usuário</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-full justify-between mt-2'
            >
              {selectedUser
                ? `${selectedUser.nome} (${selectedUser.email})`
                : 'Selecione um usuário...'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[400px] p-0'>
            <Command>
              <CommandInput
                placeholder='Digite para procurar...'
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? 'Procurando...' : 'Nenhum usuário encontrado.'}
                </CommandEmpty>
                <CommandGroup>
                  {loading && (
                    <div className='p-2 flex items-center justify-center'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  )}
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.email}
                      onSelect={() => {
                        setSelectedUser(user);
                        setOpen(false);
                      }}
                      className='aria-selected:bg-primary aria-selected:text-primary-foreground'
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedUser?.id === user.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className='flex flex-col'>
                        <span>{user.nome}</span>
                        <span className='text-xs text-muted-foreground'>{user.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedUser && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='p-4 border rounded-lg space-y-4'>
            <p className='text-sm font-medium'>
              Redefinir senha para: <span className='text-primary'>{selectedUser.nome}</span>
            </p>
            <FormField
              control={form.control}
              name='novaSenha'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label='Nova Senha'
                      id='novaSenha'
                      type='password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmarNovaSenha'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label='Confirmar Nova Senha'
                      id='confirmarNovaSenha'
                      type='password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Alterar Senha
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
