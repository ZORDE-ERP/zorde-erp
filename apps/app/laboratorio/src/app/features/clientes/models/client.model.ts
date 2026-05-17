export type ClientType = 'FISICA' | 'JURIDICA';
export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  email: string;
  contact: string;
  document: string;
  status: ClientStatus;
  zipCode: string;
  street: string;
  neighborhood: string;
  state: string;
  city: string;
  number: string;
  notes?: string;
}

export interface ClientsSummary {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
