import { BriefcaseBusiness, FileWarning } from 'lucide-react';
import { notFound } from 'next/navigation';

import { fetchVagaForEdit } from '@/actions/vagaActions';
import { VagaForm } from '@/components/empresa/VagaForm';

interface EditarVagaPageProps {
  params: Promise<{
    vagaId: string;
  }>;
}

export default async function EditarVagaPage({ params }: EditarVagaPageProps) {
  const { vagaId } = await params;
  const result = await fetchVagaForEdit(vagaId);

  if (!result.success) {
    if (result.error === 'Vaga não encontrada.') {
      notFound();
    }

    return (
      <div className='flex flex-col items-center justify-center text-center p-8 my-10 bg-card border rounded-lg'>
        <FileWarning size={48} className='text-destructive mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Acesso Negado</h2>
        <p className='text-muted-foreground'>{result.error}</p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <BriefcaseBusiness size={32} /> Editar Vaga
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Ajuste os detalhes da sua oportunidade.
        </p>
      </header>

      <VagaForm dadosIniciais={result.vaga} />
    </div>
  );
}
