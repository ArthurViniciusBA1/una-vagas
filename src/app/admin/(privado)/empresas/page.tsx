'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Building, PlusCircle } from 'lucide-react';

import { listarTodasEmpresasAction } from '@/actions/adminActions';
import { PaginationControls } from '@/components/admin/PaginationControls';
import { CompanyTable } from '@/components/admin/CompanyTable';
import { CompanyFilters } from '@/components/admin/CompanyFilters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NovaEmpresaForm } from '@/components/admin/NovaEmpresaForm';
import { EditarEmpresaForm } from '@/components/admin/EditarEmpresaForm';
import { Button } from '@/components/ui/button';

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const page = Number(searchParams.get('page')) || 1;
  const query = searchParams.get('query') || '';

  const fetchData = () => {
    setIsLoading(true);
    listarTodasEmpresasAction({ page, query }).then((result) => {
      if (result.success) {
        setEmpresas(result.items || []);
        setTotal(result.total || 0);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, query]);

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenEditModal = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setIsEditModalOpen(true);
  };

  return (
    <div className='container mx-auto py-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold flex items-center gap-3'>
          <Building /> Gestão de Empresas
        </h1>
        <p className='text-muted-foreground mt-1'>
          Visualize, filtre e gerencie todas as empresas da plataforma.
        </p>
      </header>

      <div className='flex items-center justify-between mb-6'>
        <CompanyFilters query={query} onSearch={debouncedSearch} />
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className='mr-2 h-4 w-4' /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[480px]'>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para criar uma nova empresa e seu primeiro usuário
                recrutador.
              </DialogDescription>
            </DialogHeader>
            <NovaEmpresaForm
              setDialogOpen={() => {
                setIsNewModalOpen(false);
                fetchData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CompanyTable
        empresas={empresas}
        isLoading={isLoading}
        onOpenActionsModal={handleOpenEditModal}
      />

      <PaginationControls
        page={page}
        totalPages={Math.ceil(total / 10)}
        onPageChange={handlePageChange}
      />

      {selectedEmpresa && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Empresa: {selectedEmpresa.nome}</DialogTitle>
            </DialogHeader>
            <EditarEmpresaForm
              empresa={selectedEmpresa}
              setDialogOpen={setIsEditModalOpen}
              onEmpresaUpdate={fetchData}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
