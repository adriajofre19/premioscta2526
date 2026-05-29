export const CATEGORIAS_ARBITRO = [
  { value: 'tercera-federacio', label: 'Tercera Federació' },
  { value: 'primera-catalana', label: 'Primera Catalana' },
  { value: 'segona-catalana', label: 'Segona Catalana' },
  { value: 'tercera-catalana', label: 'Tercera Catalana' },
  { value: 'quarta-catalana', label: 'Quarta Catalana' },
] as const;

export type CategoriaArbitro = (typeof CATEGORIAS_ARBITRO)[number]['value'];

const valores = new Set<string>(CATEGORIAS_ARBITRO.map((c) => c.value));

export function esCategoriaValida(categoria: string): categoria is CategoriaArbitro {
  return valores.has(categoria);
}
