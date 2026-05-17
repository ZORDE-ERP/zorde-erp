export enum TipoServico {
  MontagemSimples = 'MONTAGEM SIMPLES',
  Parafuso = 'PARAFUSO',
  Transposicao = 'TRANSPOSICAO',
  Coloracao = 'COLORACAO',
  SomenteEncaixar = 'SOMENTE ENCAIXAR',
}

export interface TabelaMontagem {
  id: number;
  clienteId: number;
  nomeCliente: string;
  servico: TipoServico;
  valor: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TabelaMontagemListResponse {
  items: TabelaMontagem[];
  total: number;
}

export interface CreateTabelaMontagemDto {
  clienteId: number;
  servico: TipoServico;
  valor: number;
}

export interface UpdateTabelaMontagemDto {
  clienteId: number;
  servico: TipoServico;
  valor: number;
}
