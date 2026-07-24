export interface Taxonomia {
  disciplina: string;
  bloco?: string | null;
  topico?: string | null;
  subtopico?: string | null;
}

// Interface para o item dentro do seu arquivo JSON de textos (ex: textos_apoio.json)
export interface TextoApoioItem {
  id: string;
  titulo?: string | null;
  fonte?: string | null;
  conteudo: string;
}

export interface SuporteMidia {
  imagem_inicio?: string | null;
  imagem_meio?: string | null;
  imagem_fim?: string | null;
  layout_imagem?: string | null;
}

export interface Alternativa {
  chave: string;
  texto?: string | null;
  imagem?: string | null;
}

export interface Question {
  id: string;
  banca?: string | null;
  orgao?: string | null;
  cargo?: string | null;
  ano: number;
  taxonomia: Taxonomia;
  texto_associado?: string | null; // 👈 Agora é uma string simples ou null
  suporte_midia?: SuporteMidia | null;
  enunciado_inicio?: string | null;
  enunciado_fim?: string | null;
  alternativas: Alternativa[];
  gabarito: string;
  explicacao?: string | null;
}
