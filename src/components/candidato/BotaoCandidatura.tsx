'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { createCandidaturaAction } from '@/actions/candidaturaActions';
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

interface BotaoCandidaturaProps {
  vagaId: string;
  telefoneCandidato: string | null;
}

export function BotaoCandidatura({ vagaId, telefoneCandidato }: BotaoCandidaturaProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const proceedWithApplication = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);

    const result = await createCandidaturaAction(vagaId);

    if (result.success) {
      toast.success('Candidatura realizada com sucesso!');
      router.push('/candidato/candidaturas');
    } else {
      toast.error(result.error || 'Falha ao se candidatar.');
    }

    setIsLoading(false);
  };

  const handleApplyClick = () => {
    if (!telefoneCandidato) {
      setIsDialogOpen(true);
    } else {
      proceedWithApplication();
    }
  };

  if (!telefoneCandidato) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleApplyClick} disabled={isLoading} className='w-full sm:w-auto'>
            {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Candidatar-se Agora'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='text-yellow-500' />
              Aviso Importante
            </DialogTitle>
            <DialogDescription className='pt-4'>
              Percebemos que você não possui um número de telefone cadastrado em seu currículo. Sem
              essa informação, os recrutadores não conseguirão entrar em contato por telefone ou
              WhatsApp.
              <br />
              <br />O que você gostaria de fazer?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
            <DialogClose asChild>
              <Button type='button' variant='secondary'>
                Cancelar
              </Button>
            </DialogClose>
            <Button type='button' variant='outline' asChild>
              <Link href='/candidato/dashboard'>Editar Currículo</Link>
            </Button>
            <Button type='button' onClick={proceedWithApplication} variant='destructive'>
              Prosseguir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button
      onClick={handleApplyClick}
      disabled={isLoading}
      variant='default'
      className='w-full sm:w-auto'
    >
      {isLoading ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Enviando...
        </>
      ) : (
        'Candidatar-se Agora'
      )}
    </Button>
  );
}
