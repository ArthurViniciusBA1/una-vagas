'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { NovaEmpresaForm } from '@/components/admin/NovaEmpresaForm';

interface NewCompanyDialogProps {
  onCompanyCreated: () => void;
}

export function NewCompanyDialog({ onCompanyCreated }: NewCompanyDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    onCompanyCreated();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' /> Nova Empresa
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova empresa e seu primeiro usuário recrutador.
          </DialogDescription>
        </DialogHeader>
        <NovaEmpresaForm setDialogOpen={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
