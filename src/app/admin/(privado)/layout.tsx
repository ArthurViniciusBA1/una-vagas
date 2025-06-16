import { redirect } from 'next/navigation';
import { RoleUsuario } from '@prisma/client';

import { authorizeUser } from '@/lib/auth.server';
import { AdminNavbar } from '@/components/admin/AdminNavbar';

interface AdminPrivadoLayoutProps {
  children: React.ReactNode;
}

export default async function AdminPrivadoLayout({ children }: AdminPrivadoLayoutProps) {
  const { isAuthorized } = await authorizeUser([RoleUsuario.ADMIN]);

  if (!isAuthorized) {
    const errorMessage = encodeURIComponent('Acesso restrito. Faça login como administrador.');
    redirect(`/admin/login?error=${errorMessage}`);
  }

  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <AdminNavbar />
      <main className='flex-grow container mx-auto px-4 py-6 md:py-8 max-w-screen-xl'>
        {children}
      </main>
    </div>
  );
}
