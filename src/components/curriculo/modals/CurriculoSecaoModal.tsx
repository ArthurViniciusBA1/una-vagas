'use client';

import React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CurriculoSecaoModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  dialogContentClassName?: string;
}

export function CurriculoSecaoModal({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
  dialogContentClassName = 'sm:max-w-lg',
}: CurriculoSecaoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn(dialogContentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
