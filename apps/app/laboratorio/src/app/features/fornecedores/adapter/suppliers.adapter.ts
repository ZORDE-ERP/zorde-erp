import { Injectable } from '@angular/core';
import { Supplier, SuppliersSummary } from '../models/supplier.model';
import { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersAdapter {
  
  calculateSummary(suppliers: Supplier[]): SuppliersSummary {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers
    };
  }

  buildSummaryCards(summary: SuppliersSummary): SummaryCardItem[] {
    return [
      {
        title: 'Total de Fornecedores',
        value: summary.totalSuppliers,
        icon: 'lucideUsers',
        variant: 'default'
      },
      {
        title: 'Ativos',
        value: summary.activeSuppliers,
        icon: 'lucideUserCheck',
        variant: 'success'
      },
      {
        title: 'Inativos',
        value: summary.inactiveSuppliers,
        icon: 'lucideUserX',
        variant: 'destructive'
      }
    ];
  }

  formatDocument(document: string, type: 'FISICA' | 'JURIDICA'): string {
    const cleanDoc = document.replace(/\D/g, '');
    
    if (type === 'FISICA') {
      if (cleanDoc.length === 11) {
        return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
    } else {
      if (cleanDoc.length === 14) {
        return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
    }
    return document;
  }

  formatContact(contact: string): string {
    const cleanContact = contact.replace(/\D/g, '');
    if (cleanContact.length === 11) {
      return cleanContact.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanContact.length === 10) {
      return cleanContact.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return contact;
  }
  
  getStatusLabel(status: 'ACTIVE' | 'INACTIVE'): string {
    return status === 'ACTIVE' ? 'Ativo' : 'Inativo';
  }
}
