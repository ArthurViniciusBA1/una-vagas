'use client';

import { ListChecks } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function FloatingRequirements({ requisitos }: { requisitos: string[] }) {
  if (!requisitos || requisitos.length === 0) {
    return null;
  }

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <Popover>
        <PopoverTrigger asChild>
          <Button size='icon' className='rounded-full shadow-lg w-14 h-14'>
            <ListChecks size={24} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 mr-4'>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium leading-none'>Requisitos da Vaga</h4>
              <p className='text-sm text-muted-foreground'>
                Confira os requisitos para esta oportunidade.
              </p>
            </div>
            <div className='space-y-2'>
              <ul className='list-disc list-inside text-sm'>
                {requisitos.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
