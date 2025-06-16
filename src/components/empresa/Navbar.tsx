'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BriefcaseBusiness, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/LogoutButton';

export function EmpresaNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/empresa/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/empresa/vagas', label: 'Minhas Vagas', icon: BriefcaseBusiness },
    { href: '/empresa/candidaturas', label: 'Candidaturas', icon: Users },
    { href: '/empresa/perfil-empresa', label: 'Perfil Empresa', icon: Building2 },
  ];

  return (
    <nav className='bg-card border-b border-border p-4 shadow-sm sticky top-0 z-40'>
      <div className='container mx-auto flex justify-between items-center max-w-screen-xl'>
        <div className='text-lg font-semibold text-primary'>
          <Link href='/empresa/dashboard'>Portal da Empresa</Link>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1 md:gap-2'>
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={pathname === link.href ? 'secondary' : 'ghost'}
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
