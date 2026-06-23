import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'app-produtos',
  imports: [FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos {
  // estado da busca
  search = signal('');

  // valor derivado
  query = computed(() => this.search().trim());

  // resource reativo
  produtos = httpResource<any[]>(() => {
    const q = this.query();

    if (q.length < 2) {
      return undefined;
    }

    return {
      url: 'http://localhost:3000/produtos',
      params: {
        search: q,
      },
    };
  });
}