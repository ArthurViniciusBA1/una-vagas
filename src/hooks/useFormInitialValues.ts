'use client';

import { useMemo } from 'react';

function formatObjectForForm<T extends object>(data: T): Partial<T> {
  const formattedEntries = Object.entries(data).map(([key, value]) => {
    if (value === null) {
      return [key, ''];
    }
    if (value instanceof Date) {
      // Ajuste: Formatar para 'AAAA-MM' para inputs type="month"
      // O fuso horário UTC é usado para evitar problemas de off-by-one-day.
      const date = new Date(value);
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      return [key, `${year}-${month}`];
    }
    return [key, value];
  });

  return Object.fromEntries(formattedEntries);
}

export function useFormInitialValues<T extends object>(initialData: T | null | undefined, defaultValues: T): T {
  return useMemo(() => {
    if (initialData) {
      return {
        ...defaultValues,
        ...formatObjectForForm(initialData),
      };
    }
    return defaultValues;
    // A dependência deve ser apenas `initialData`, pois `defaultValues` pode ser um novo objeto a cada render.
  }, [initialData]);
}
