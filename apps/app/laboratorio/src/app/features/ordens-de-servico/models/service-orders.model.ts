import { TipoServico } from '@zorde/shared-types';

export type ServiceType = TipoServico;

export interface ServiceOrder {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  serviceType: ServiceType | null;
  tabelaMontagemId: string | null;
  tabelaMontagemLabel: string | null;
  assemblyValue: number;
  createdAt: string;
}

export interface ServiceOrderUpsert {
  code: string;
  clientId: string;
  tabelaMontagemId: string | null;
  assemblyValue: number;
}

export interface ServiceOrdersSummary {
  total: number;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface ServiceOrderClientOption {
  id: string;
  name: string;
}

export interface ServiceOrderTabelaMontagemOption {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: ServiceType;
  label: string;
  value: number;
}

export const SERVICE_TYPES: ServiceType[] = Object.values(TipoServico);

const toLabelCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [TipoServico.MontagemSimples]: toLabelCase(TipoServico.MontagemSimples),
  [TipoServico.Parafuso]: toLabelCase(TipoServico.Parafuso),
  [TipoServico.Transposicao]: toLabelCase(TipoServico.Transposicao),
  [TipoServico.Coloracao]: toLabelCase(TipoServico.Coloracao),
  [TipoServico.SomenteEncaixar]: toLabelCase(TipoServico.SomenteEncaixar),
};
