// src/components/curriculo/FloatingEditButton.tsx
'use client';

import { Pencil, Eye, LucideIcon } from 'lucide-react'; // Mantenha LucideIcon para tipagem base
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react'; // Importar React para usar React.ElementType

interface FloatingEditButtonProps {
  isEditMode: boolean;
  onButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // Mude o tipo de iconComponent para React.ElementType
  iconComponent: React.ElementType; // <<<<<<<<<< CORREÇÃO AQUI
}

export function FloatingEditButton({ isEditMode, onButtonClick, iconComponent }: FloatingEditButtonProps) {

  const [animateButton, setAnimateButton] = useState(false);

  // Mude o tipo de currentIcon para React.ElementType
  // O React.ElementType é mais abrangente e aceita funções de componente.
  const [currentIcon, setCurrentIcon] = useState<React.ElementType>(isEditMode ? Eye : Pencil); // <<<<<<<<<< CORREÇÃO AQUI

  useEffect(() => {
    // A lógica de animação de giro do ícone permanece a mesma
    // Setando o ícone, que é do tipo LucideIcon, em um estado de React.ElementType
    setAnimateButton(true); // Reutilizamos o animateButton para o giro inicial, se necessário
    const timer = setTimeout(() => {
      setCurrentIcon(isEditMode ? Eye : Pencil); // Aqui, Pencil e Eye são LucideIcon, que são compatíveis com React.ElementType
      setAnimateButton(false); // Reseta a animação do botão (e pode ser usada para o ícone, se desejar)
    }, 200);

    return () => clearTimeout(timer);
  }, [isEditMode]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Lógica para a animação de bounce do botão no clique
    setAnimateButton(true);
    const bounceTimer = setTimeout(() => {
      setAnimateButton(false);
    }, 300);

    onButtonClick(event); // Chama a função de transformação passada pelo pai

    // Não limpar o bounceTimer aqui com return, pois ele já é limpo no setTimeout
  };

  // O IconComponent já é o currentIcon, que agora está tipado corretamente
  const IconComponent = iconComponent; // Usa o ícone passado via prop, que também é React.ElementType

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50
                 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none
                 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                 flex items-center justify-center transition-all duration-300 ease-in-out
                 ${animateButton ? 'animate-button-bounce' : ''}`}
      aria-label={isEditMode ? "Sair do modo de edição" : "Entrar no modo de edição"}
      style={{ width: '3rem', height: '3rem' }}
    >
      {/* O ícone será renderizado normalmente, já que IconComponent é um React.ElementType */}
      <IconComponent className={`h-6 w-6`} />
    </button>
  );
}