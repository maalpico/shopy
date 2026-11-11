/**
 * Convierte cualquier texto en un slug URL-safe normalizado.
 * Ejemplo: "¡Actuadores Neumáticos de 1/2" & Válvulas!" -> "actuadores-neumaticos-de-12-valvulas"
 */
export function generarSlug(texto: string): string {
  if (!texto) return '';

  return texto
    .toLowerCase()
    .trim()
    // Reemplazos específicos de idioma español
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    // Descompone caracteres con acentos en caracter base + diacrítico
    .normalize('NFD')
    // Elimina todos los bloques diacríticos (tildes, diéresis, etc.)
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplaza cualquier caracter que no sea letra alfanumérica inglesa o espacio por nada
    .replace(/[^a-z0-9\s-]/g, '')
    // Convierte espacios individuales o múltiples en un único guion
    .replace(/[\s_]+/g, '-')
    // Elimina guiones repetidos
    .replace(/-+/g, '-')
    // Elimina guiones al principio o al final
    .replace(/^-+|-+$/g, '');
}