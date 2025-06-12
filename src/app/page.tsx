'use client';

import { Briefcase, User, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <main className='flex w-full h-dvh flex-grow flex-col items-center justify-center p-4 md:p-6'>
        <div className='flex flex-col items-center text-center gap-10 md:gap-12'>
          <div className='flex flex-col gap-6 md:gap-8 items-center'>
            <Image src={'/LogoUNA.png'} width={150} height={150} alt={'Logo UNA'} />
            <span className='text-2xl font-extrabold uppercase md:text-3xl'>Bem-vindo(a) ao Portal de Vagas!</span>
          </div>

          <div className='flex w-full max-w-xs flex-col gap-6 text-center font-bold sm:max-w-sm'>
            <div className='flex flex-col gap-3'>
              <h2 className='text-lg font-semibold text-foreground'>Para Candidatos</h2>
              <Link
                href='/cadastro'
                className='relative flex h-12 items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              >
                <UserPlus size={22} className='absolute left-4' />
                <span>Criar Cadastro</span>
              </Link>
              <Link
                href='/entrar'
                className='relative flex h-12 items-center justify-center gap-2.5 rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              >
                <User size={22} color='grey' className='absolute left-4' />
                <span>Entrar como Candidato</span>
              </Link>
            </div>

            <div className='my-1 flex items-center'>
              <span className='flex-grow border-t border-border'></span>
              <span className='mx-3 text-xs uppercase text-muted-foreground'>Ou</span>
              <span className='flex-grow border-t border-border'></span>
            </div>

            <div className='flex flex-col gap-3'>
              <h2 className='text-lg font-semibold text-foreground'>Para Empresas</h2>
              <Link
                href='/login-empresa'
                className='relative flex h-12 items-center justify-center gap-2.5 rounded-full bg-secondary text-secondary-foreground shadow-md transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              >
                <Briefcase size={22} className='absolute left-4' />
                <span>Acesso Empresa/Recrutador</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
