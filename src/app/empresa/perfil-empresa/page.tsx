import { Building2, FileWarning } from 'lucide-react';

import { fetchEmpresaForEdit } from '@/actions/empresaActions';
import { EmpresaProfileForm } from '@/components/empresa/EmpresaProfileForm';

export default async function PaginaPerfilEmpresa() {
  const { empresa, error } = await fetchEmpresaForEdit();

  if (error || !empresa) {
    return (
      <div className='flex flex-col items-center justify-center text-center p-8 my-10 bg-card border rounded-lg'>
        <FileWarning size={48} className='text-destructive mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Erro ao Carregar Perfil</h2>
        <p className='text-muted-foreground'>
          {error || 'Não foi possível encontrar os dados da empresa.'}
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <Building2 size={32} /> Perfil da Empresa
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Mantenha os dados da sua empresa sempre atualizados.
        </p>
      </header>
      <EmpresaProfileForm initialData={empresa} />
    </div>
  );
}
