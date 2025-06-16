'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className='flex items-center justify-end space-x-2 py-4'>
      <span className='text-sm text-muted-foreground'>
        Página {page} de {totalPages}
      </span>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className='h-4 w-4' /> Anterior
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Próxima <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
