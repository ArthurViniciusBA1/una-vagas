'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { VagaForm } from '@/components/empresa/VagaForm';

export default function CriarVagaPage() {
  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <BriefcaseBusiness size={32} /> Publicar Nova Vaga
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Preencha os detalhes para divulgar uma nova oportunidade.
        </p>
      </header>

      <VagaForm />
    </div>
  );
}
