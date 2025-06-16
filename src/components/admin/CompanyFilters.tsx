'use client';

import { Input } from '@/components/ui/input';

interface CompanyFiltersProps {
  query: string;
  onSearch: (term: string) => void;
}

export function CompanyFilters({ query, onSearch }: CompanyFiltersProps) {
  return (
    <Input
      placeholder='Buscar por nome ou CNPJ...'
      defaultValue={query}
      onChange={(e) => onSearch(e.target.value)}
      className='max-w-sm'
    />
  );
}
