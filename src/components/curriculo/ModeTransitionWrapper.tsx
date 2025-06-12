'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FloatingEditButton } from './FloatingEditButton'; // Importe o botão flutuante
import { Pencil, Eye } from 'lucide-react'; // Para o ícone do botão

interface ModeTransitionWrapperProps {
  children: ReactNode; // O conteúdo da página do currículo
  isEditMode: boolean; // O modo atual da página
  isOwner: boolean; // Se o usuário logado é o dono do currículo
}

export function ModeTransitionWrapper({ children, isEditMode, isOwner }: ModeTransitionWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado para controlar a animação de expansão da "cortina"
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Transição da página atual para a próxima (expandir)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false); // Transição da próxima página para a atual (retrair)
  const [showOverlay, setShowOverlay] = useState(false); // Controla a visibilidade da camada de overlay
  const [overlayStyle, setOverlayStyle] = useState({}); // Estilo dinâmico para a animação de expansão
  const [iconToDisplay, setIconToDisplay] = useState<React.ElementType>(isEditMode ? Eye : Pencil); // Ícone para o FAB

  // Efeito para atualizar o ícone do FAB
  useEffect(() => {
    setIconToDisplay(isEditMode ? Eye : Pencil);
  }, [isEditMode]);

  const handleToggleMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Pega a posição do clique para animar a partir dali
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setOverlayStyle({
      top: `${centerY}px`,
      left: `${centerX}px`,
      transform: 'translate(-50%, -50%) scale(0)',
      borderRadius: '50%',
      width: '0px',
      height: '0px',
    });

    setShowOverlay(true);
    setIsAnimatingOut(true); // Inicia a animação de expansão

    // Após um curto período, a "cortina" se expande
    setTimeout(() => {
      const currentSearchParams = new URLSearchParams(searchParams.toString());
      if (isEditMode) {
        currentSearchParams.delete('edit');
      } else {
        currentSearchParams.set('edit', 'true');
      }
      // Navega para a nova URL enquanto a animação está em andamento
      router.push(`${pathname}?${currentSearchParams.toString()}`);
    }, 50); // Inicia a navegação um pouco depois da animação

    // Define o estado para a animação de retração na nova página
    // Isso é mais complexo, pois a animação de retração precisa acontecer na nova página
    // O ideal seria controlar isso com um contexto ou estado global, mas para manter simples
    // faremos a animação de "saída" e esperamos que a nova página comece com a animação de "entrada"
    // ou que o estado seja resetado via props.
  };

  // Este useEffect lida com a animação de entrada (quando a página recarrega para o novo modo)
  // Ele executa apenas uma vez ao montar o componente na nova URL
  useEffect(() => {
    if (showOverlay && isAnimatingOut) {
      // Se estava animando para fora, agora anima para dentro
      setIsAnimatingOut(false); // Para a animação de saída
      setIsAnimatingIn(true); // Começa a animação de entrada

      const timer = setTimeout(() => {
        setIsAnimatingIn(false);
        setShowOverlay(false); // Remove o overlay após a animação de entrada
      }, 500); // Duração da animação de retração

      return () => clearTimeout(timer);
    }
  }, [isEditMode, showOverlay, isAnimatingOut]);

  return (
    <>
      {/* A camada de overlay que faz a animação de expansão/retração */}
      {showOverlay && (
        <div className={`fixed inset-0 bg-blue-500 z-[9999] transition-all ease-in-out duration-500`} style={overlayStyle}>
          {/* Este div se expandirá */}
          {/* Quando a animação de saída termina, ele se expande completamente */}
          {isAnimatingOut && (
            <div className='absolute inset-0 bg-blue-500' style={{ transform: 'scale(200)', borderRadius: '0' }} />
          )}
          {/* Quando a animação de entrada começa na nova página, ele se retrai */}
          {isAnimatingIn && (
            <div
              className='absolute inset-0 bg-blue-500'
              style={{ transform: 'scale(0)', borderRadius: '50%', transitionDuration: '500ms' }}
            />
          )}
        </div>
      )}
      {children} {/* Conteúdo principal do currículo */}
      {/* Botão flutuante só aparece se o usuário for o dono */}
      {isOwner && (
        <FloatingEditButton
          isEditMode={isEditMode}
          onButtonClick={handleToggleMode} // Passa a função de toggle para o botão
          iconComponent={iconToDisplay} // Passa o ícone atual para o botão
        />
      )}
    </>
  );
}
