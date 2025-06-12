import { CornerUpLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import Footer from '@/components/footer';

import FormLoginAdmin from './form';

export default function PaginaLoginAdmin() {
  return (
    <>
      <main className='relative w-full flex flex-col items-center justify-center gap-8 py-8 px-4'>
        <Link href='/' className='absolute left-2 top-4 md:left-4 md:top-6' aria-label='Voltar para a página inicial'>
          <CornerUpLeft size={25} />
        </Link>
        <div className='text-center'>
          <ShieldAlert size={40} className='mx-auto text-primary mb-4' />
          <h1 className='text-3xl font-extrabold uppercase'>Acesso Administrativo</h1>
          <p className='text-muted-foreground mt-2'>Use suas credenciais de administrador.</p>
        </div>
        <div className='w-full max-w-md'>
          <FormLoginAdmin />
        </div>
      </main>
      <Footer /> {/* O Footer será posicionado corretamente pelo RootLayout */}
    </>
  );
}
