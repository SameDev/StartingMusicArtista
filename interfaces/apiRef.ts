export interface Music {
  id: number;
  nome: string;
  artista: string;
  image_url: string;
  url: string;
  tags: Tags[]; // Correção aqui
  artistaId: string[];
}

export interface User {
  id: number;
  email: string;
  nome: string;
  cargo: string;
  foto_perfil: string;
  data_nasc: Date;
  songs: Music[]
}

export interface Tags {
  id: number;
  nome: string;
  ativo: boolean;
}

