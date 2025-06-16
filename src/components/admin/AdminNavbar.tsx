'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/LogoutButton';

export function AdminNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/admin/empresas', label: 'Empresas', icon: Building },
  ];

  return (
    <nav className='bg-card border-b border-border p-4 shadow-sm sticky top-0 z-40'>
      <div className='container mx-auto flex justify-between items-center max-w-screen-xl'>
        <div className='text-lg font-semibold text-primary flex items-center gap-2'>
          <Shield size={22} />
          <Link href='/admin/dashboard'>Painel do Administrador</Link>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1 md:gap-2'>
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
                size='sm'
                className='px-2 md:px-3'
              >
                <Link href={link.href} className='flex items-center'>
                  <link.icon size={16} className='md:mr-2' />
                  <span className='hidden md:inline'>{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
          <LogoutButton variant='outline' size='sm' className='hover:bg-destructive' />
        </div>
      </div>
    </nav>
  );
}
