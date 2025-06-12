// src/utils/formatters.ts

/**
 * Formata uma data para o formato 'DD/MM/YYYY'.
 * @param date Data a ser formatada (Date object, string de data ou null/undefined).
 * @returns String formatada ou uma string vazia/indicador se a data for inválida.
 */
export function formatarData(date: Date | string | null | undefined): string {
  if (!date) return ''; // Retorna string vazia para null/undefined/vazio

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      // Verifica se a data é válida
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return 'Erro na data';
  }
}

/**
 * Formata uma data para o formato 'Mês Ano' (ex: 'Junho 2023').
 * Útil para campos de mês/ano como em experiência ou formação.
 * @param date Data a ser formatada.
 * @returns String formatada ou uma string vazia se a data for inválida.
 */
export function formatarMesAno(date: Date | string | null | undefined): string {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    return d.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC', // Importante para consistência com datas do Prisma
    });
  } catch (e) {
    console.error('Erro ao formatar mês/ano:', e);
    return 'Erro na data';
  }
}
