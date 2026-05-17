import { Injectable } from '@angular/core';
import { Client, ClientsSummary } from '../models/client.model';
import { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsAdapter {
  
  calculateSummary(clients: Client[]): ClientsSummary {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
    const inactiveClients = totalClients - activeClients;

    return {
      totalClients,
      activeClients,
      inactiveClients
    };
  }

  buildSummaryCards(summary: ClientsSummary): SummaryCardItem[] {
    return [
      {
        title: 'Total de Clientes',
        value: summary.totalClients,
        icon: 'lucideUsers',
        variant: 'default'
      },
      {
        title: 'Ativos',
        value: summary.activeClients,
        icon: 'lucideUserCheck',
        variant: 'success'
      },
      {
        title: 'Inativos',
        value: summary.inactiveClients,
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
