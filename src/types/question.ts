export interface Taxonomia {
  disciplina: string;
  bloco?: string;
  topico?: string;
  subtopico?: string;
}

export interface TextoAssociado {
  id_texto?: string;
  titulo?: string;
  conteudo: string;
  imagem?: string;
}

export interface SuporteMidia {
  imagem_inicio?: string;
  imagem_meio?: string;
  imagem_fim?: string;
  layout_imagem?: string;
}

export interface Alternativa {
  chave: string;
  texto?: string;
  imagem?: string;
}

export interface Question {
  id: string;
  banca?: string;
  orgao?: string;
  cargo?: string;
  ano: number;
  taxonomia: Taxonomia;
  texto_associado?: TextoAssociado;
  suporte_midia?: SuporteMidia;
  enunciado_inicio?: string;
  enunciado_fim?: string;
  alternativas: Alternativa[];
  gabarito: string;
  explicacao?: string;
}