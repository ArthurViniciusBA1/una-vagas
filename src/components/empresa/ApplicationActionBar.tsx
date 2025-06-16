'use client';

import { Check, ThumbsDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { updateCandidaturaStatusAction } from '@/actions/candidaturaActions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { StatusCandidatura } from '@prisma/client';

interface ApplicationActionBarProps {
  candidaturaId: string;
  statusAtual: StatusCandidatura;
}

export function ApplicationActionBar({ candidaturaId, statusAtual }: ApplicationActionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (novoStatus: StatusCandidatura) => {
    startTransition(async () => {
      const result = await updateCandidaturaStatusAction(candidaturaId, novoStatus);
      if (result.success) {
        toast.success(`Candidatura marcada como ${novoStatus.toLowerCase()}!`);
        router.refresh(); // Recarrega os dados da página para refletir o novo status
      } else {
        toast.error(result.error || 'Falha ao atualizar status.');
      }
    });
  };

  const isFinalizado = statusAtual === 'APROVADO' || statusAtual === 'REJEITADO';

  return (
    <div className='p-4 bg-card border rounded-lg shadow-sm space-y-4'>
      <h3 className='font-semibold'>Ações do Recrutador</h3>
      <div className='flex flex-col gap-2'>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={isPending || isFinalizado}
              className='bg-green-600 hover:bg-green-700'
            >
              <Check className='mr-2 h-4 w-4' /> Aprovar Candidato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprovar Candidato</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja aprovar este candidato para a vaga? Esta ação não pode
                ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type='button' variant='secondary'>
                  Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type='button'
                  onClick={() => handleUpdateStatus('APROVADO')}
                  className='bg-green-600 hover:bg-green-700'
                >
                  Confirmar Aprovação
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant='destructive' disabled={isPending || isFinalizado}>
              <X className='mr-2 h-4 w-4' /> Rejeitar Candidato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Candidato</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja rejeitar este candidato? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type='button' variant='secondary'>
                  Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type='button'
                  onClick={() => handleUpdateStatus('REJEITADO')}
                  variant='destructive'
                >
                  Confirmar Rejeição
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {isFinalizado && (
        <p className='text-xs text-center text-muted-foreground'>
          Esta candidatura já foi finalizada.
        </p>
      )}
    </div>
  );
}
