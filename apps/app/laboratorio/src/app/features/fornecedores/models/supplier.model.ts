export type SupplierType = 'FISICA' | 'JURIDICA';
export type SupplierStatus = 'ACTIVE' | 'INACTIVE';

export interface Supplier {
  id: string;
  type: SupplierType;
  name: string;
  email: string;
  contact: string;
  document: string;
  status: SupplierStatus;
  zipCode: string;
  street: string;
  neighborhood: string;
  state: string;
  city: string;
  number: string;
  notes?: string;
}

export interface SuppliersSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
