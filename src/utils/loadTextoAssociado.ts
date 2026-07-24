import textosApoioData from '../data/textos/textos_apoio.json';
import type { TextoApoioItem } from '../types/question';

export function getTextoAssociadoById(
  textoId?: string | null
): TextoApoioItem | null {
  if (!textoId) return null;

  const textoEncontrado = (textosApoioData as TextoApoioItem[]).find(
    (item) => item.id === textoId
  );

  return textoEncontrado || null;
}
