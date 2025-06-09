"use client";

import type { VariantProps } from "class-variance-authority";
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';

interface LogoutButtonProps 
  extends React.ComponentProps<"button">,
          VariantProps<typeof buttonVariants> {
  onLogout?: () => void;
  asChild?: boolean;
}

export function LogoutButton({ 
  className, 
  variant, 
  size,   
  asChild,
  onLogout, 
  ...props 
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const toastId = toast.loading("Saindo da sua conta...");
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Logout realizado com sucesso!', { id: toastId });
        if (onLogout) {
          onLogout();
        }
        router.push('/entrar'); 
        router.refresh(); 
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Falha ao fazer logout.' }));
        toast.error(errorData.message || 'Falha ao fazer logout.', { id: toastId });
        console.error('Falha ao fazer logout:', res.status, errorData);
      }
    } catch (error) {
      toast.error('Erro ao tentar fazer logout.', { id: toastId });
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Button onClick={handleLogout} variant={variant} size={size} className={className} asChild={asChild} {...props}>
      <LogOut size={18} className="mr-2" />
      Sair
    </Button>
  );
}
