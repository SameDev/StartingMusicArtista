export interface Music {
  id: number;
  nome: string;
  artista: string;
  image_url: string;
  url: string;
  tags: Tags[];
  artistaId: string[];
  loadingBtn: boolean;
  data_lanc: Date;
}

export interface User {
  id: number;
  email: string;
  nome: string;
  cargo: string;
  foto_perfil: string;
  data_nasc: Date;
  songs: Music[];
  tags: Tags[];
}

export interface Tags {
  id: number;
  nome: string;
  ativo: boolean;
  musicas: Music[];
}

