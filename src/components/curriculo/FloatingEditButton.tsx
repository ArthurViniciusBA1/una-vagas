// src/components/curriculo/FloatingEditButton.tsx
'use client';

import { Pencil, Eye, LucideIcon } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';

export function FloatingEditButton({ isEditMode }: { isEditMode: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [animateIcon, setAnimateIcon] = useState(false); // Estado para a animação de giro do ícone
  const [animateButton, setAnimateButton] = useState(false); // Novo estado para a animação de bounce do botão
  const [currentIcon, setCurrentIcon] = useState<LucideIcon>(isEditMode ? Eye : Pencil);

  useEffect(() => {
    // Lógica para a animação de giro do ícone quando o modo muda (já existia)
    setAnimateIcon(true);
    const timer = setTimeout(() => {
      setCurrentIcon(isEditMode ? Eye : Pencil);
      setAnimateIcon(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [isEditMode]);

  const handleToggleMode = () => {
    // Lógica para a animação de bounce do botão no clique
    setAnimateButton(true);
    const bounceTimer = setTimeout(() => {
      setAnimateButton(false);
    }, 300); // Duração da animação de bounce

    const currentSearchParams = new URLSearchParams(searchParams.toString());

    if (isEditMode) {
      currentSearchParams.delete('edit');
    } else {
      currentSearchParams.set('edit', 'true');
    }

    router.push(`${pathname}?${currentSearchParams.toString()}`);

    return () => clearTimeout(bounceTimer); // Limpar o timer se o componente desmontar
  };

  const IconComponent = currentIcon;

  return (
    <button
      onClick={handleToggleMode}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50
                 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none
                 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                 flex items-center justify-center transition-all duration-300 ease-in-out
                 ${animateButton ? 'animate-button-bounce' : ''}`}
      aria-label={isEditMode ? "Sair do modo de edição" : "Entrar no modo de edição"}
      style={{ width: '3rem', height: '3rem' }}
    >
      <IconComponent
        className={`h-6 w-6 transition-transform duration-400 ease-in-out
                   ${animateIcon ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`}
      />
    </button>
  );
}